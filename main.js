global.path = require("path");
global.fs = require("fs");
global.process = require("process");
global.os = require("os");
global.https = require("https");

const isDev = require("electron-is-dev");
global.isDev = isDev;

const { app, BrowserWindow, ipcMain, shell, dialog, screen } = require("electron");
const config = require("./modules/config");
const settingsPage = require("./settings-page/settingspage");
const patchnotesPage = require("./patchnotes-page/patchnotespage");
const {ServerListPage} = require("./serverlist-page/serverlistpage");
const mod_manager = require("./modules/mod_manager");
const { autoUpdater } = require("electron-updater");
const {Utilities} = require("./modules/utilities");
const { ModListLoader, ModList } = require("./modules/mod_list_loader");

// There are 6 levels of logging: error, warn, info, verbose, debug and silly
const log = require("electron-log");
log.transports.console.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.fileName = "main.log";
log.transports.file.maxSize = 10485760;
log.transports.file.getFile();
global.log = log;

const path = global.path;
const majorErrorMessageEnd = "\nIf this error persists, please report it on our GitHub page by making a new 'Issue'.\nVisit creators.tf/launcher for more info.\nYou can also report if via our Discord.";

var mainWindow;

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    global.screenWidth = width;
    global.screenHeight = height;
    try {
        mainWindow = new BrowserWindow({
            minWidth: 960,
            minHeight: 540,
            width: screenWidth-200,
            height: screenHeight-150,
            webPreferences: {
                preload: path.join(__dirname, "preload.js"),
                nodeIntegration: false
            },
            center: true,
            maximizable: true,
            resizable: true,
            autoHideMenuBar: true,
            darkTheme: true,
            backgroundColor: "#2B2826"
        });
        module.exports.mainWindow = mainWindow;
        global.mainWindow = mainWindow;
        global.app = app;
        if (!isDev) mainWindow.removeMenu();

        //Lets load the config file.
        config.GetConfig().then((c) => {
            //Make sure the config is loaded in.
            global.config = c;
            // and load the index.html of the app.
            //Also setup the mod manager.
            try {
                mod_manager.Setup()
                    .then(() => mainWindow.loadFile(path.resolve(__dirname, "index.html")))                ;
            }
            catch(e) {
                log.error(e.toString());
                dialog.showMessageBox({
                    type: "error",
                    title: "Startup Error - Main Window Load",
                    message: e.toString() + majorErrorMessageEnd,
                    buttons: ["OK"]
                }).then((button) => {
                    app.quit();
                });
            }
        })
        .catch((e) => {
            log.error(e.toString());
            dialog.showMessageBox({
                type: "error",
                title: "Startup Error - Config Load",
                message: e.toString() + majorErrorMessageEnd,
                buttons: ["OK"]
            }).then((button) => {
                app.quit();
            });
        });
    }
    catch(majorE) {
        log.error(majorE.toString());
        dialog.showMessageBox({
            type: "error",
            title: "Startup Error - Major Initial Error",
            message: majorE.toString() + majorErrorMessageEnd,
            buttons: ["OK"]
        }).then((button) => {
            app.quit();
        });
    }
}

function logDeviceInfo() {
    log.log(`Basic System Information: [platform: ${os.platform()}, release: ${os.release()}, arch: ${os.arch()}, systemmem: ${(((os.totalmem() / 1024) / 1024) / 1024).toFixed(2)} gb]`);
}

function autoUpdateCheckAndSettings() {
    autoUpdater.checkForUpdatesAndNotify();
    autoUpdater.logger = log;
    autoUpdater.logger.transports.file.level = "info";
    autoUpdater.autoDownload = false;
    log.info("Checking for updates.");
}

function getClientCurrentVersion() {
    var lVer = Utilities.GetCurrentVersion();
    if (lVer != null) log.info("Current launcher version: " + lVer);
    else log.error("Failed to get launcher version");
}

app.on("ready", () => {
    try{
        ModListLoader.LoadLocalModList();
        createWindow();
        getClientCurrentVersion();
        autoUpdateCheckAndSettings();
        logDeviceInfo();
        log.info("Launcher was opened/finished initialization.");
    }
    catch(error) {
        log.error(error.toString());
        dialog.showMessageBox({
            type: "error",
            title: "App Ready Error - Major Initial Error",
            message: error.toString() + majorErrorMessageEnd,
            buttons: ["OK"]
        }).then((button) => {
            app.quit();
        });
    }
});

app.on("activate", function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on("window-all-closed", function() {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
        log.info("Launcher was closed.");
    }
});

autoUpdater.on("checking-for-update", () => {
    log.info("Checking for updates");
});

autoUpdater.on("update-not-available", () => {
    mainWindow.webContents.send("update_not_available");
    log.info("No updates available");
});

autoUpdater.on("update-available", () => {
    mainWindow.webContents.send("update_available");
    log.info("An update is available");
});

ipcMain.on("download_update", () => {
    autoUpdater.downloadUpdate();
    mainWindow.webContents.send("update_downloading");
    log.info("Downloading update");
});

autoUpdater.on("update-downloaded", () => {
    mainWindow.webContents.send("update_downloaded");
    log.info("Update downloaded");
});

autoUpdater.on("error", (err) => {
    log.error("Error in auto-updater: " + err);
});

ipcMain.on("restart_app", () => {
    autoUpdater.quitAndInstall();
    log.info("Restarting program to install an update");
});

ipcMain.on("SettingsWindow", async (event, arg) => {
    settingsPage.OpenWindow();
});
ipcMain.on("PatchNotesWindow", async (event, arg) => {
    patchnotesPage.OpenWindow();
});
ipcMain.on("ServerListWindow", async (event, arg) => {
    //Get the mod list data so we can get the server providers for the current mod.

    var modList = ModListLoader.GetModList();
    //Make sacrificial object soo the local method exists. Thanks js on your half assed oo.
    var realModList = new ModList();
    Object.assign(realModList, modList);

    var providers = realModList.GetMod(mod_manager.currentModData.name).serverlistproviders;
    if(providers != null) ServerListPage.OpenWindow(mainWindow, global.screenWidth, global.screenHeight, providers);
    else{
        if (isDev){
            Utilities.ErrorDialog("There were no providers for the current mod! Populate the 'serverlistproviders' property", "Missing Server Providers");
        }
        else {
            log.error("There were no providers for the current mod! Did not open server list page.");
        }
    }
});

// ipcMain.on("app_version", (event) => {
//     event.sender.send("app_version", {
//         version: app.getVersion()
//     });
// });

ipcMain.on("GetConfig", async (event, arg) => {
    event.reply("GetConfig-Reply", global.config);
});

ipcMain.on("SetCurrentMod", async (event, arg) => {    
    try {
        const result = await mod_manager.ChangeCurrentMod(arg);
        event.reply("InstallButtonName-Reply", result);
    } catch (error) {
        event.reply("InstallButtonName-Reply", "Internal Error");
            Utilities.ErrorDialog(isDev ? `Dev Error: ${error.toString()}` : `Failed to check if mod "${arg}" has updates. Its website may be down. Try again later.\nIf the error persists, please report it on our Discord.`, "Mod Update Check Error");
    }
});

ipcMain.on("install-play-click", async (event, args) => {
    await mod_manager.ModInstallPlayButtonClick();
});

ipcMain.on("Visit-Mod-Social", async(event, arg) => {
    let socialLink = mod_manager.currentModData[arg];
    if (socialLink != null && socialLink != "") {
        shell.openExternal(socialLink);
    }
});

ipcMain.on("GetCurrentModVersion", async(event, arg) => {
    let version;
    try {
        version = mod_manager.GetCurrentModVersionFromConfig(mod_manager.currentModData.name);
        if (version == null) {
            version = "?";
        }
    }
    catch {
        version = "?";
    }
    event.reply("GetCurrentModVersion-Reply", version);
});

ipcMain.on("Remove-Mod", async(event, arg) => {
    if(mod_manager.currentModData != null && (mod_manager.currentModState == "INSTALLED" || mod_manager.currentModState == "UPDATE" )){
        dialog.showMessageBox(global.mainWindow, {
            type: "warning",
            title: "Remove Mod",
            message: `Would you like to uninstall the mod ${mod_manager.currentModData.name}?`,
            buttons: ["Yes", "Cancel"],
            cancelId: 1
        }).then(async (button) => {
            if (button.response == 0) {
                log.info("Will start the mod removal process. User said yes.");
                await mod_manager.RemoveCurrentMod();
            }
        });
    }
});

ipcMain.on("config-reload-tf2directory", async (event, steamdir) => {
    if(steamdir != ""){
        const tf2dir = await config.GetTF2Directory(steamdir);
        if (tf2dir && tf2dir != "")
            global.config.steam_directory = steamdir;
            global.config.tf2_directory = tf2dir;
    
        event.reply("GetConfig-Reply", global.config);
    }
    else {
        Utilities.ErrorDialog("A Steam installation directory is required! Please populate your Steam installation path to auto locate TF2.\ne.g. 'C:/Program Files (x86)/Steam'", "TF2 Locate Error");
    }
});

ipcMain.on("GetModData", async (event, args) => {
    ModListLoader.CheckForUpdates().then(() => {
        ModListLoader.UpdateLocalModList();
        log.verbose("Latest mod list was sent to renderer");
        event.reply("ShowMods", ModListLoader.GetModList());
    });
});

// Run games: steam://run/[ID]
// Run games, mods and non-Steam shortcuts: steam://rungameid/[ID]
