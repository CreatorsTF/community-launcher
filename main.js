"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var electron_is_dev_1 = __importDefault(require("electron-is-dev"));
var settingspage_1 = __importDefault(require("./settings-page/settingspage"));
var patchnotespage_1 = __importDefault(require("./patchnotes-page/patchnotespage"));
var serverlistpage_1 = require("./serverlist-page/serverlistpage");
var mod_manager_1 = __importDefault(require("./modules/mod_manager"));
var electron_updater_1 = require("electron-updater");
var utilities_1 = require("./modules/utilities");
var mod_list_loader_1 = require("./modules/remote_file_loader/mod_list_loader");
var path_1 = __importDefault(require("path"));
var os_1 = __importDefault(require("os"));
var _config = require("./modules/config");
var electron_log_1 = __importDefault(require("electron-log"));
var quickplay_config_loader_1 = __importDefault(require("./modules/remote_file_loader/quickplay_config_loader"));
var quickplay_1 = __importDefault(require("./modules/api/quickplay"));
electron_log_1.default.transports.console.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
electron_log_1.default.transports.file.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
electron_log_1.default.transports.file.fileName = "main.log";
electron_log_1.default.transports.file.maxSize = 10485760;
electron_log_1.default.transports.file.getFile();
global.log = electron_log_1.default;
var majorErrorMessageEnd = "\nIf this error persists, please report it on our GitHub page by making a new 'Issue'.\nVisit creators.tf/launcher for more info.\nYou can also report if via our Discord.";
var Main = (function () {
    function Main() {
    }
    Main.createWindow = function () {
        var _this = this;
        var _a = electron_1.screen.getPrimaryDisplay().workAreaSize, width = _a.width, height = _a.height;
        this.screenWidth = width;
        this.screenHeight = height;
        try {
            Main.mainWindow = new electron_1.BrowserWindow({
                minWidth: 960,
                minHeight: 540,
                width: this.screenWidth - 200,
                height: this.screenHeight - 150,
                webPreferences: {
                    preload: path_1.default.join(__dirname, "preload.js"),
                    nodeIntegration: false
                },
                center: true,
                maximizable: true,
                resizable: true,
                autoHideMenuBar: true,
                darkTheme: true,
                backgroundColor: "#2B2826"
            });
            global.mainWindow = Main.mainWindow;
            Main.app = electron_1.app;
            if (!electron_is_dev_1.default)
                Main.mainWindow.removeMenu();
            _config.GetConfig().then(function (c) {
                _this.config = c;
                try {
                    mod_manager_1.default.Setup().then(function () { return Main.mainWindow.loadFile(path_1.default.resolve(__dirname, "index.html")); });
                }
                catch (e) {
                    electron_log_1.default.error(e.toString());
                    electron_1.dialog.showMessageBox({
                        type: "error",
                        title: "Startup Error - Main Window Load",
                        message: e.toString() + majorErrorMessageEnd,
                        buttons: ["OK"]
                    }).then(function (button) {
                        electron_1.app.quit();
                    });
                }
            })
                .catch(function (e) {
                electron_log_1.default.error(e.toString());
                electron_1.dialog.showMessageBox({
                    type: "error",
                    title: "Startup Error - Config Load",
                    message: e.toString() + majorErrorMessageEnd,
                    buttons: ["OK"]
                }).then(function (button) {
                    electron_1.app.quit();
                });
            });
        }
        catch (majorE) {
            electron_log_1.default.error(majorE.toString());
            electron_1.dialog.showMessageBox({
                type: "error",
                title: "Startup Error - Major Initial Error",
                message: majorE.toString() + majorErrorMessageEnd,
                buttons: ["OK"]
            }).then(function (button) {
                electron_1.app.quit();
            });
        }
    };
    Main.logDeviceInfo = function () {
        electron_log_1.default.log("Basic System Information: [platform: " + os_1.default.platform() + ", release: " + os_1.default.release() + ", arch: " + os_1.default.arch() + ", systemmem: " + (((os_1.default.totalmem() / 1024) / 1024) / 1024).toFixed(2) + " gb]");
    };
    Main.autoUpdateCheckAndSettings = function () {
        electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
        electron_updater_1.autoUpdater.logger = electron_log_1.default;
        electron_updater_1.autoUpdater.autoDownload = false;
        electron_log_1.default.info("Checking for updates.");
    };
    Main.getClientCurrentVersion = function () {
        var lVer = utilities_1.Utilities.GetCurrentVersion();
        if (lVer != null)
            electron_log_1.default.info("Current launcher version: " + lVer);
        else
            electron_log_1.default.error("Failed to get launcher version");
    };
    return Main;
}());
exports.default = Main;
electron_1.app.on("ready", function () {
    try {
        mod_list_loader_1.ModListLoader.instance.LoadLocalFile();
        quickplay_config_loader_1.default.instance.LoadLocalFile();
        Main.quickPlay = new quickplay_1.default();
        Main.createWindow();
        Main.getClientCurrentVersion();
        Main.autoUpdateCheckAndSettings();
        Main.logDeviceInfo();
        electron_log_1.default.info("Launcher was opened/finished initialization.");
    }
    catch (error) {
        electron_log_1.default.error(error.toString());
        electron_1.dialog.showMessageBox({
            type: "error",
            title: "App Ready Error - Major Initial Error",
            message: error.toString() + majorErrorMessageEnd,
            buttons: ["OK"]
        }).then(function (button) {
            electron_1.app.quit();
        });
    }
});
electron_1.app.on("activate", function () {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        Main.createWindow();
    }
});
electron_1.app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
        electron_log_1.default.info("Launcher was closed.");
    }
});
electron_updater_1.autoUpdater.on("checking-for-update", function () {
    electron_log_1.default.info("Checking for updates");
});
electron_updater_1.autoUpdater.on("update-not-available", function () {
    Main.mainWindow.webContents.send("update_not_available");
    electron_log_1.default.info("No updates available");
});
electron_updater_1.autoUpdater.on("update-available", function () {
    Main.mainWindow.webContents.send("update_available");
    electron_log_1.default.info("An update is available");
});
electron_1.ipcMain.on("download_update", function () {
    electron_updater_1.autoUpdater.downloadUpdate();
    Main.mainWindow.webContents.send("update_downloading");
    electron_log_1.default.info("Downloading update");
});
electron_updater_1.autoUpdater.on("update-downloaded", function () {
    Main.mainWindow.webContents.send("update_downloaded");
    electron_log_1.default.info("Update downloaded");
});
electron_updater_1.autoUpdater.on("error", function (err) {
    electron_log_1.default.error("Error in auto-updater: " + err);
});
electron_1.ipcMain.on("restart_app", function () {
    electron_updater_1.autoUpdater.quitAndInstall();
    electron_log_1.default.info("Restarting program to install an update");
});
electron_1.ipcMain.on("SettingsWindow", function (event, arg) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        settingspage_1.default.OpenWindow();
        return [2];
    });
}); });
electron_1.ipcMain.on("PatchNotesWindow", function (event, arg) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        patchnotespage_1.default.OpenWindow();
        return [2];
    });
}); });
electron_1.ipcMain.on("ServerListWindow", function (event, arg) { return __awaiter(void 0, void 0, void 0, function () {
    var modList, realModList, providers;
    return __generator(this, function (_a) {
        modList = mod_list_loader_1.ModListLoader.instance.GetFile();
        realModList = new mod_list_loader_1.ModList();
        Object.assign(realModList, modList);
        providers = realModList.GetMod(mod_manager_1.default.currentModData.name).serverlistproviders;
        if (providers != null)
            serverlistpage_1.ServerListPage.OpenWindow(Main.mainWindow, Main.screenWidth, Main.screenHeight, providers);
        else {
            if (electron_is_dev_1.default) {
                utilities_1.Utilities.ErrorDialog("There were no providers for the current mod! Populate the 'serverlistproviders' property", "Missing Server Providers");
            }
            else {
                electron_log_1.default.error("There were no providers for the current mod! Did not open server list page.");
            }
        }
        return [2];
    });
}); });
electron_1.ipcMain.on("GetConfig", function (event, arg) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        event.reply("GetConfig-Reply", Main.config);
        return [2];
    });
}); });
electron_1.ipcMain.on("SetCurrentMod", function (event, arg) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4, mod_manager_1.default.ChangeCurrentMod(arg)];
            case 1:
                result = _a.sent();
                event.reply("InstallButtonName-Reply", result);
                return [3, 3];
            case 2:
                error_1 = _a.sent();
                event.reply("InstallButtonName-Reply", "Internal Error");
                utilities_1.Utilities.ErrorDialog(electron_is_dev_1.default ? "Dev Error: " + error_1.toString() : "Failed to check if mod \"" + arg + "\" has updates. Its website may be down. Try again later.\nIf the error persists, please report it on our Discord.", "Mod Update Check Error");
                return [3, 3];
            case 3: return [2];
        }
    });
}); });
electron_1.ipcMain.on("install-play-click", function (event, args) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, mod_manager_1.default.ModInstallPlayButtonClick()];
            case 1:
                _a.sent();
                return [2];
        }
    });
}); });
electron_1.ipcMain.on("Visit-Mod-Social", function (event, arg) { return __awaiter(void 0, void 0, void 0, function () {
    var socialLink;
    return __generator(this, function (_a) {
        socialLink = mod_manager_1.default.currentModData[arg];
        if (socialLink != null && socialLink != "") {
            electron_1.shell.openExternal(socialLink);
        }
        return [2];
    });
}); });
electron_1.ipcMain.on("GetCurrentModVersion", function (event, arg) { return __awaiter(void 0, void 0, void 0, function () {
    var version;
    return __generator(this, function (_a) {
        try {
            version = mod_manager_1.default.GetCurrentModVersionFromConfig(mod_manager_1.default.currentModData.name);
            if (version == null) {
                version = "?";
            }
        }
        catch (_b) {
            version = "?";
        }
        event.reply("GetCurrentModVersion-Reply", version);
        return [2];
    });
}); });
electron_1.ipcMain.on("Remove-Mod", function (event, arg) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (mod_manager_1.default.currentModData != null && (mod_manager_1.default.currentModState == "INSTALLED" || mod_manager_1.default.currentModState == "UPDATE")) {
            electron_1.dialog.showMessageBox(Main.mainWindow, {
                type: "warning",
                title: "Remove Mod",
                message: "Would you like to uninstall the mod " + mod_manager_1.default.currentModData.name + "?",
                buttons: ["Yes", "Cancel"],
                cancelId: 1
            }).then(function (button) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(button.response == 0)) return [3, 2];
                            electron_log_1.default.info("Will start the mod removal process. User said yes.");
                            return [4, mod_manager_1.default.RemoveCurrentMod()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2];
                    }
                });
            }); });
        }
        return [2];
    });
}); });
electron_1.ipcMain.on("config-reload-tf2directory", function (event, steamdir) { return __awaiter(void 0, void 0, void 0, function () {
    var tf2dir;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(steamdir != "")) return [3, 2];
                return [4, _config.GetTF2Directory(steamdir)];
            case 1:
                tf2dir = _a.sent();
                if (tf2dir && tf2dir != "")
                    Main.config.steam_directory = steamdir;
                Main.config.tf2_directory = tf2dir;
                event.reply("GetConfig-Reply", Main.config);
                return [3, 3];
            case 2:
                utilities_1.Utilities.ErrorDialog("A Steam installation directory is required! Please populate your Steam installation path to auto locate TF2.\ne.g. 'C:/Program Files (x86)/Steam'", "TF2 Locate Error");
                _a.label = 3;
            case 3: return [2];
        }
    });
}); });
electron_1.ipcMain.on("GetModData", function (event, args) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        mod_list_loader_1.ModListLoader.instance.CheckForUpdates().then(function () {
            mod_list_loader_1.ModListLoader.instance.UpdateLocalFile();
            electron_log_1.default.verbose("Latest mod list was sent to renderer");
            event.reply("ShowMods", mod_list_loader_1.ModListLoader.instance.GetFile());
        });
        return [2];
    });
}); });
//# sourceMappingURL=main.js.map