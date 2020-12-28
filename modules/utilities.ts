import { dialog } from "electron";
import fs from "fs";
import process from "process";
import path from "path";
const ProgressBar = require('electron-progressbar');
const {app} = require("electron");
import log from "electron-log";

const loadingTextStyle = {
    color: "ghostwhite"
}

class Utilities {

    /**
     * Create an error dialog and print the error to the log files.
     * @param error The error object/message.
     * @param title Title for the error dialog.
     */
    static ErrorDialog(error : any, title : string){
        //@ts-ignore
        global.log.error(`Error Dialog shown: ${title} : ${error.toString()}`);
        //@ts-ignore
        dialog.showMessageBox(global.mainWindow, {
            type: "error",
            title: title,
            message: error.toString(),
            buttons: ["OK"]
        });
    }

    /**
     * Get the data folder dynamically based on the platform.
     */
    static GetDataFolder() : string {
        let _path = (process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")) + "/creators-tf-launcher";
        
        if(!fs.existsSync(_path)) fs.mkdirSync(_path);

        return _path;
    }

    static GetLogsFolder() : string {
        return log.transports.file.getFile().path;
    }


    static GetNewLoadingPopup(title : string, mainWindow : any, onCanceled: () => void) : any {
        var progressBar = new ProgressBar({
            text: title,
            detail: '...',
            browserWindow: {
                webPreferences: {
                    nodeIntegration: true
                },
                parent: mainWindow,
                modal: true,
                title: title,
                backgroundColor: "#2b2826",
                closable: true
            },
            style: {
                text: loadingTextStyle,
                detail: loadingTextStyle,
                value: loadingTextStyle
            }
        }, app);
        
        progressBar
        .on('aborted', onCanceled);

        return progressBar;
    }

    static currentLauncherVersion = null;

    static GetCurrentVersion() {
        if (this.currentLauncherVersion == null) {
            try {
                let packageJson = fs.readFileSync(path.join(__dirname, "../package.json"));
                this.currentLauncherVersion = JSON.parse(packageJson.toString()).version;
            }
            catch {
                return null;
            }
        }
        return this.currentLauncherVersion;
    }
}

export {Utilities};