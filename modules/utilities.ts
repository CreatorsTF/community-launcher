import { dialog, app } from "electron";
import fs from "fs";
import process from "process";
import path from "path";
import ProgressBar from "electron-progressbar";
import log from "electron-log";
import { Install } from "./mod_list_loader";

const loadingTextStyle = {
    color: "ghostwhite"
};

class Utilities {
    /**
     * Create an error dialog and print the error to the log files.
     * @param error The error object/message.
     * @param title Title for the error dialog.
     */
    public static ErrorDialog(error: any, title: string): any {
        log.error(`Error Dialog shown: ${title} : ${error.toString()}`);
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
    public static GetDataFolder(): string {
        const _path = (process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share")) + "/creators-tf-launcher";
        
        if (!fs.existsSync(_path)) {
            fs.mkdirSync(_path);
        }

        return _path;
    }

    static GetLogsFolder(): string {
        return log.transports.file.getFile().path;
    }

    static GetNewLoadingPopup(title: string, mainWindow: any, onCanceled: () => void): any {
        const progressBar = new ProgressBar({
            text: title,
            detail: "...",
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
        
        progressBar.on("aborted", onCanceled);

        return progressBar;
    }

    public static currentLauncherVersion: string;

    public static GetCurrentVersion(): string {
        if (this.currentLauncherVersion == null) {
            try {
                const packageJson = fs.readFileSync(path.join(__dirname, "../package.json"));
                this.currentLauncherVersion = JSON.parse(packageJson.toString()).version;
            }
            catch {
                return null;
            }
        }
        return this.currentLauncherVersion;
    }

    //Find which element in an Install[] has the desiredCollectionString as an argument
    public static FindCollectionNumber(Installs: Install[], desiredCollectionString: string): number {
    
        if (typeof(desiredCollectionString) == "undefined") {
            return 0;
        }

        if(Installs.length < 2) {
            //It has a single item
            return 0;
        }
        
        for (let i = 0; i < Installs.length; i++) {
            const element = Installs[i];
            if (element.itemname == desiredCollectionString) {
                //We've found it!
                return i;
            }
        }
    }
}

export default Utilities;