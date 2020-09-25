"use strict";
const { dialog } = require("electron");

module.exports = class Utilities {

    static ErrorDialog(error, title){
        dialog.showMessageBox(global.mainWindow, {
            type: "error",
            title: title,
            message: error.toString(),
            buttons: ["OK"]
        });

        //If there is stack information, print it to the log.
        var errorPrint = `Error Dialog shown: ${title} : ${error.toString()}.`;
        if(error.stack != undefined) errorPrint += `\nError Stack:${error.stack}`;
        global.log.error(errorPrint);
    }

}