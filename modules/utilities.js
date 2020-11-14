"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utilities = void 0;
var electron_1 = require("electron");
var fs_1 = __importDefault(require("fs"));
var process_1 = __importDefault(require("process"));
var ProgressBar = require('electron-progressbar');
var app = require("electron").app;
var loadingTextStyle = {
    color: "ghostwhite"
};
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
    Utilities.GetNewLoadingPopup = function (title, mainWindow, onCanceled) {
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
    };
    return Utilities;
}());
exports.Utilities = Utilities;
//# sourceMappingURL=utilities.js.map