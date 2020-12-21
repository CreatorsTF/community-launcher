const path = global.path;
const os = require('os');

const fs = require("fs");
const { dialog } = require('electron');
const https = require('https');
const JSZip = require('jszip');
const url = require("url");
const ProgressBar = require('electron-progressbar');
const log = require('electron-log');
const fsPromises = require('./fs_extensions');
const config = require('./config');
const errors = require('./errors');
const filemanager = require("./file_manager");
const {GithubSource} = require("./mod_sources/github_source.js");
const {JsonListSource} = require("./mod_sources/jsonlist_source.js");
const {GameBananaSource} = require("./mod_sources/gamebanana_source.js");
const Utilities = require("./utilities");
const {ModListLoader} = require("./mod_list_loader");

var functionMap = new Map();

"use strict";

//Shared by all loading bar uis to set text colour.
const loadingTextStyle = {
    color: "ghostwhite"
}

const State = {
    //Not installed
    NOT_INSTALLED: "NOT_INSTALLED",

    //Is installed, up to date.
    INSTALLED: "INSTALLED",

    //Installed but needs an update.
    UPDATE: "UPDATE"
};

class DownloadedFile {
    constructor(buffer, name){
        this.buffer = buffer;
        this.name = name;

        //Store the file extension now.
        this.extension = path.extname(this.name);
    }
}

module.exports = 
{//EXPORTS BEGIN

//Export variables.
all_mods_data: null,
currentModData: null,
currentModVersion: 0,
currentModState: State.NOT_INSTALLED,
currentModVersionRemote: 0,
downloadWindow: null,
files_object: null,
source_manager: null,

//Sets up the module.
async Setup(){
    this.all_mods_data = ModListLoader.GetModList();

    await filemanager.Init();
},

//Change the currently selected mod, return its installation button text.
async ChangeCurrentMod(name){
    //Get this mods data and store it for use.
    this.currentModData = this.GetModDataByName(name);
    this.currentModVersion = this.GetCurrentModVersionFromConfig(name);
    this.currentModState = State.NOT_INSTALLED;
    this.currentModVersionRemote = 0;

    global.log.log(`Set current mod to: ${this.currentModData.name}`);

    //Setup the source manager object depending on the type of the mod.
    switch(this.currentModData.install.type){
        case "jsonlist":
            this.source_manager = new JsonListSource(this.currentModData.install);
            break;
        case "github":
            this.source_manager = new GithubSource(this.currentModData.install);
            break;
        case "gamebanana":
            this.source_manager = new GameBananaSource(this.currentModData.install);
            break;
        default:
            this.source_manager = null;
            throw new Error("Mod install type was not recognised: " + this.currentModData.install.type);
            return;
    }

    //We do not have a version for this mod. Method to use is install.
    if(this.currentModVersion == null || this.currentModVersion == 0){
        try {
            const version = await this.source_manager.GetLatestVersionNumber();
            this.currentModState = State.NOT_INSTALLED;
            this.currentModVersionRemote = version;
            return "Install";
        } catch (e) {
            throw new errors.InnerError("Failed to get mod version: " + e.toString(), e)
        }
    }
    else {
        //We have a version, now we need to determine if there is an update or not.
        const version = await this.source_manager.GetLatestVersionNumber();
        
        //Compare the currently selected version number to this one. If ours is smaller, update. If not, do nothing.
        this.currentModVersionRemote = version;

        if(version > this.currentModVersion) 
            this.currentModState = State.UPDATE;
        else 
            this.currentModState = State.INSTALLED;

        //Time to resolve with the text to show on the button
        switch(this.currentModState){
            case State.INSTALLED:
                return "Installed";
            case State.UPDATE:
                return "Update";
            default:
                return "Install";
        }
    }
},

//Trigger the correct response to the current mod depending on its state.
//This is called when the Install / Update / Installed button is pressed in the UI.
async ModInstallPlayButtonClick(){
    global.log.log("Install button was clicked! Reacting based on state: " + this.currentModState)
    if (this.currentModData == null){
        this.FakeClickMod();
        await ErrorDialog("Mod data was not able to be read.\nPlease report this error.", "Mod Install Start Error")
        return;
    }

    switch(this.currentModState){
        case State.NOT_INSTALLED:
            //We should try to install this mod!
            //Before we try anything we need to validate the tf2 install directory. Otherwise downloading is a waste.
            global.log.log("Will validate TF2 path before starting download...");
            if(!await ValidateTF2Dir()){                
                this.FakeClickMod();
                global.log.error("Ending Install attempt now as validation failed!");
                return;
            }
            global.log.log("TF2 Path was validated.");
                
            //Perform mod download and install.
            try {
                const _url = await this.source_manager.GetFileURL();
                global.log.log("Successfuly got mod install file urls. Will proceed to try to download them.");
                await this.ModInstall(_url);
                await this.SetupNewModAsInstalled();
            } catch (e) {
                this.FakeClickMod();
                await ErrorDialog(e, "Mod Begin Install Error");
            }
            
            break;

        case State.UPDATE:
            //We should try to update this mod!

            //Setup the message to include the version if we have the data.
            //Really we should for this state to be active but best to be sure.
            global.log.log("Asking user if they want to update this mod.");
            const version = await this.source_manager.GetLatestVersionNumber();            
            let update_msg = `Would you like to update this mod to version "${version}"?`;

            //Ask if the users wants to update or not
            
            const button = await dialog.showMessageBox(global.mainWindow, {
                type: "question",
                title: "Update",
                message: update_msg,
                buttons: ["Yes", "Cancel"],
                cancelId: 1
            });
            if(button.response == 0) {
                //Do the update!
                global.log.log("Starting update process...");
                await this.UpdateCurrentMod();
            }
            break;
        default:
            global.log.error("Somehow the install button was clicked when the mod is in the installed state.");
            break;
    }
},

//Attempt an update. If possible then we do it. Will try to do it incrementally or a full re download.
async UpdateCurrentMod() {
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
                const data = await this.source_manager.GetJsonData();
                
                var urls = [];
                if (data.hasOwnProperty("PatchUpdates") && data.PatchUpdates.length > 0) {
                    //There should be urls to patch zips for each update.
                    let patchObjects = data.PatchUpdates;
                    let patchURLS = [];
                    patchObjects.forEach((patch) => {
                        if (patch.Version > this.currentModVersion) patchURLS.push(patch);
                    });

                    //Sort the urls soo we apply updates from the oldest update to the newest.
                    patchURLS.sort((a, b) => {
                        //We want to sort smaller version numbers FIRST
                        //Soo they get applied first later.
                        if (a.Version > b.Version) return 1;
                        if (a.Version < b.Version) return -1;

                        return 0;
                    });

                    //Get out the urls for easier use later.
                    for (let i = 0; i < patchURLS.length; i++) {
                        urls.push(patchURLS[i].DownloadURL);
                    }
                }
                    
                if(urls.length > 0) {
                    global.log.log("Incremental update will begin for current mod using the following archive urls: " + urls.toString());
                    await this.ModInstall(urls);
                
                    //Update the version for the mod.
                    
                    SetNewModVersion(this.currentModVersionRemote, this.currentModData.name);

                    //Save the config changes.
                    await config.SaveConfig(global.config);

                    this.FakeClickMod();

                    await dialog.showMessageBox(global.mainWindow, {
                        type: "info",
                        title: "Mod Update",
                        message: `Mod update for ${this.currentModData.name} was completed successfully.`,
                        buttons: ["OK"]
                    });
                }
                else {
                    //We need to update using the main zip. Not ideal but works.
                    global.log.warn("Update source does not have patch data! Will have to download again fully.");
                    const _url = await this.source_manager.GetFileURL();
                    await this.ModInstall(_url);
                    SetNewModVersion(this.currentModVersionRemote, this.currentModData.name);

                    //Save the config changes.
                    await config.SaveConfig(global.config);

                    this.FakeClickMod();

                    await dialog.showMessageBox(global.mainWindow, {
                        type: "info",
                        title: "Mod Update",
                        message: `Mod update for ${this.currentModData.name} was completed successfully.`,
                        buttons: ["OK"]
                    });
                }
            }
            else if (this.currentModData.install.type == "github") {
                //Current mod is not a jsonlist type. Just get and install the latest.
                const _url = await this.source_manager.GetFileURL();
                global.log.log("Mod is type GitHub, will update using the most recent release url: " + _url);
                await this.ModInstall(_url);
                SetNewModVersion(this.currentModVersionRemote, this.currentModData.name);
                //Save the config changes.
                await config.SaveConfig(global.config);

                this.FakeClickMod();

                await dialog.showMessageBox(global.mainWindow, {
                    type: "info",
                    title: "Mod Update",
                    message: `Mod update for ${this.currentModData.name} was completed successfully.`,
                    buttons: ["OK"]
                });
            }
            else {
                global.log.error("Unknown mod type found during update attempt.");
                await ErrorDialog("Unknown mod type found during update attempt.", "Error");
            }
        }
        
    } catch (e) {
        await ErrorDialog(e, "Mod Update Error"); 
    }
},

async ModInstall(contentURL){
    let urlArray;
    if(Array.isArray(contentURL)) urlArray = contentURL;
    else{
        urlArray = [];
        urlArray.push(contentURL);
    }
    
    try {   
        const files = await DownloadFiles_UI(urlArray);     
        try {        
            await this.InstallFiles(files);
        } catch (e) {
            await ErrorDialog(e, "Mod Install Error"); this.FakeClickMod();
        }
    } catch (e) {
        await ErrorDialog(e, "Mod Files Download Error"); this.FakeClickMod();
    }
},

//Set up the config information to actually define this mod as installed. MUST BE DONE.
async SetupNewModAsInstalled(){
    //Finish up the installation process.
    //Set the current version of the mod in the config.

    let versionUpdated = SetNewModVersion(this.currentModVersionRemote, this.currentModData.name);

    //If we didnt update the version of an exstisting object. Add it.
    if(!versionUpdated) global.config.current_mod_versions.push({name: this.currentModData.name, version: this.currentModVersionRemote})

    //Save the config changes.
    await config.SaveConfig(global.config);

    this.currentModState = State.INSTALLED;

    this.FakeClickMod();

    await dialog.showMessageBox(global.mainWindow, {
        type: "info",
        title: "Mod Install",
        message: `Mod files installation for ${this.currentModData.name} was completed successfully.`,
        buttons: ["OK"]
    });
},

async RemoveCurrentMod() {
    //Do nothing if this mod is not installed or if there is no mod data.
    if(this.currentModData == null || this.currentModState == State.NOT_INSTALLED) return;
    var progressBar;
    try {
        //Load file list object
        let files_object = await filemanager.GetFileList(this.currentModData.name);
        var running = true;

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
                        nodeIntegration: true
                    },
                    width: 550,
                    parent: global.mainWindow,
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
                }, global.app);

                //Setup events to display data.
                progressBar
                .on('completed', function () {
                    progressBar.detail = 'Removal Done.';
                })
                .on('aborted', function (value) {
                    running = false;
                    ErrorDialog(`Mod Removal was canceled and may be incomplete. You may need to re install the mod to remove it correctly.`, "Removal Canceled!");
                    this.FakeClickMod();
                }).
                on('progress', function(value) {
                    progressBar.detail = `${value} files removed out of ${progressBar.maxValue}`;
                });

            for(var i = 0; i < files_object.files.length; i++){
                if(!running) return;

                global.log.log("Deleting file: " + files_object.files[i]);
                //If the file exists, delete it.
                if(await fsPromises.fileExists(files_object.files[i])) await fsPromises.unlink(files_object.files[i]);
                progressBar.value = i + 1;
            }

            await Delay(300);        
            running = false;
            progressBar.setCompleted();
            progressBar.close();

            if(await fsPromises.fileExists(files_object.files[0])){
                await ErrorDialog(`Mod Removal Failed, TF2 may be using these files still. You must close TF2 to remove a mod.`, "Removal Error");
                this.FakeClickMod();
                return;
            }

            //Remove mod file list.
            await filemanager.RemoveFileList(this.currentModData.name);

            //Remove mod from current config
            for(let i = 0; i < global.config.current_mod_versions.length; i++){
                let element = global.config.current_mod_versions[i];
                if(element.name && element.name == this.currentModData.name){
                    global.config.current_mod_versions.splice(i, 1);
                }
            }
            await config.SaveConfig(global.config);

            await dialog.showMessageBox(global.mainWindow, {
                type: "info",
                title: "Mod Removal Complete",
                message: `The mod "${this.currentModData.name}" has been removed successfully.\n${files_object.files.length} files were removed.`,
                buttons: ["OK"]
            });

            this.FakeClickMod();
        }
        else{
            await dialog.showMessageBox(global.mainWindow, {
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
        var errorString;
        if(e.toString().includes("EBUSY")){
            errorString = "Mod file(s) were busy or in use. You cannot remove a mod if TF2 is still running.\nSome files may not be deleted and some may remain.\nClose TF2 and try removing the mod again.";
        }
        else{
            errorString = e.toString();
        }

        await ErrorDialog(`Mod Removal Failed.\n${errorString}`, "Mod Removal Error");
        this.FakeClickMod();
    }
},

//Get the mod data object by the given name.
GetModDataByName(name){
    if(this.all_mods_data){
        for (let i = 0; i < this.all_mods_data.mods.length; i++) {
            const element = this.all_mods_data.mods[i];
            if(element.name && element.name == name){
                return element;
            }
        }
    }

    return null;
},

//Find the current version of the mod given by name that we have in our config. No version means it is not installed.
GetCurrentModVersionFromConfig(name) {
    let toReturn = null;
    for (let i = 0; i < global.config.current_mod_versions.length; i++) {
        let element = global.config.current_mod_versions[i];
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
},

GetRealInstallPath(){
    let realPath = this.currentModData.install.targetdirectory;

    //To ensure the path is correct when resolved. Good one Zonical.
    if(!realPath.endsWith("/") && !realPath.endsWith("\\")){
        realPath += "/";
    }

    realPath = path.normalize(realPath);

    return path.normalize(realPath.replace("{tf2_dir}", global.config.tf2_directory));
},

async InstallFiles(files){
    //Sort files based on their handle function.
    let sortedFiles = new Map();
    for(let i = 0; i < files.length; i++){
        let f = files[i];
        let handleF = GetFileWriteFunction(f.extension);

        if(!sortedFiles.has(handleF)){
            //Add the map value for this handle function and set its value as an empty array.
            sortedFiles.set(handleF, []);
        }
        
        sortedFiles.get(handleF).push(f);
    }

    let fileEntries = sortedFiles.entries();
    let entryIndex = 0;

    let entry;
    let func;

    let entryProcess = async () => {
        entry = fileEntries.next();
        if(entry != null){
            func = entry.value[0];
        }
        
        await func(this.GetRealInstallPath(), entry.value[1], this.currentModData);
        entryIndex++;
        if(entryIndex < sortedFiles.size){
            await entryProcess();
        }
    };

    //Call to process the first entry
    await entryProcess();
},

FakeClickMod(){
    //Send to trigger a reload of the mod in the UI. We can just trigger the mod change again in the ui now to update everything.
    //This sends an event to the render thread that we subscribe to.
    setTimeout(() => {
        global.mainWindow.webContents.send("FakeClickMod", this.currentModData);
    }, 50);
}

//END OF EXPORT FUNCTIONS ############
}// END OF EXPORT OBJECT. ##########################


async function Delay(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}
function DownloadFiles_UI(urls){
    var currentIndex = 0;
    var files = [];

    return new Promise((resolve, reject) => {
        var progressBar;
        var shouldStop = {value: false};

        let maxProgressVal = 0;

        var progressFunction = (dataLength) => {
            if(progressBar && !progressBar.isCompleted()){
                try{
                    progressBar.value = dataLength;
                }
                catch(e){
                    reject(e.toString());
                }
            }
        };

        var headersFunction = (headers) => {
            let contentLength = headers["content-length"];

            progressBar = new ProgressBar({
                indeterminate: false,
                text: "Downloading Mod Files",
                detail: "Starting Download...",
                maxValue: contentLength,
                abortOnError: true,
                closeOnComplete: false,
                browserWindow: {
                    webPreferences: {
                        nodeIntegration: true
                    },
                    width: 550,
                    parent: global.mainWindow,
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
            }, global.app);

            //Setup events to display data.
            progressBar
            .on('completed', function () {
                //progressBar.detail = 'Download Finished!';
            })
            .on('aborted', function (value) { 
                shouldStop.value = true;
                reject("Download Cancelled by User!");
            })
            .on('progress', function(value) {
                try{
                progressBar.detail = `[File ${currentIndex + 1} of ${urls.length}] Downloaded ${(Math.round((value / 1000000) * 100) / 100).toFixed(2)} MB out of ${maxProgressVal} MB.`;
                }
                catch( e ){
                    reject(e.toString());
                }
            });

            maxProgressVal = Math.round((parseInt(contentLength) / 1000000) * 100) / 100;           
        };

        //Setup download sequence for all files
        let downloadFunc = () => {
            global.log.log("Starting Download for file at: " + urls[currentIndex]);
            DownloadFile(urls[currentIndex], progressFunction, headersFunction, shouldStop).then((file) => {
                files.push(file);
                currentIndex++;

                if(currentIndex >= urls.length){
                    progressBar.setCompleted();
                    progressBar.close();
                    resolve(files);
                }
                else{
                    progressBar.setCompleted();
                    progressBar.close();
                    setTimeout(downloadFunc, 50);
                }
            }).catch((error) => {
                global.log.error("Download failed on file(s) download");
                global.log.error(error);
                reject(error);
            });
        };

        //Call the local function to download the first zip.
        downloadFunc();
    });
}

//Get all the files that exist in this zip file object and create them in the target directory.
//Also supports multiple zips to install at once.
async function WriteZIPsToDirectory(targetPath, zips, currentModData){
    var inProgress = 0;
    var written = 0;
    var currentZip;
    var currentIndex = 0;
    var multipleZips = false;
    var active = true;

    //Load file list object
    let files_object = await filemanager.GetFileList(currentModData.name);

    var progressBar = new ProgressBar({
        text: 'Extracting data',
        detail: 'Starting data extraction...',
        browserWindow: {
            webPreferences: {
                nodeIntegration: true
            },
            parent: global.mainWindow,
            modal: true,
            title: "Extracting files...",
            backgroundColor: "#2b2826",
            closable: true
        },
        style: {
            text: loadingTextStyle,
            detail: loadingTextStyle,
            value: loadingTextStyle
        }
    });

    //Make JSZip object from each of the zips given
    let zipConvertsInProgress = 0;

    for(let i = 0; i < zips.length; i++){
        zipConvertsInProgress++;
        let index = i;
        const jszip = await JSZip.loadAsync(zips[index].buffer);
        zips[index] = jszip;
        zipConvertsInProgress--;
    }

    await fsPromises.ensureDirectoryExists(targetPath);

    const Write = async (name, d) => {
        let fullFilePath = path.join(targetPath, name);
        await fsPromises.writeFile(fullFilePath, d);
        written++;

        progressBar.detail = `Wrote ${name}. Total Files Written: ${written}.`;

        //Add file that we wrote to the file list
        if(!files_object.files.includes(fullFilePath)) files_object.files.push(fullFilePath);

        global.log.log(`ZIP extract for "${name}" was successful.`);
        inProgress--;
    };

    const HandleFile = async (relativePath, file) => {
        if(!active){
            return;
        }

        inProgress++;
        if(file.dir){
            let directory = path.join(targetPath, file.name);

            await fsPromises.ensureDirectoryExists(directory);
            inProgress--;
        }
        else{
            try {
                const d = await currentZip.file(file.name).async("uint8array");
                await Write(file.name, d);
            } catch (err) {
                log.error(err);
                throw err;
            }
        }
    };

    progressBar
    .on('completed', function() {
        progressBar.detail = 'Extraction completed. Exiting...';
    })
    .on('aborted', function() {
        active = false;
        reject("Extraction aborted by user. You will need to re start the installation process to install this mod.");
    });

    const HandleZips = async (zips) => {
        const promises = [];
        zips.forEach((rf, f) => {
            const promise = HandleFile(rf, f);
            promises.push(promise);
        })
        return Promise.all(promises);
    }

    const DoExtract = async () => {
        global.log.log("Waiting for ZIP exraction to complete...")
        await HandleZips(currentZip);
        
        let checkFunc = async () => {
            if(inProgress <= 0){
                inProgress = 0;

                if(multipleZips){
                    currentIndex++;
                    //If we have another zip to install.
                    if(currentIndex < zips.length){
                        //Assign the new zip and repeat the processess to handle and write the files.
                        currentZip = zips[currentIndex];
                        await HandleZips(currentZip);

                        //Make sure we set a timeout for the checking function again!!
                        await Delay(200);
                        await checkFunc();
                    }
                    else {
                        progressBar.setCompleted();
                        await filemanager.SaveFileList(files_object, currentModData.name);
                        return;
                    }
                }
                else{
                    //Resolve now as we only had one zip to install.
                    progressBar.setCompleted();
                    await filemanager.SaveFileList(files_object, currentModData.name);
                    return;
                }
                
            }
            else {
                await Delay(200);
                await checkFunc();
                return;
            };
        };

        await Delay(1000);
        await checkFunc();
    }

    const CheckZipCreateDone = async() => {
        if(zipConvertsInProgress <= 0){

            //Get the target zip.
            if(!Array.isArray(zips)){
                currentZip = zips;
                multipleZips = false;
            }
            else{
                currentZip = zips[0];
                multipleZips = true;
            }

            await DoExtract();
        }
        else{
            await Delay(50);
            await CheckZipCreateDone();
        }
    };

    await Delay(50);
    await CheckZipCreateDone();
}

//Writes files to disk that are not in a zip but are just a buffer.
async function WriteFilesToDirectory(targetPath, files, currentModData){
    var written = 0;

    //Load file list object
    let files_object = await filemanager.GetFileList(currentModData.name);
    var active = true;

    await fsPromises.ensureDirectoryExists(targetPath);

    var progressBar = new ProgressBar({
        text: 'Extracting data',
        detail: 'Starting data extraction...',
        browserWindow: {
            webPreferences: {
                nodeIntegration: true
            },
            parent: global.mainWindow,
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

    progressBar
    .on('completed', function() {
        active = false;
        progressBar.detail = 'Writing completed. Exiting...';
    })
    .on('aborted', function() {
        active = false;
        reject("User aborted file writing. You will need to restart the installation process to install this mod.");
    });
    
    global.log.log("Waiting for File writing to complete...")

    for (let index = 0; index < files.length; index++) {
        if(!active){
            continue;
        }
        const file = files[index];
        progressBar.detail = `Writing ${file.name}. Total Files Written: ${written}.`;

        let fullFilePath = path.join(targetPath, file.name);

        await fsPromises.writeFile(fullFilePath, file.buffer);
        written++;

        //Add file that we wrote to the file list
        if(!files_object.files.includes(fullFilePath)) files_object.files.push(fullFilePath);

        global.log.log(`File write for '${file.name}' was successful.`);
    }

    progressBar.setCompleted();
    await filemanager.SaveFileList(files_object, currentModData.name);
    return;
}

//Validates the tf2 directory. Can trigger dialogues depending on the outcome.
async function ValidateTF2Dir(){
    //Check we have a config object
    if(!global.config){
        await ErrorDialog("The application could not load the config. It may have failed to write it to disk.\nPlease report this issue!", "Internal Error");
        return false;
    }

    //If no path is specified. Maybe the auto locate failed?
    if(global.config.tf2_directory == ""){
        await ErrorDialog("No TF2 path has been specified. Please manually enter this in the Settings.\nE.g. 'C:\\Program Files (x86)\\steam\\steamapps\\common\\Team Fortress 2\\'", "TF2 Path Error");
        return false;
    }

    //Check if the directory actually exists.
    if(!await fsPromises.pathExists(global.config.tf2_directory)){
        await ErrorDialog("The current TF2 directory specified does not exist. Please check your settings.", "TF2 Path Error");
        return false;
    }

    //Check if the directory contains an hl2 win32 executable if we are on windows.
    const plat = os.platform();
    if(plat == "win32"){
        if(await fsPromises.fileExists(path.join(global.config.tf2_directory, "hl2.exe"))){
            return true;
        }
    }    
    else if (plat == "linux" || plat == "freebsd" || plat == "openbsd"){
        if(await fsPromises.pathExists(path.join(global.config.tf2_directory, "hl2_linux"))){
            return true;
        }
    }
    
    //Check if the directory has the app id txt and it has 440 in it.
    let appid_path = path.join(global.config.tf2_directory, "steam_appid.txt");
    if(await fsPromises.fileExists(appid_path)){
        let content = await fsPromises.readFile(appid_path, {encoding: "utf8"});
        let appid = content.split("\n")[0];
        if(appid != null && appid == "440"){
            return true;
        }
    }

    //All the tests failed, show dialogue for that.
    await ErrorDialog("The current TF2 directory specified does exist, but it did not pass validation.\nCheck it links only to the 'Team Fortress 2' folder and not to the sub 'tf' folder.\nPlease check your settings.", "TF2 Validation Error");
    return false;
}

function DownloadFile(_url, progressFunc, responseHeadersFunc, shouldStop){
    return new Promise((resolve, reject) => {

        var options = {
            headers: {
              'User-Agent': 'creators-tf-launcher'
            }
        };

        var DoRequest = (__url, retries) => {
            if(retries <= 0){
               let error = `Endpoint ${_url} redirected too many times. Aborted!`;
               global.log.error(error);
               reject(error);
            } 

            global.log.log("Starting GET for file data at: " + __url);
            var req = https.get(__url, function (res) {
                if(res.statusCode == 302){
                    global.log.log("Got a 302, re trying on new location.");
                    DoRequest(res.headers.location, retries--);
                }
                else if (res.statusCode == 404){
                    let error = `Remote Mod file was not able to be found. Try again later.\nIf this persists please report this error.`;
                    global.log.error(error);
                    global.log.error("404 for: " + _url);
                    reject(error);
                }
                else if (res.statusCode !== 200) {
                    let error = `Download File Request failed, response code was: ${res.statusCode}.\nPlease report this error.`;
                    global.log.error(error);
                    reject(error);
                }
                else {
                    //Execute the callback for doing processing with the headers.
                    if(responseHeadersFunc != null) responseHeadersFunc(res.headers);
    
                    var data = [], dataLen = 0;
    
                    // don't set the encoding, it will break everything !
                    // or, if you must, set it to null. In that case the chunk will be a string.
    
                    res.on("data", function (chunk) {
                        if(shouldStop.value){
                            res.destroy();
                            reject();
                            return;
                        }

                        data.push(chunk);
                        dataLen += chunk.length;
                        if(progressFunc != null) progressFunc(dataLen);
                    });
    
                    res.on("end", function () {
                        if(!shouldStop.value){
                            var buf = Buffer.concat(data);
        
                            progressFunc = null;
                            responseHeadersFunc = null;
                            
                            global.log.log("File download finished. Returning raw data.");
                            //This approach to get the file name only works for direct file urls.
                            //A better solution for later would be via the content-disposition header if this is missing.
                            var filename;
                            var contentDispositionHeader = res.headers["content-disposition"];
                            if(contentDispositionHeader != undefined){
                                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                                var matches = filenameRegex.exec(contentDispositionHeader);
                                if (matches != null && matches[1]) { 
                                    filename = matches[1].replace(/['"]/g, '');
                                    global.log.info("Got filename for download fron content-disposition header: " + filename);
                                }
                            }

                            if(filename == undefined) filename = GetFileName(__url);

                            resolve(new DownloadedFile(buf, filename));
                        }
                        else{
                            global.log.log("File download was cancled by the user successfully.");
                        }
                    });
                }
            });
    
            req.on("error", function (err) {
                global.log.error(`File download request for ${_url} errored out: ` + err);
                reject(err);
            });
        }

        //Do initial request.
        DoRequest(_url, 5);
    });
}

function GetFileName(_url){
    var parsed = url.parse(_url);
    return path.basename(parsed.pathname);
}

function SetNewModVersion(version, currentModName){
    //Try to update the version of the mod if its already in the array.
    for(let i = 0; i < global.config.current_mod_versions.length; i++){
        let modVersionObject = global.config.current_mod_versions[i];
        if(modVersionObject.name == currentModName){
            global.log.log(`Mod ${currentModName} version was updated from ${modVersionObject.version} to ${version}`);
            modVersionObject.version = version;
            return true;
        }
    }
    return false;
}

async function ErrorDialog(error, title){
    global.log.error(`Error Dialog shown: ${title} : ${error.toString()}.\nError Stack:${error.stack}`);
    await dialog.showMessageBox(global.mainWindow, {
        type: "error",
        title: title,
        message: error.toString(),
        buttons: ["OK"]
    });
}

async function FatalError(errorMessage){
    await dialog.showMessageBox(global.mainWindow, {
        type: "error",
        title: title,
        message: errorMessage.toString(),
        buttons: ["OK"]
    });
    global.log.error("A fatal error was encountered! Program quit. Reason: " + errorMessage);
    global.app.quit();
}

function GetFileWriteFunction(extension){
    //Format to be what we expect.
    extension = extension.toLowerCase().replace(".", "");

    if(functionMap.has(extension)){
        return functionMap.get(extension);
    }

    else return WriteFilesToDirectory;
}

functionMap.set("zip", WriteZIPsToDirectory);
functionMap.set("vpk", WriteFilesToDirectory);

//Some extras to check just incase the downloads are not something we can handle or a windows exe.
functionMap.set("rar", async() => { await FatalError("Cannot handle .rar files currently. This should not happen. Exiting..."); });
functionMap.set("7z", async() => { await FatalError("Cannot handle .7z files currently. This should not happen. Exiting..."); });
functionMap.set("exe", async() => { await FatalError("Downloaded file was windows executable. This should not happen, exiting. File was not written."); });