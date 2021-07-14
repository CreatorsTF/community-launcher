//@ts-ignore
import { app, BrowserWindow, ipcMain, shell, dialog, screen, App } from "electron";
import isDev from "electron-is-dev";
import settingsPage from "./settings-page/settingspage";
import patchnotesPage from "./patchnotes-page/patchnotespage";
import { ServerListPage } from "./serverlist-page/serverlistpage";
import mod_manager from "./modules/mod_manager";
import { autoUpdater } from "electron-updater";
import { Utilities } from "./modules/utilities";
import { ModListLoader, ModList } from "./modules/mod_list_loader";
import path from "path";
import { ConfigType } from "modules/mod_list_loader";
import os from "os";
const _config = require("./modules/config");
// There are 6 levels of logging: error, warn, info, verbose, debug and silly
import log from "electron-log";

log.transports.console.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.fileName = "main.log";
log.transports.file.maxSize = 10485760;
log.transports.file.getFile();
//@ts-ignore
global.log = log;

const majorErrorMessageEnd = "\nIf this error persists, please report it on our GitHub page by making a new 'Issue'.\nVisit creators.tf/launcher for more info.\nYou can also report if via our Discord.";

class Main {
    static mainWindow: BrowserWindow;
    static app: App;
    static config: ConfigType;
    static screenWidth: number;
    static screenHeight: number;
    static minWindowWidth: number;
    static minWindowHeight: number;

    public static createWindow() {
        //@ts-ignore
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        this.screenWidth = width;
        this.screenHeight = height;
        this.minWindowWidth = 960;
        this.minWindowHeight = 540;
        try {
            Main.mainWindow = new BrowserWindow({
                minWidth: this.minWindowWidth,
                minHeight: this.minWindowHeight,
                width: this.screenWidth-200,
                height: this.screenHeight-150,
                webPreferences: {
                    preload: path.join(__dirname, "preload.js"),
                    nodeIntegration: false,
                    contextIsolation: false
                },
                center: true,
                maximizable: true,
                resizable: true,
                autoHideMenuBar: true,
                darkTheme: true,
                backgroundColor: "#2B2826"
            });
            //@ts-ignore
            global.mainWindow = Main.mainWindow;
            Main.app = app;
            if (!isDev) Main.mainWindow.removeMenu();

            //Lets load the config file.
            _config.GetConfig().then((c) => {
                //Make sure the config is loaded in.
                // and load the index.html of the app.
                //Also setup the mod manager.
                this.config = c;
                try {
                    mod_manager.Setup().then(
                        () => Main.mainWindow.loadFile(path.resolve(__dirname, "index.html"))
                    );
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

    static logDeviceInfo() {
        log.log(`Basic System Information: [platform: ${os.platform()}, release: ${os.release()}, arch: ${os.arch()}, systemmem: ${(((os.totalmem() / 1024) / 1024) / 1024).toFixed(2)} gb]`);
    }

    static autoUpdateCheckAndSettings() {
        autoUpdater.checkForUpdatesAndNotify();
        autoUpdater.logger = log;
        autoUpdater.autoDownload = false;
        log.info("Checking for updates.");
    }

    static getClientCurrentVersion() {
        var lVer = Utilities.GetCurrentVersion();
        if (lVer != null) log.info("Current launcher version: " + lVer);
        else log.error("Failed to get launcher version");
    }
}

export default Main;

app.on("ready", () => {
    try {
        ModListLoader.LoadLocalModList();
        Main.createWindow();
        Main.getClientCurrentVersion();
        Main.autoUpdateCheckAndSettings();
        Main.logDeviceInfo();
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
    Main.mainWindow.webContents.send("update_not_available");
    log.info("No updates available");
});

autoUpdater.on("update-available", () => {
    Main.mainWindow.webContents.send("update_available");
    log.info("An update is available");
});

ipcMain.on("download_update", () => {
    autoUpdater.downloadUpdate();
    Main.mainWindow.webContents.send("update_downloading");
    log.info("Downloading update");
});

autoUpdater.on("update-downloaded", () => {
    Main.mainWindow.webContents.send("update_downloaded");
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
    settingsPage.OpenWindow(Main.screenWidth, Main.screenHeight, Main.config);
});
ipcMain.on("PatchNotesWindow", async (event, arg) => {
    patchnotesPage.OpenWindow(Main.screenWidth, Main.screenHeight);
});
ipcMain.on("ServerListWindow", async (event, arg) => {
    //Get the mod list data so we can get the server providers for the current mod.

    var modList = ModListLoader.GetModList();
    //Make sacrificial object soo the local method exists. Thanks js on your half assed oo.
    var realModList = new ModList();
    Object.assign(realModList, modList);

    var providers = realModList.GetMod(mod_manager.currentModData.name).serverlistproviders;
    if (providers != null) ServerListPage.OpenWindow(Main.mainWindow, Main.screenWidth, Main.screenHeight, Main.minWindowWidth, Main.minWindowHeight, providers);
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
    event.reply("GetConfig-Reply", Main.config);
});

ipcMain.on("SetCurrentMod", async (event, arg) => {    
    try {
        const result = await mod_manager.ChangeCurrentMod(arg);
        event.reply("InstallButtonName-Reply", result);
    } catch (error) {
        event.reply("InstallButtonName-Reply", "Internal Error");
        Utilities.ErrorDialog(`Failed to check if mod "${arg}" has updates. Reason:\n${error}`, "Mod Update Check Error");
    }
});

ipcMain.on("install-play-click", async (event, args) => {
    await mod_manager.ModInstallPlayButtonClick(args);
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
            version = "";
        }
    } catch {
        version = "";
    }
    event.reply("GetCurrentModVersion-Reply", version);
});

ipcMain.on("Remove-Mod", async(event, arg) => {
    if(mod_manager.currentModData != null && (mod_manager.currentModState == "INSTALLED" || mod_manager.currentModState == "UPDATE" )){
        dialog.showMessageBox(Main.mainWindow, {
            type: "warning",
            title: `Remove Mod - ${mod_manager.currentModData.name}?`,
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
        const tf2dir = await _config.GetTF2Directory(steamdir);
        if (tf2dir && tf2dir != "")
            Main.config.steam_directory = steamdir;
            Main.config.tf2_directory = tf2dir;
    
        event.reply("GetConfig-Reply", Main.config);
    }
    else {
        Utilities.ErrorDialog("A Steam installation directory is required! Please populate your Steam installation path to auto locate TF2.\ne.g. 'C:/Program Files (x86)/Steam'", "TF2 Locate Error");
    }
});

ipcMain.on("GetModData", async (event, args) => {
    ModListLoader.CheckForUpdates().then(() => {
        ModListLoader.UpdateLocalModList();

        if(isDev){
            log.verbose("Development only mods were added.");
            ModListLoader.InjectDevMods();
        }

        log.verbose("Latest mod list was sent to renderer");
        let modList = ModListLoader.GetModList();

        event.reply("ShowMods", {mods: modList.mods});
    });
});

ipcMain.on("get-config", async (event, arg) => {
    let res = await _config.GetConfig();
    event.reply(res);
})


//Quickplay
//ipcMain.on("")

// Run games: steam://run/[ID]
// Run games, mods and non-Steam shortcuts: steam://rungameid/[ID]
