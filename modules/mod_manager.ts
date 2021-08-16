//Manages main functions mod installation, downloading and removal.
import { BrowserWindow, dialog } from "electron";
import { promises } from "fs";
import path from "path";
import os from "os";
import https from "https";
import url from "url";
import Main from "../main";
import log from "electron-log";
import ProgressBar from "electron-progressbar";
import FileWriter from "./filewriter";
import FsExtensions from "./fs_extensions";
import config from "./config";
import filemanager from "./file_manager";
import GithubSource from "./mod_sources/github_source";
import GithubCollectionSource from "./mod_sources/github_collection_source";
import JsonListSource from "./mod_sources/jsonlist_source";
import { Install, ModList, ModListEntry, ModListLoader } from "./mod_list_loader";
import ModInstallSource from "./mod_sources/mod_source_base";
import Utilities from "./utilities";

const functionMap = new Map();

//Shared by all loading bar uis to set text colour.
const loadingTextStyle = {
    color: "ghostwhite"
};

type State = "NOT_INSTALLED" | "INSTALLED" | "UPDATE";

class DownloadedFile {
    buffer: Buffer;
    name: string;
    extension: string;

    constructor(buffer: Buffer, name: string){
        this.buffer = buffer;
        this.name = name;

        //Store the file extension now.
        this.extension = path.extname(this.name);
    }
}

class ModManager {

    //Export variables.
    public static all_mods_data: ModList;
    public static currentModData: ModListEntry;
    public static currentModVersion = 0;
    public static currentModState: State;
    public static currentModVersionRemote = 0;
    public static downloadWindow: BrowserWindow = null;
    public static files_object: any;
    public static source_manager: ModInstallSource;

    //Sets up the module.
    public static async Setup(){
        this.all_mods_data = ModListLoader.GetModList();
        return await filemanager.Init();
    }

    //Change the currently selected mod, return its installation button text.
    public static async ChangeCurrentMod(name: string){
        //Get this mods data and store it for use.
        this.currentModData = this.GetModDataByName(name);
        this.currentModVersion = this.GetCurrentModVersionFromConfig(name);
        this.currentModState = "NOT_INSTALLED";
        this.currentModVersionRemote = 0;

        log.log(`Set current mod to: "${this.currentModData.name}"`);

        //Setup the source manager object depending on the type of the mod.
        //If it is not a collection, create a list with one object (the install) in it
        switch(this.currentModData.install.type){
            case "jsonlist":
                this.source_manager = new JsonListSource([this.currentModData.install]);
                break;
            case "github":
                this.source_manager = new GithubSource([this.currentModData.install]);
                break;
            case "githubcollection":
                this.source_manager = new GithubCollectionSource(this.currentModData.items);
                break;
            default:
                this.source_manager = null;
                throw new Error(`Mod install type was not recognised: ${this.currentModData.install.type}. It may be new? Update to the latest version.`);
        }

        //We do not have a version for this mod. Method to use is install.
        if(this.currentModVersion == null || this.currentModVersion == 0){
            try {
                const version = await this.source_manager.GetLatestVersionNumber();
                this.currentModState = "NOT_INSTALLED";
                this.currentModVersionRemote = version;
                return "Install";
            } catch (e) {
                throw new Error("Failed to get mod version: " + e.toString());
            }
        }
        else {
            //We have a version, now we need to determine if there is an update or not.
            const version = await this.source_manager.GetLatestVersionNumber();

            //Compare the currently selected version number to this one. If ours is smaller, update. If not, do nothing.
            this.currentModVersionRemote = version;

            if (version > this.currentModVersion) {
                this.currentModState = "UPDATE";
            }
            else {
                this.currentModState = "INSTALLED";
            }

            //Time to resolve with the text to show on the button
            switch(this.currentModState){
                case "INSTALLED":
                    return "Installed";
                case "UPDATE":
                    return "Update";
                default:
                    return "Install";
            }
        }
    }

    //Trigger the correct response to the current mod depending on its state.
    //This is called when the Install / Update / Installed button is pressed in the UI.
    public static async ModInstallPlayButtonClick(args? : string){
        log.log("Install button was clicked! Reacting based on state: " + this.currentModState);
        if (this.currentModData == null){
            this.FakeClickMod();
            await ErrorDialog("Mod data was not able to be read.\nPlease report this error.", "Mod Install Start Error");
            return;
        }

        switch(this.currentModState){
            case "NOT_INSTALLED":
                //We should try to install this mod!
                //Before we try anything we need to validate the tf2 install directory. Otherwise downloading is a waste.

                log.log("Will validate TF2 path before starting download...");
                if(!await ValidateTF2Dir()){
                    this.FakeClickMod();
                    log.error("Ending install attempt now as validation failed!");
                    return;
                }
                log.log("TF2 Path was validated.");

                //Perform mod download and install.
                try {
                    //TS won't let me delete this bit
                    //Args is a string. Convert it to a number
                    const desiredCollectionVersion = Utilities.FindCollectionNumber(this.source_manager.data, args);

                    const _url = await this.source_manager.GetFileURL(desiredCollectionVersion);

                    log.log("Successfully got mod install file urls. Will proceed to try to download them.");
                    const result = await this.ModInstall(_url);
                    if(result){
                        //This is a function to separate the collections from the non-collections
                        if (IsCollection(this.source_manager.data)) {
                            await this.SetupNewModAsInstalled(args);
                        }
                        else {
                            await this.SetupNewModAsInstalled();
                        }
                    }
                } catch (e) {
                    this.FakeClickMod();
                    await ErrorDialog(e, "Mod Begin Install Error");
                }
                break;

            case "UPDATE":
                //We should try to update this mod!
                //Setup the message to include the version if we have the data.
                //Really we should for this state to be active but best to be sure.
                log.log("Asking user if they want to update this mod.");
                // This variable is not being used
                // let version = await this.source_manager.GetLatestVersionNumber();
                const displayVersion = await this.source_manager.GetDisplayVersionNumber();
                const update_msg = `Would you like to update this mod to version "${displayVersion}"?`;

                //Ask if the users wants to update or not
                const button = await dialog.showMessageBox(Main.mainWindow, {
                    type: "question",
                    title: "Update",
                    message: update_msg,
                    buttons: ["Yes", "Cancel"],
                    cancelId: 1
                });

                if(button.response == 0) {
                    //Do the update!
                    log.log("Starting update process...");

                    const configObj = await config.GetConfig();
                    const modList = configObj.current_mod_versions;
                    //Find the current mod version we want
                    let collectionVersionInstalled: string;
                    let desiredCollectionVersion: number;
                    if (IsCollection(this.source_manager.data)) {
                        //It is an install[] then
                        modList.forEach(element => {
                            if (element.name == this.source_manager.data[0].modname) {
                                //We've found our mod
                                collectionVersionInstalled = element.collectionversion;
                            }
                        });
                        desiredCollectionVersion = Utilities.FindCollectionNumber(this.source_manager.data, collectionVersionInstalled);
                        await this.UpdateCurrentMod(desiredCollectionVersion);
                    }
                }
                else {
                    this.FakeClickMod();
                }
                break;

            case "INSTALLED":
                log.log("Mod is installed, user initiated the game. Calling FakeClickMod func to reset the UI.");
                this.FakeClickMod();
                break;

            default:
                log.log("Something went wrong.")
                break;
        }
    }

    //Attempt an update. If possible then we do it. Will try to do it incrementally or a full re download.
    public static async UpdateCurrentMod(collectionVersion?: number) {
        //Validate tf2 dir, then make sure we have the current data for the mod.
        if (!await ValidateTF2Dir()) {
            this.FakeClickMod();
            return;
        }

        //Re validate the latest version is higher than ours.
        const version = await this.source_manager.GetLatestVersionNumber();

        try {
            //Compare the currently selected version number to this one. If ours is smaller, update. If not, do nothing.

            if (version > this.currentModVersion) {
                //Check mod type.
                if (this.currentModData.install.type == "jsonlist") {
                    //For an update, we will check if there is a list of update archives and try to create a list of ones to download.
                    //Then we can incrementally update hopefully and download a lot less.
                    const jsonSourceManager = <JsonListSource>this.source_manager;
                    const data = await jsonSourceManager.GetJsonData();

                    let urls;
                    if (data.hasOwnProperty("PatchUpdates") && data.PatchUpdates.length > 0) {
                        //There should be urls to patch zips for each update.
                        const patchObjects = data.PatchUpdates;
                        const patchURLS = [];
                        patchObjects.forEach((patch) => {
                            if (patch.Version > this.currentModVersion) {
                                patchURLS.push(patch);
                            }
                        });

                        //Sort the urls soo we apply updates from the oldest update to the newest.
                        patchURLS.sort((a, b) => {
                            //We want to sort smaller version numbers FIRST
                            //Soo they get applied first later.
                            if (a.Version > b.Version) {
                                return 1;
                            }
                            if (a.Version < b.Version) {
                                return -1;
                            }
                            return 0;
                        });

                        //Get out the urls for easier use later.
                        for (let i = 0; i < patchURLS.length; i++) {
                            urls.push(patchURLS[i].DownloadURL);
                        }
                    }

                    if(urls.length > 0) {
                        log.log("Incremental update will begin for current mod using the following archive urls: " + urls.toString());
                        const result = await this.ModInstall(urls);
                        if(result){
                            //Update the version for the mod.

                            SetNewModVersion(this.currentModVersionRemote, this.currentModData.name);

                            //Save the config changes.
                            await config.SaveConfig(Main.config);

                            this.FakeClickMod();

                            await dialog.showMessageBox(Main.mainWindow, {
                                type: "info",
                                title: "Mod Update",
                                message: `Mod update for "${this.currentModData.name}" was completed successfully.`,
                                buttons: ["OK"]
                            });
                        }
                    }
                    else {
                        //We need to update using the main zip. Not ideal but works.
                        log.warn("Update source does not have patch data! Will have to download again fully.");
                        const _url = await this.source_manager.GetFileURL();
                        const result = await this.ModInstall(_url);
                        if(result){
                            SetNewModVersion(this.currentModVersionRemote, this.currentModData.name);

                            //Save the config changes.
                            await config.SaveConfig(Main.config);

                            this.FakeClickMod();

                            await dialog.showMessageBox(Main.mainWindow, {
                                type: "info",
                                title: "Mod Update",
                                message: `Mod update for "${this.currentModData.name}" was completed successfully.`,
                                buttons: ["OK"]
                            });
                        }
                    }
                }
                else if (this.currentModData.install.type == "github") {
                    //Current mod is not a jsonlist type. Just get and install the latest.
                    const _url = await this.source_manager.GetFileURL();
                    log.log("Mod is type GitHub, will update using the most recent release url: " + _url);
                    const result = await this.ModInstall(_url);
                    if(result){
                        SetNewModVersion(this.currentModVersionRemote, this.currentModData.name);
                        //Save the config changes.
                        await config.SaveConfig(Main.config);

                        this.FakeClickMod();

                        await dialog.showMessageBox(Main.mainWindow, {
                            type: "info",
                            title: "Mod Update",
                            message: `Mod update for "${this.currentModData.name}" was completed successfully.`,
                            buttons: ["OK"]
                        });
                    }
                }
                else if (this.currentModData.install.type == "githubcollection") {
                    //Current mod is not a jsonlist type. Just get and install the latest.
                    const _url = await this.source_manager.GetFileURL(collectionVersion);
                    log.log("Mod is type GitHub Collection, will update using the most recent release url: " + _url);
                    const result = await this.ModInstall(_url);
                    if(result){
                        SetNewModVersion(this.currentModVersionRemote, this.currentModData.name);
                        //Save the config changes.
                        await config.SaveConfig(Main.config);

                        this.FakeClickMod();

                        await dialog.showMessageBox(Main.mainWindow, {
                            type: "info",
                            title: "Mod Update",
                            message: `Mod update for "${this.currentModData.name}" was completed successfully.`,
                            buttons: ["OK"]
                        });
                    }
                }
                else {
                    log.error("Unknown mod type found during update attempt.");
                    await ErrorDialog("Unknown mod type found during update attempt.", "Error");
                }
            }
        } catch (e) {
            await ErrorDialog(e, "Mod Update Error");
        }
    }

    public static async ModInstall(contentURL: string): Promise<boolean>{
        let urlArray;
        if (Array.isArray(contentURL)) {
            urlArray = contentURL;
        } else {
            urlArray = [];
            urlArray.push(contentURL);
        }

        try {
            const files = await DownloadFiles_UI(urlArray);
            try {
                await this.InstallFiles(files);
                return true;
            } catch (e) {
                await ErrorDialog(e, "Mod Install Error"); this.FakeClickMod();
                return false;
            }
        } catch (e) {
            await ErrorDialog(e, "Mod Files Download Error"); this.FakeClickMod();
            return false;
        }
    }

    //Set up the config information to actually define this mod as installed. MUST BE DONE.
    public static async SetupNewModAsInstalled(collectionVersion?: string){
        //Finish up the installation process.
        //Set the current version of the mod in the config.

        const versionUpdated = SetNewModVersion(this.currentModVersionRemote, this.currentModData.name);

        //If we didnt update the version of an exstisting object. Add it.
        if (typeof(collectionVersion) != "undefined") {
            if (!versionUpdated) {
                Main.config.current_mod_versions.push({
                    name: this.currentModData.name,
                    version: this.currentModVersionRemote,
                    collectionversion: collectionVersion
                });
            }
        }
        else if (!versionUpdated) {
            Main.config.current_mod_versions.push({
                name: this.currentModData.name,
                version: this.currentModVersionRemote
            });
        }

        //Save the config changes.
        await config.SaveConfig(Main.config);

        const installOperation = this.source_manager.PostInstall(collectionVersion);

        this.currentModState = "INSTALLED";

        this.FakeClickMod();

        //Wait until the file move operation is done
        await installOperation;

        await dialog.showMessageBox(Main.mainWindow, {
            type: "info",
            title: "Mod Install",
            message: `Mod files installation for "${this.currentModData.name}" was completed successfully.`,
            buttons: ["OK"]
        });
    }

    public static async RemoveCurrentMod() {
        //Do nothing if this mod is not installed or if there is no mod data.
        if (this.currentModData == null || this.currentModState == "NOT_INSTALLED") {
            return;
        }
        let progressBar;
        try {
            //Load file list object
            const files_object = await filemanager.GetFileList(this.currentModData.name);
            let running = true;

            if(files_object.files != null && files_object.files.length > 0){
                progressBar = new ProgressBar({
                    indeterminate: false,
                    text: "Removing Mod Files",
                    detail: "Starting Removal...",
                    maxValue: files_object.files.length,
                    abortOnError: true,
                    closeOnComplete: false,
                    browserWindow: {
                        webPreferences: {
                            nodeIntegration: true,
                            contextIsolation: false
                        },
                        width: 550,
                        parent: Main.mainWindow,
                        modal: true,
                        title: "Removing Mod Files",
                        backgroundColor: "#2b2826",
                        closable: true
                    },
                    style: {
                        text: loadingTextStyle,
                        detail: loadingTextStyle,
                        value: loadingTextStyle
                    }
                }, Main.app);

                //Setup events to display data.
                progressBar.on("completed", () => {
                    progressBar.detail = "Removal Done.";
                })
                    .on("aborted", () => {
                        running = false;
                        ErrorDialog("Mod removal was canceled and may be incomplete.\nYou may need to reinstall the mod to remove it correctly.", "Removal Canceled!");
                        this.FakeClickMod();
                    })
                    .on("progress", (value: number) => {
                        progressBar.detail = `${value} files removed out of ${progressBar.maxValue}`;
                    });

                for(let i = 0; i < files_object.files.length; i++){
                    if (!running) {
                        return;
                    }

                    log.log("Deleting file: " + files_object.files[i]);
                    //If the file exists, delete it.
                    if (await FsExtensions.fileExists(files_object.files[i])) {
                        await promises.unlink(files_object.files[i]);
                    }
                    progressBar.value = i + 1;
                }
                //Try to execute mod specific operations, like moving tf/user/cfg/class.cfg and tf/user/cfg/autoexec.cfg back to /tf/cfg/class.cfg
                //and /tf/cfg/autoexec.cfg respectively for mastercomfig
                const uninstall = this.source_manager.PostUninstall();
                //I only want to show complete when it is finished
                await uninstall;
                await Delay(300);
                running = false;
                progressBar.setCompleted();
                progressBar.close();

                if(await FsExtensions.fileExists(files_object.files[0])){
                    await ErrorDialog("Mod removal failed, TF2 may be using these files still. You must close TF2 to remove a mod.", "Removal Error");
                    this.FakeClickMod();
                    return;
                }

                //Remove mod file list.
                await filemanager.RemoveFileList(this.currentModData.name);

                //Remove mod from current config
                for(let i = 0; i < Main.config.current_mod_versions.length; i++){
                    const element = Main.config.current_mod_versions[i];
                    if (element.name && element.name == this.currentModData.name) {
                        Main.config.current_mod_versions.splice(i, 1);
                    }
                }
                await config.SaveConfig(Main.config);

                // Because this pissed me off way more than it should have.
                let modRemovalMessage: string;
                if (files_object.files.length > 1) {
                    modRemovalMessage = `The mod "${this.currentModData.name}" has been successfully removed.\n${files_object.files.length} files were removed.`;
                } else {
                    modRemovalMessage = `The mod "${this.currentModData.name}" has been successfully removed.\n${files_object.files.length} file was removed.`;
                }

                await dialog.showMessageBox(Main.mainWindow, {
                    type: "info",
                    title: "Mod Removal Completed",
                    message: modRemovalMessage,
                    buttons: ["OK"]
                });

                this.FakeClickMod();
            }
            else{
                await dialog.showMessageBox(Main.mainWindow, {
                    type: "error",
                    title: "Mod Removal Error",
                    message: "Mod cannot be removed. Please try to remove them manually.",
                    buttons: ["OK"]
                });
            }
        }
        catch(e){
            progressBar.setCompleted();
            progressBar.close();
            let errorString;

            if(e.toString().includes("EBUSY")){
                errorString = "Mod file(s) were busy or in use. You cannot remove a mod if TF2 is still running.\nClose TF2 and try removing the mod again.";
            } else{
                errorString = e.toString();
            }

            await ErrorDialog(`Mod Removal Failed.\n${errorString}`, "Mod Removal Error");
            this.FakeClickMod();
        }
    }

    //Get the mod data object by the given name.
    public static GetModDataByName(name: string){
        if(this.all_mods_data){
            for (let i = 0; i < this.all_mods_data.mods.length; i++) {
                const element = this.all_mods_data.mods[i];
                if(element.name && element.name == name){
                    return element;
                }
            }
        }
        return null;
    }

    //Find the current version of the mod given by name that we have in our config. No version means it is not installed.
    public static GetCurrentModVersionFromConfig(name: string) {
        let toReturn = null;
        for (let i = 0; i < Main.config.current_mod_versions.length; i++) {
            const element = Main.config.current_mod_versions[i];
            if (element.name && element.name == name) {
                toReturn = element;
                break;
            }
        }
        //Return the version if it was there.
        if (toReturn != null) {
            return toReturn.version;
        } else {
            return null;
        }
    }
    ///Only use the argument if using collections
    public static GetRealInstallPath() {

        let realPath = this.currentModData.install.targetdirectory;

        //To ensure the path is correct when resolved. Good one Zonical.
        if(!realPath.endsWith("/") && !realPath.endsWith("\\")){
            realPath += "/";
        }

        realPath = path.normalize(realPath);

        return path.normalize(realPath.replace("{tf2_dir}", Main.config.tf2_directory));
    }

    public static async InstallFiles(files){
        //Sort files based on their handle function.
        const sortedFiles = new Map();
        for(let i = 0; i < files.length; i++){
            const f = files[i];
            const handleF = GetFileWriteFunction(f.extension);

            if(!sortedFiles.has(handleF)){
                //Add the map value for this handle function and set its value as an empty array.
                sortedFiles.set(handleF, []);
            }

            sortedFiles.get(handleF).push(f);
        }

        const fileEntries = sortedFiles.entries();
        let entryIndex = 0;

        let func;

        const entryProcess = async () => {
            const entry = fileEntries.next();
            if(entry != null){
                func = entry.value[0];
            }

            await func(this.GetRealInstallPath(), entry.value[1], this.currentModData);
            entryIndex++;
            if(entryIndex < sortedFiles.size){
                await entryProcess();
            }
        };

        try{
            //Call to process the first entry
            await entryProcess();
        }
        catch(e){
            log.error("Failed to install mod files: " + e.toString());
            throw e;
        }
    }

    public static FakeClickMod(){
        //Send to trigger a reload of the mod in the UI. We can just trigger the mod change again in the ui now to update everything.
        //This sends an event to the render thread that we subscribe to.
        setTimeout(() => {
            Main.mainWindow.webContents.send("FakeClickMod", this.currentModData);
        }, 50);
        log.log("FakeClickMod func sent.")
    }
}

export default ModManager;

async function Delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function DownloadFiles_UI(urls){
    let currentIndex = 0;
    const files = [];

    return new Promise((resolve, reject) => {
        let progressBar;
        const shouldStop = {value: false};

        let maxProgressVal = 0;

        const progressFunction = (dataLength: number) => {
            if(progressBar && !progressBar.isCompleted()){
                try{
                    progressBar.value = dataLength;
                }
                catch(e){
                    reject(e.toString());
                }
            }
        };

        const headersFunction = (headers) => {
            const contentLength = headers["content-length"];

            progressBar = new ProgressBar({
                indeterminate: false,
                text: "Downloading Mod Files",
                detail: "Starting Download...",
                maxValue: contentLength,
                abortOnError: true,
                closeOnComplete: false,
                browserWindow: {
                    webPreferences: {
                        nodeIntegration: true,
                        contextIsolation: false
                    },
                    width: 550,
                    parent: Main.mainWindow,
                    modal: true,
                    title: "Downloading Mod Files",
                    backgroundColor: "#2b2826",
                    closable: true
                },
                style: {
                    text: loadingTextStyle,
                    detail: loadingTextStyle,
                    value: loadingTextStyle
                }
            }, Main.app);

            //Setup events to display data.
            progressBar.on("completed", () => {
                //progressBar.detail = 'Download Finished!';
            }).on("aborted", () => {
                shouldStop.value = true;
                reject("Download Cancelled by User!");
            }).on("progress", (value: number) => {
                try {
                    progressBar.detail = `[File ${currentIndex + 1} of ${urls.length}] Downloaded ${(Math.round((value / 1000000) * 100) / 100).toFixed(2)} MB out of ${maxProgressVal} MB.`;
                }
                catch(e){
                    reject(e.toString());
                }
            });

            maxProgressVal = Math.round((parseInt(contentLength) / 1000000) * 100) / 100;
        };

        //Setup download sequence for all files
        const downloadFunc = () => {
            log.log("Starting Download for file at: " + urls[currentIndex]);
            DownloadFile(urls[currentIndex], progressFunction, headersFunction, shouldStop).then((file) => {
                files.push(file);
                currentIndex++;

                if(currentIndex >= urls.length){
                    progressBar.setCompleted();
                    progressBar.close();
                    resolve(files);
                } else {
                    progressBar.setCompleted();
                    progressBar.close();
                    setTimeout(downloadFunc, 50);
                }
            }).catch((error) => {
                log.error("Download failed on file(s) download");
                log.error(error);
                reject(error);
            });
        };

        //Call the local function to download the first zip.
        downloadFunc();
    });
}

//Get all the files that exist in this zip file object and create them in the target directory.
//Also supports multiple zips to install at once.
async function WriteZIPsToDirectory(targetPath: any, zips: DownloadedFile[], currentModData: any){
    for (const zip of zips) {
        await FileWriter.ExtractZip(targetPath, zip.buffer, currentModData.name);
    }
}

//Writes files to disk that are not in a zip but are just a buffer.
async function WriteFilesToDirectory(targetPath: any, files: any, currentModData: any){
    let written = 0;

    //Load file list object
    const files_object = await filemanager.GetFileList(currentModData.name);
    let active = true;

    await FsExtensions.ensureDirectoryExists(targetPath);

    const progressBar = new ProgressBar({
        text: "Extracting data",
        detail: "Starting data extraction...",
        browserWindow: {
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            parent: Main.mainWindow,
            modal: true,
            title: "Writing files...",
            backgroundColor: "#2b2826",
            closable: true
        },
        style: {
            text: loadingTextStyle,
            detail: loadingTextStyle,
            value: loadingTextStyle
        }
    });

    progressBar.on("completed", () => {
        active = false;
        progressBar.detail = "Writing completed. Exiting...";
    })
        .on("aborted", () => {
            active = false;
            throw new Error("User aborted file writing. You will need to restart the installation process to install this mod.");
        });

    log.log("Waiting for file writing to complete...");

    for (let index = 0; index < files.length; index++) {
        if(!active){
            continue;
        }
        const file = files[index];
        progressBar.detail = `Writing ${file.name}. Total Files Written: ${written}.`;

        const fullFilePath = path.join(targetPath, file.name);

        await promises.writeFile(fullFilePath, file.buffer);
        written++;

        //Add file that we wrote to the file list
        if (!files_object.files.includes(fullFilePath)) {
            files_object.files.push(fullFilePath);
        }

        log.log(`File write for "${file.name}" was successful.`);
    }

    progressBar.setCompleted();
    await filemanager.SaveFileList(files_object, currentModData.name);
    return;
}

//Validates the tf2 directory. Can trigger dialogues depending on the outcome.
async function ValidateTF2Dir(){
    //Check we have a config object
    if(!Main.config){
        await ErrorDialog("The application could not load the config. It may have failed to write it to disk.\nPlease report this issue!", "Internal Error");
        return false;
    }

    //If no path is specified. Maybe the auto locate failed?
    if(Main.config.tf2_directory == ""){
        await ErrorDialog("No TF2 path has been specified. Please manually enter this in the Settings.\nE.g. 'C:\\Program Files (x86)\\steam\\steamapps\\common\\Team Fortress 2\\'", "TF2 Path Error");
        return false;
    }

    //Check if the directory actually exists.
    if(!await FsExtensions.pathExists(Main.config.tf2_directory)){
        await ErrorDialog("The current TF2 directory specified does not exist. Please check your settings.", "TF2 Path Error");
        return false;
    }

    //Check if the directory contains an hl2 win32 executable if we are on windows.
    const plat = os.platform();
    if(plat == "win32"){
        if(await FsExtensions.fileExists(path.join(Main.config.tf2_directory, "hl2.exe"))){
            return true;
        }
    }
    else if (plat == "linux" || plat == "freebsd" || plat == "openbsd"){
        if(await FsExtensions.pathExists(path.join(Main.config.tf2_directory, "hl2_linux"))){
            return true;
        }
    }

    //Check if the directory has the app id txt and it has 440 in it.
    const appid_path = path.join(Main.config.tf2_directory, "steam_appid.txt");
    if(await FsExtensions.fileExists(appid_path)){
        const content = await promises.readFile(appid_path, {encoding: "utf8"});
        const appid = content.split("\n")[0];
        if (appid != null && appid == "440") {
            return true;
        }
    }

    //All the tests failed, show dialogue for that.
    await ErrorDialog("The current TF2 directory specified does exist, but it did not pass validation.\nCheck it links only to the 'Team Fortress 2' folder and not to the sub 'tf' folder.\nPlease check your settings.", "TF2 Validation Error");
    return false;
}

function DownloadFile(_url: string, progressFunc: any, responseHeadersFunc: any, shouldStop: any) {
    return new Promise((resolve, reject) => {

        // This is not being used, should it be removed?
        // var options = {
        //     headers: {
        //       "User-Agent": "creators-tf-launcher"
        //     }
        // };

        const DoRequest = (__url: string, retries: number) => {
            if (retries <= 0) {
                const error = `Endpoint ${_url} redirected too many times. Aborted!`;
                log.error(error);
                reject(error);
            }

            log.log("Starting GET for file data at: " + __url);
            const req = https.get(__url, function (res) {
                if(res.statusCode == 302){
                    log.log("Got a 302, re trying on new location.");
                    DoRequest(res.headers.location, retries--);
                }
                else if (res.statusCode == 404){
                    const error = `Remote Mod file was not able to be found. Try again later.\nIf this persists please report this error.`;
                    log.error(error);
                    log.error("404 for: " + _url);
                    reject(error);
                }
                else if (res.statusCode !== 200) {
                    const error = `Download File Request failed, response code was: ${res.statusCode}.\nPlease report this error.`;
                    log.error(error);
                    reject(error);
                }
                else {
                    //Execute the callback for doing processing with the headers.
                    if (responseHeadersFunc != null) {
                        responseHeadersFunc(res.headers);
                    }

                    const data = [];
                    let dataLen = 0;

                    // don't set the encoding, it will break everything !
                    // or, if you must, set it to null. In that case the chunk will be a string.

                    res.on("data", (chunk) => {
                        if(shouldStop.value){
                            res.destroy();
                            reject();
                            return;
                        }

                        data.push(chunk);
                        dataLen += chunk.length;
                        if (progressFunc != null) {
                            progressFunc(dataLen);
                        }
                    });

                    res.on("end", () => {
                        if(!shouldStop.value){
                            const buf = Buffer.concat(data);

                            progressFunc = null;
                            responseHeadersFunc = null;

                            log.log("File download finished. Returning raw data.");
                            //This approach to get the file name only works for direct file urls.
                            //A better solution for later would be via the content-disposition header if this is missing.
                            let filename: string;
                            const contentDispositionHeader = res.headers["content-disposition"];
                            if (contentDispositionHeader != undefined) {
                                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                                const matches = filenameRegex.exec(contentDispositionHeader);
                                if (matches != null && matches[1]) {
                                    filename = matches[1].replace(/['"]/g, "");
                                    log.info("Got filename for download from content-disposition header: " + filename);
                                }
                            }

                            if (filename == undefined) {
                                filename = GetFileName(__url);
                            }

                            resolve(new DownloadedFile(buf, filename));
                        }
                        else{
                            log.log("File download was cancled by the user successfully.");
                        }
                    });
                }
            });

            req.on("error", (err) => {
                log.error(`File download request for ${_url} errored out: ` + err);
                reject(err);
            });
        };

        //Do initial request.
        DoRequest(_url, 5);
    });
}

function GetFileName(_url: string) {
    const parsed = url.parse(_url);
    return path.basename(parsed.pathname);
}

function SetNewModVersion(version: number, currentModName: string) {
    //Try to update the version of the mod if its already in the array.
    for(let i = 0; i < Main.config.current_mod_versions.length; i++){
        const modVersionObject = Main.config.current_mod_versions[i];
        if (modVersionObject.name == currentModName) {
            log.log(`Mod ${currentModName} version was updated from ${modVersionObject.version} to ${version}`);
            modVersionObject.version = version;
            return true;
        }
    }
    return false;
}

async function ErrorDialog(error: any, title: string) {
    log.error(`Error Dialog shown: ${title} : ${error.toString()}.\nError Stack:${error.stack}`);
    await dialog.showMessageBox(Main.mainWindow, {
        type: "error",
        title: title,
        message: error.toString(),
        buttons: ["OK"]
    });
}

async function FatalError(errorMessage: string){
    await dialog.showMessageBox(Main.mainWindow, {
        type: "error",
        title: "Fatal Error",
        message: errorMessage.toString(),
        buttons: ["OK"]
    });
    log.error("A fatal error was encountered! Program quit. Reason: " + errorMessage);
    Main.app.quit();
}

function GetFileWriteFunction(extension: any){
    //Format to be what we expect.
    extension = extension.toLowerCase().replace(".", "");

    if(functionMap.has(extension)){
        return functionMap.get(extension);
    }

    else return WriteFilesToDirectory;
}

//Uses a typeguard to check if an object is or is not of type Install
function IsCollection(arg: Install[]): boolean {
    if (arg.length > 1) {
        //It is a collection
        return true;
    }
    else {
        return false;
    }
}


functionMap.set("zip", WriteZIPsToDirectory);
functionMap.set("vpk", WriteFilesToDirectory);

//Some extras to check just incase the downloads are not something we can handle or a windows exe.
functionMap.set("rar", async() => { await FatalError("Cannot handle .rar files currently. This should not happen. Exiting..."); });
functionMap.set("7z", async() => { await FatalError("Cannot handle .7z files currently. This should not happen. Exiting..."); });
functionMap.set("exe", async() => { await FatalError("Downloaded file was windows executable. This should not happen, exiting. File was not written."); });
