"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var fs_1 = __importDefault(require("fs"));
var process_1 = __importDefault(require("process"));
var Utilities = /** @class */ (function () {
    function Utilities() {
    }
    /**
     * Create an error dialog and print the error to the log files.
     * @param error The error object/message.
     * @param title Title for the error dialog.
     */
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
    /**
     * Get the data folder dynamically based on the platform.
     */
    Utilities.GetDataFolder = function () {
        var _path = (process_1.default.env.APPDATA || (process_1.default.platform == 'darwin' ? process_1.default.env.HOME + '/Library/Preferences' : process_1.default.env.HOME + "/.local/share")) + "/creators-tf-launcher";
        if (!fs_1.default.existsSync(_path))
            fs_1.default.mkdirSync(_path);
        return _path;
    };
    return Utilities;
}());
exports.default = Utilities;
//# sourceMappingURL=utilities.js.map