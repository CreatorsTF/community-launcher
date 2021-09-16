import { app, BrowserWindow, ipcMain, shell, dialog, screen, App } from "electron";
import { autoUpdater } from "electron-updater";
import isDev from "electron-is-dev";
import path from "path";
import os from "os";
import settingsPage from "./settings-page/settingspage";
import patchnotesPage from "./patchnotes-page/patchnotespage";
import ServerListPage from "./serverlist-page/serverlistpage";
import mod_manager from "./modules/mod_manager";
import Utilities from "./modules/utilities";
import { ModListLoader, ModList } from "./modules/remote_file_loader/mod_list_loader";
import log from "electron-log";
import QuickPlayConfigLoader from "./modules/remote_file_loader/quickplay_config_loader";
import Quickplay from "./modules/api/quickplay";
import { Config, ConfigFileModVersion } from "./modules/config";

// There are 6 levels of logging: error, warn, info, verbose, debug and silly
log.transports.console.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.fileName = "main.log";
log.transports.file.maxSize = 10485760;
log.transports.file.getFile();

const majorErrorMessageEnd = "\nIf this error persists, please report it on our GitHub page by creating a new 'Issue'.\nVisit creators.tf/launcher for more info.";

class Main {
    public static mainWindow: BrowserWindow;
    public static app: App;
    public static config: Config;
    public static screenWidth: number;
    public static screenHeight: number;
    public static minWindowWidth: number;
    public static minWindowHeight: number;
    public static icon: string;
    public static quickPlay: Quickplay;

    public static createWindow() {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        this.screenWidth = width;
        this.screenHeight = height;
        this.minWindowWidth = 960;
        this.minWindowHeight = 540;
        this.icon = path.join(__dirname, "images/installer/256x256.png");
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
                backgroundColor: "#2B2826",
                icon: this.icon
            });
            //@ts-ignore
            global.mainWindow = Main.mainWindow;
            Main.app = app;
            if (!isDev) {
                Main.mainWindow.removeMenu();
            }

            //Lets load the config file.
            Config.GetConfig().then((c) => {
                //Make sure the config is loaded in.
                // and load the index.html of the app.
                //Also setup the mod manager.
                this.config = c;
                try {
                    mod_manager.Setup().then(() => {
                        Main.mainWindow.loadFile(path.resolve(__dirname, "index.html"));
                    });
                }
                catch (e) {
                    log.error(e.toString());
                    dialog.showMessageBox({
                        type: "error",
                        title: "Startup Error - Main Window Load",
                        message: e.toString() + majorErrorMessageEnd,
                        buttons: ["OK"]
                    }).then(() => {
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
                    }).then(() => {
                        app.quit();
                    });
                });
        }
        catch (majorE) {
            log.error(majorE.toString());
            dialog.showMessageBox({
                type: "error",
                title: "Startup Error - Major Initial Error",
                message: majorE.toString() + majorErrorMessageEnd,
                buttons: ["OK"]
            }).then(() => {
                app.quit();
            });
        }
    }

    public static logDeviceInfo() {
        log.log(`Basic System Information: [platform: ${os.platform()}, release: ${os.release()}, arch: ${os.arch()}, systemmem: ${(((os.totalmem() / 1024) / 1024) / 1024).toFixed(2)} gb]`);
    }

    public static autoUpdateCheckAndSettings() {
        autoUpdater.checkForUpdatesAndNotify();
        autoUpdater.logger = log;
        autoUpdater.autoDownload = false;
        log.info("Checking for updates.");
    }

    public static getClientCurrentVersion() {
        const lVer = Utilities.GetCurrentVersion();
        if (lVer != null) {
            log.info("Current launcher version: " + lVer);
        }
        else {
            log.error("Failed to get launcher version");
        }
    }
}

export default Main;

app.on("ready", () => {
    try{
        ModListLoader.instance.LoadLocalFile();
        QuickPlayConfigLoader.instance.LoadLocalFile();
        Main.quickPlay = new Quickplay();
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
        }).then(() => {
            app.quit();
        });
    }
});

app.on("window-all-closed", function () {
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
    Main.mainWindow.webContents.send("update_error");
    log.error("Error in auto-updater: " + err);
});

ipcMain.on("restart_app", () => {
    autoUpdater.quitAndInstall();
    log.info("Restarting program to install an update");
});

ipcMain.on("SettingsWindow", async () => {
    settingsPage.OpenWindow(Main.mainWindow, Main.screenWidth, Main.screenHeight, Main.minWindowWidth, Main.minWindowHeight, Main.config, Main.icon);
});
ipcMain.on("PatchNotesWindow", async () => {
    patchnotesPage.OpenWindow(Main.mainWindow, Main.screenWidth, Main.screenHeight, Main.minWindowWidth, Main.minWindowHeight, Main.icon);
});
ipcMain.on("ServerListWindow", async () => {
    //Get the mod list data so we can get the server providers for the current mod.

    const modList = ModListLoader.instance.GetFile();
    //Make sacrificial object soo the local method exists. Thanks js on your half assed oo.
    const realModList = new ModList();
    Object.assign(realModList, modList);

    const providers = realModList.GetMod(mod_manager.currentModData.name).serverlistproviders;
    if (providers != null) {
        ServerListPage.OpenWindow(Main.mainWindow, Main.screenWidth, Main.screenHeight, Main.minWindowWidth, Main.minWindowHeight, providers, Main.icon);
    }
    else if (isDev) {
        Utilities.ErrorDialog("There were no providers for the current mod! Populate the 'serverlistproviders' property", "Missing Server Providers");
    } else {
        log.error("There were no providers for the current mod! Did not open server list page.");
    }
});

ipcMain.on("GetConfig", async (event) => {
    event.reply("GetConfig-Reply", Main.config);
});

ipcMain.on("SetCurrentMod", async (event, arg) => {
    try {
        const result = await mod_manager.ChangeCurrentMod(arg);
        event.reply("InstallButtonName-Reply", result);
    } catch (error) {
        event.reply("InstallButtonName-Reply", "Internal Error");
        Utilities.ErrorDialog(`Failed to check if mod "${arg}" has updates.\n${error}`, "Mod Update Check Error");
    }
});

ipcMain.on("install-play-click", async (event, args) => {
    await mod_manager.ModInstallPlayButtonClick(args);
});

ipcMain.on("Visit-Mod-Social", async (event, arg) => {
    const socialLink = mod_manager.currentModData[arg];
    if (socialLink != null && socialLink != "") {
        shell.openExternal(socialLink);
    }
});

ipcMain.on("Open-External-Game", async () => {
    const steamProtocol = "steam://run/";
    const steamProtocolMod = "steam://rungameid/";
    const isMod = mod_manager.currentModData.isMod;
    const game = steamProtocol + mod_manager.currentModData.gameId;
    const gameMod = steamProtocolMod + mod_manager.currentModData.gameId;
    const gameDefault = steamProtocol + "440";

    if (mod_manager.currentModData.gameId != "" && mod_manager.currentModState == "INSTALLED") {
        if (isMod == false) {
            log.log("GAME LAUNCHING: User initiated (non-mod) game: " + game);
            shell.openExternal(game);
        } else {
            log.log("GAME LAUNCHING: User initiated (mod) game: " + gameMod);
            shell.openExternal(gameMod);
        }
    } else if (mod_manager.currentModData.gameId == "" && mod_manager.currentModState == "INSTALLED") {
        log.log("GAME LAUNCHING: Current mod doesn't have a gameId, initiating default game: " + gameDefault);
        shell.openExternal(gameDefault);
    } else {
        log.log("GAME LAUNCHING: Can't initiate the current mod's game. It's either uninstalled or with a pending update.");
    }
});

// We can now access everything we need from ModVersion[] here
ipcMain.on("GetCurrentModVersion", async (event) => {
    let mod: ConfigFileModVersion;
    try {
        mod = mod_manager.GetCurrentModVersionFromConfig(mod_manager.currentModData.name);
    } catch {
        mod = null;
    }
    event.reply("GetCurrentModVersion-Reply", mod);
});

ipcMain.on("Remove-Mod", async () => {
    if (mod_manager.currentModData != null && (mod_manager.currentModState == "INSTALLED" || mod_manager.currentModState == "UPDATE")) {
        dialog.showMessageBox(Main.mainWindow, {
            type: "warning",
            title: `Remove Mod - ${mod_manager.currentModData.name}`,
            message: `Would you like to uninstall "${mod_manager.currentModData.name}"?`,
            buttons: ["Yes", "Cancel"],
            cancelId: 1
        }).then(async (button) => {
            if (button.response == 0) {
                log.info(`Starting the mod removal process for "${mod_manager.currentModData.name}". User said yes.`);
                await mod_manager.RemoveCurrentMod();
            }
        });
    }
});

ipcMain.on("config-reload-tf2directory", async (event, steamdir) => {
    if (steamdir != "") {
        const tf2dir = await Config.GetTF2Directory(steamdir);
        if (tf2dir && tf2dir != "") {
            Config.config.steam_directory = steamdir;
        }
        Config.config.tf2_directory = tf2dir;

        event.reply("GetConfig-Reply", Main.config);
    }
    else {
        Utilities.ErrorDialog("A Steam installation directory is required! Please populate your Steam installation path to auto locate TF2.\ne.g. 'C:/Program Files (x86)/Steam'", "TF2 Locate Error");
    }
});

ipcMain.on("GetModData", async (event) => {
    ModListLoader.instance.CheckForUpdates().then(() => {
        ModListLoader.instance.UpdateLocalFile();

        if (isDev) {
            log.verbose("Development only mods were added.");
            ModListLoader.instance.InjectDevMods();
        }

        log.verbose("Latest mod list was sent to renderer");
        const modList = ModListLoader.instance.GetFile();

        event.reply("ShowMods", {
            mods: modList.mods
        });
    });
});

ipcMain.on("get-config", async (event) => {
    const res = await Config.GetConfig();
    event.reply(res);
});