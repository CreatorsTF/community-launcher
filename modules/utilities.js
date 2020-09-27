"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
module.exports = /** @class */ (function () {
    function Utilities() {
    }
    Utilities.ErrorDialog = function (error, title) {
        //@ts-ignore
        global.log.error("Error Dialog shown: " + title + " : " + error.toString());
        //@ts-ignore
        electron_1.dialog.showMessageBox(global.mainWindow, {
            type: "error",
            title: title,
            message: error.toString(),
            buttons: ["OK"]
        });
    };
    return Utilities;
}());
//# sourceMappingURL=utilities.js.map