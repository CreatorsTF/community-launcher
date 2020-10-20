const { BrowserWindow } = require('electron');
const path = require("path");

var patchNotesWindow;

module.exports.OpenWindow = OpenWindow;
function OpenWindow() {
    global.log.info("Loading Patch Notes window...");
    patchNotesWindow = new BrowserWindow({
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
        minWidth: 960,
        minHeight: 600,
        width: screenWidth-350,
        height: screenHeight-100
    });
    if (!isDev) patchNotesWindow.removeMenu();
    patchNotesWindow.loadFile(path.resolve(__dirname, "patchnotes.html"));
    patchNotesWindow.once("ready-to-show", () => {
        patchNotesWindow.show();
    });
}
