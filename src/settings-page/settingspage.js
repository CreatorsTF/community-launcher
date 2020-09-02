const { BrowserWindow, ipcMain, shell } = require("electron");
const config = require("../modules/config");
const path = global.path;

var settingsWindow;
var waitingForSettings = true;

module.exports.OpenWindow = OpenWindow;
function OpenWindow() {
    global.log.info("Loading Settings window...");
    settingsWindow = new BrowserWindow({
        parent: global.mainWindow,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false
        },
        modal: true,
        show: false,
        center: true,
        darkTheme: true,
        maximizable: true,
        resizable: true,
        autoHideMenuBar: true,
        minWidth: 640,
        minHeight: 500,
        width: 700,
        height: 550
    });
    settingsWindow.removeMenu();
    settingsWindow.loadFile(path.join(__dirname, "settings.html"));
    settingsWindow.once("ready-to-show", () => {
        settingsWindow.show();

        waitingForSettings = true;

        //Setup some logic to prevent the window from closing when the user closes it initialy.
        //We can then save the new settings to the config, THEN close it ourselves.
        settingsWindow.addListener("close", (e) => {
            //Only prevent close when we havent saved settings yet
            //We can trigger this ourselves hence we need this.
            if (waitingForSettings) {
                global.log.info("Settings window is going to be closed!");
                settingsWindow.webContents.send("GetNewSettings", global.config);

                //We need to prevent the close for us to save the new settings.
                //Once that is done, THEN we close it ourselves.
                e.preventDefault();
                e.returnValue = false;
            }
        });

        //Add the reply function
        ipcMain.on("GetNewSettings-Reply", (event, arg) => {
            //Apply the new settings to the config.
            //The data we get is from the settings window, from the rendering process.
            let c = global.config;
            c.tf2_directory = arg.tf2_directory;
            c.steam_directory = arg.steam_directory;
            config.SaveConfig(c);
            global.config = c;

            waitingForSettings = false;

            settingsWindow.close();

            //Remove this listner now as it will cause a double subscription.
            ipcMain.removeAllListeners("GetNewSettings-Reply");
        });
    });
}

ipcMain.on("open-config-location", (event, arg) => {
    try {
        shell.showItemInFolder(config.GetConfigFullPath());
    }
    catch(e) {
        global.log.error("Failed to open config location: " + e.toString());
    }
});
