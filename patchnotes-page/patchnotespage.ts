import { BrowserWindow } from "electron";
import path from "path";
import isDev from "electron-is-dev";
import log from "electron-log";

class PatchnotesPage {
    public static patchnotesWindow: BrowserWindow;
    public static OpenWindow(mainWindow: any, screenWidth: number, screenHeight: number, minWindowWidth: number, minWindowHeight: number, icon: string) {
        log.info("Loading Patch Notes window...");
        this.patchnotesWindow = new BrowserWindow({
            parent: mainWindow,
            webPreferences: {
                preload: path.join(__dirname, "patchnotespage-preload.js"),
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
            this.patchnotesWindow.removeMenu();
        }
        this.patchnotesWindow.loadFile(path.join(__dirname, "..", "..", "patchnotes-page", "patchnotes.html"));
        this.patchnotesWindow.once("ready-to-show", () => {
            this.patchnotesWindow.show();
        });
    }
}

export default PatchnotesPage;