"use strict";
const { dialog } = require("electron");
const path = require("path");

module.exports = class Utilities {

    static ErrorDialog(error, title){
        global.log.error(`Error Dialog shown: ${title} : ${error.toString()}`);
        dialog.showMessageBox(global.mainWindow, {
            type: "error",
            title: title,
            message: error.toString(),
            buttons: ["OK"]
        });
    }

    static currentLauncherVersion = null;

    static GetCurrentVersion() {
        if (this.currentLauncherVersion == null) {
            try {
                let packageJson = global.fs.readFileSync(path.join(__dirname, "../package.json"));
                this.currentLauncherVersion = JSON.parse(packageJson).version;
            }
            catch {
                return null;
            }
        }
        return this.currentLauncherVersion;
    }

}