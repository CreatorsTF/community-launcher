import { dialog } from "electron";
import fs from "fs";
import process from "process";

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

}

export default Utilities;