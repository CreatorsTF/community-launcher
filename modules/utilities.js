"use strict";
const { dialog } = require("electron");

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

}