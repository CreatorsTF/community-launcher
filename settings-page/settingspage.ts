import { BrowserWindow, ipcMain, shell, dialog } from "electron";
import Config from "../modules/config";
import path from "path";
import { ModListLoader } from "../modules/mod_list_loader";
import Utilities from "../modules/utilities";
import isDev from "electron-is-dev";
import log from "electron-log";

class SettingsPage {
    public static settingsWindow: BrowserWindow;
    public static waitingForSettings: boolean = true;

    public static OpenWindow(mainWindow: any, screenWidth: number, screenHeight: number, minWindowWidth: number, minWindowHeight: number, configObject: any, icon: string) {
        log.info("Loading Settings window...");
        this.settingsWindow = new BrowserWindow({
            parent: mainWindow,
            webPreferences: {
                preload: path.join(__dirname, "settingspage-preload.js"),
                nodeIntegration: false,
                contextIsolation: false
            },
            modal: true,
            show: false,
            center: true,
            darkTheme: true,
            maximizable: true,
            resizable: true,
            autoHideMenuBar: true,
            minWidth: minWindowWidth,
            minHeight: minWindowHeight,
            width: screenWidth-250,
            height: screenHeight-100,
            icon: icon
        });
        if (!isDev) {
            this.settingsWindow.removeMenu();
        }
        this.settingsWindow.loadFile("./settings-page/settings.html");
        this.settingsWindow.once("ready-to-show", () => {
            this.settingsWindow.show();

            this.waitingForSettings = true;

            //Setup some logic to prevent the window from closing when the user closes it initially.
            //We can then save the new settings to the config, THEN close it ourselves.
            this.settingsWindow.addListener("close", (e) => {
                //Only prevent close when we havent saved settings yet
                //We can trigger this ourselves hence we need this.
                if (this.waitingForSettings) {
                    log.info("Settings window is going to be closed!");
                    this.settingsWindow.webContents.send("GetNewSettings", configObject);

                    //We need to prevent the close for us to save the new settings.
                    //Once that is done, THEN we close it ourselves.
                    e.preventDefault();
                    e.returnValue = false;
                }
            });

            //Add the reply function
            ipcMain.on("GetNewSettings-Reply", async (event, arg) => {
                //Apply the new settings to the config.
                //The data we get is from the settings window, from the rendering process.

                const c = configObject;
                c.tf2_directory = arg.tf2_directory;
                c.steam_directory = arg.steam_directory;
                await Config.SaveConfig(c);

                this.waitingForSettings = false;

                this.settingsWindow.close();

                //Remove this listner now as it will cause a double subscription.
                ipcMain.removeAllListeners("GetNewSettings-Reply");
            });

            ipcMain.on("ClearModList", (event, arg) => {
                if (ModListLoader.DeleteLocalModList()) {
                    dialog.showMessageBox({
                        type: "info",
                        title: "Settings",
                        message: "Local mod list cache was cleared.",
                        buttons: ["OK"]
                    });
                }
            });
        });
    }
}

ipcMain.on("open-config-location", async (event, arg) => {
    try {
        shell.showItemInFolder(await Config.GetConfigFullPath());
    }
    catch (e) {
        log.error("Failed to open config location: " + e.toString());
    }
});

ipcMain.on("open-log-location", (event, arg) => {
    try {
        shell.showItemInFolder(Utilities.GetLogsFolder());
    }
    catch (e) {
        log.error("Failed to open log location: " + e.toString());
    }
});

ipcMain.on("GetCurrentVersion", (event, arg) => {
    event.reply("GetCurrentVersion-Reply", Utilities.GetCurrentVersion());
});

export default SettingsPage;
