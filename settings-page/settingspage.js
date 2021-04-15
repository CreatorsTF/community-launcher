const { BrowserWindow, ipcMain, shell, dialog } = require("electron");
const config = require("../modules/config");
const path = require("path");
const {ModListLoader} = require("../modules/mod_list_loader");
const {Utilities} = require("../modules/utilities");
const isDev = require("electron-is-dev");

var settingsWindow;
var waitingForSettings = true;

module.exports.OpenWindow = OpenWindow;
function OpenWindow(screenWidth, screenHeight, configObject) {
    global.log.info("Loading Settings window...");
    settingsWindow = new BrowserWindow({
        parent: global.mainWindow,
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
        minWidth: 960,
        minHeight: 540,
        width: screenWidth-250,
        height: screenHeight-100
    });
    if (!isDev) settingsWindow.removeMenu();
    settingsWindow.loadFile("./settings-page/settings.html");
    settingsWindow.once("ready-to-show", () => {
        settingsWindow.show();

        waitingForSettings = true;

        //Setup some logic to prevent the window from closing when the user closes it initially.
        //We can then save the new settings to the config, THEN close it ourselves.
        settingsWindow.addListener("close", (e) => {
            //Only prevent close when we havent saved settings yet
            //We can trigger this ourselves hence we need this.
            if (waitingForSettings) {
                global.log.info("Settings window is going to be closed!");
                settingsWindow.webContents.send("GetNewSettings", configObject);

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

            let c = configObject;
            c.tf2_directory = arg.tf2_directory;
            c.steam_directory = arg.steam_directory;
            await config.SaveConfig(c);

            waitingForSettings = false;

            settingsWindow.close();

            //Remove this listner now as it will cause a double subscription.
            ipcMain.removeAllListeners("GetNewSettings-Reply");
        });

        ipcMain.on("ClearModList", (event, arg) => {
            if(ModListLoader.DeleteLocalModList()){
                dialog.showMessageBox({
                    type: "info",
                    title: "Settings",
                    message: "Local mod list cache was cleared.",
                    buttons: ["OK"]
                })
            }
        });
    });
}

ipcMain.on("open-config-location", async (event, arg) => {
    try {
        shell.showItemInFolder(await config.GetConfigFullPath());
    }
    catch(e) {
        global.log.error("Failed to open config location: " + e.toString());
    }
});

ipcMain.on("open-log-location", (event, arg) => {
    try {
        shell.showItemInFolder(Utilities.GetLogsFolder());
    }
    catch(e) {
        global.log.error("Failed to open log location: " + e.toString());
    }
});

ipcMain.on("GetCurrentVersion", (event, arg) => {
    event.reply("GetCurrentVersion-Reply", Utilities.GetCurrentVersion());
});