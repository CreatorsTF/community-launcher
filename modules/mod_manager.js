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
//Manages main functions mod installation, downloading and removal.
var path_1 = __importDefault(require("path"));
var os_1 = __importDefault(require("os"));
var electron_1 = require("electron");
var https_1 = __importDefault(require("https"));
var jszip_1 = __importDefault(require("jszip"));
var url_1 = __importDefault(require("url"));
var electron_progressbar_1 = __importDefault(require("electron-progressbar"));
var electron_log_1 = __importDefault(require("electron-log"));
var fs_extensions_1 = __importDefault(require("./fs_extensions"));
var config_1 = __importDefault(require("./config"));
var errors_1 = __importDefault(require("./errors"));
var file_manager_1 = __importDefault(require("./file_manager"));
var github_source_js_1 = __importDefault(require("./mod_sources/github_source.js"));
var jsonlist_source_js_1 = __importDefault(require("./mod_sources/jsonlist_source.js"));
var mod_list_loader_1 = require("./remote_file_loader/mod_list_loader");
var main_1 = __importDefault(require("../main"));
var electron_log_2 = __importDefault(require("electron-log"));
var functionMap = new Map();
//Shared by all loading bar uis to set text colour.
var loadingTextStyle = {
    color: "ghostwhite"
};
var DownloadedFile = /** @class */ (function () {
    function DownloadedFile(buffer, name) {
        this.buffer = buffer;
        this.name = name;
        //Store the file extension now.
        this.extension = path_1.default.extname(this.name);
    }
    return DownloadedFile;
}());
var ModManager = /** @class */ (function () {
    function ModManager() {
    }
    //Sets up the module.
    ModManager.Setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.all_mods_data = mod_list_loader_1.ModListLoader.instance.GetFile();
                        return [4 /*yield*/, file_manager_1.default.Init()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    //Change the currently selected mod, return its installation button text.
    ModManager.ChangeCurrentMod = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var version, e_1, version;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        //Get this mods data and store it for use.
                        this.currentModData = this.GetModDataByName(name);
                        this.currentModVersion = this.GetCurrentModVersionFromConfig(name);
                        this.currentModState = "NOT_INSTALLED";
                        this.currentModVersionRemote = 0;
                        electron_log_2.default.log("Set current mod to: " + this.currentModData.name);
                        //Setup the source manager object depending on the type of the mod.
                        switch (this.currentModData.install.type) {
                            case "jsonlist":
                                this.source_manager = new jsonlist_source_js_1.default(this.currentModData.install);
                                break;
                            case "github":
                                this.source_manager = new github_source_js_1.default(this.currentModData.install);
                                break;
                            default:
                                this.source_manager = null;
                                throw new Error("Mod install type was not recognised: " + this.currentModData.install.type);
                        }
                        if (!(this.currentModVersion == null || this.currentModVersion == 0)) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.source_manager.GetLatestVersionNumber()];
                    case 2:
                        version = _a.sent();
                        this.currentModState = "NOT_INSTALLED";
                        this.currentModVersionRemote = version;
                        return [2 /*return*/, "Install"];
                    case 3:
                        e_1 = _a.sent();
                        throw new errors_1.default.InnerError("Failed to get mod version: " + e_1.toString(), e_1);
                    case 4: return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.source_manager.GetLatestVersionNumber()];
                    case 6:
                        version = _a.sent();
                        //Compare the currently selected version number to this one. If ours is smaller, update. If not, do nothing.
                        this.currentModVersionRemote = version;
                        if (version > this.currentModVersion)
                            this.currentModState = "UPDATE";
                        else
                            this.currentModState = "INSTALLED";
                        //Time to resolve with the text to show on the button
                        switch (this.currentModState) {
                            case "INSTALLED":
                                return [2 /*return*/, "Installed"];
                            case "UPDATE":
                                return [2 /*return*/, "Update"];
                            default:
                                return [2 /*return*/, "Install"];
                        }
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    //Trigger the correct response to the current mod depending on its state.
    //This is called when the Install / Update / Installed button is pressed in the UI.
    ModManager.ModInstallPlayButtonClick = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _url, e_2, version, displayVersion, update_msg, button;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        electron_log_2.default.log("Install button was clicked! Reacting based on state: " + this.currentModState);
                        if (!(this.currentModData == null)) return [3 /*break*/, 2];
                        this.FakeClickMod();
                        return [4 /*yield*/, ErrorDialog("Mod data was not able to be read.\nPlease report this error.", "Mod Install Start Error")];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                    case 2:
                        _a = this.currentModState;
                        switch (_a) {
                            case "NOT_INSTALLED": return [3 /*break*/, 3];
                            case "UPDATE": return [3 /*break*/, 12];
                        }
                        return [3 /*break*/, 18];
                    case 3:
                        //We should try to install this mod!
                        //Before we try anything we need to validate the tf2 install directory. Otherwise downloading is a waste.
                        electron_log_2.default.log("Will validate TF2 path before starting download...");
                        return [4 /*yield*/, ValidateTF2Dir()];
                    case 4:
                        if (!(_b.sent())) {
                            this.FakeClickMod();
                            electron_log_2.default.error("Ending Install attempt now as validation failed!");
                            return [2 /*return*/];
                        }
                        electron_log_2.default.log("TF2 Path was validated.");
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 9, , 11]);
                        return [4 /*yield*/, this.source_manager.GetFileURL()];
                    case 6:
                        _url = _b.sent();
                        electron_log_2.default.log("Successfuly got mod install file urls. Will proceed to try to download them.");
                        return [4 /*yield*/, this.ModInstall(_url)];
                    case 7:
                        _b.sent();
                        return [4 /*yield*/, this.SetupNewModAsInstalled()];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 9:
                        e_2 = _b.sent();
                        this.FakeClickMod();
                        return [4 /*yield*/, ErrorDialog(e_2, "Mod Begin Install Error")];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 11: return [3 /*break*/, 19];
                    case 12:
                        //We should try to update this mod!
                        //Setup the message to include the version if we have the data.
                        //Really we should for this state to be active but best to be sure.
                        electron_log_2.default.log("Asking user if they want to update this mod.");
                        return [4 /*yield*/, this.source_manager.GetLatestVersionNumber()];
                    case 13:
                        version = _b.sent();
                        return [4 /*yield*/, this.source_manager.GetDisplayVersionNumber()];
                    case 14:
                        displayVersion = _b.sent();
                        update_msg = "Would you like to update this mod to version \"" + displayVersion + "\"?";
                        return [4 /*yield*/, electron_1.dialog.showMessageBox(main_1.default.mainWindow, {
                                type: "question",
                                title: "Update",
                                message: update_msg,
                                buttons: ["Yes", "Cancel"],
                                cancelId: 1
                            })];
                    case 15:
                        button = _b.sent();
                        if (!(button.response == 0)) return [3 /*break*/, 17];
                        //Do the update!
                        electron_log_2.default.log("Starting update process...");
                        return [4 /*yield*/, this.UpdateCurrentMod()];
                    case 16:
                        _b.sent();
                        _b.label = 17;
                    case 17: return [3 /*break*/, 19];
                    case 18:
                        electron_log_2.default.error("Somehow the install button was clicked when the mod is in the installed state.");
                        return [3 /*break*/, 19];
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    //Attempt an update. If possible then we do it. Will try to do it incrementally or a full re download.
    ModManager.UpdateCurrentMod = function () {
        return __awaiter(this, void 0, void 0, function () {
            var version, jsonSourceManager, data, urls, patchObjects, patchURLS_1, i, _url, _url, e_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ValidateTF2Dir()];
                    case 1:
                        //Validate tf2 dir, then make sure we have the current data for the mod.
                        if (!(_a.sent())) {
                            this.FakeClickMod();
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.source_manager.GetLatestVersionNumber()];
                    case 2:
                        version = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 22, , 24]);
                        if (!(version > this.currentModVersion)) return [3 /*break*/, 21];
                        if (!(this.currentModData.install.type == "jsonlist")) return [3 /*break*/, 14];
                        jsonSourceManager = this.source_manager;
                        return [4 /*yield*/, jsonSourceManager.GetJsonData()];
                    case 4:
                        data = _a.sent();
                        urls = [];
                        if (data.hasOwnProperty("PatchUpdates") && data.PatchUpdates.length > 0) {
                            patchObjects = data.PatchUpdates;
                            patchURLS_1 = [];
                            patchObjects.forEach(function (patch) {
                                if (patch.Version > _this.currentModVersion)
                                    patchURLS_1.push(patch);
                            });
                            //Sort the urls soo we apply updates from the oldest update to the newest.
                            patchURLS_1.sort(function (a, b) {
                                //We want to sort smaller version numbers FIRST
                                //Soo they get applied first later.
                                if (a.Version > b.Version)
                                    return 1;
                                if (a.Version < b.Version)
                                    return -1;
                                return 0;
                            });
                            //Get out the urls for easier use later.
                            for (i = 0; i < patchURLS_1.length; i++) {
                                urls.push(patchURLS_1[i].DownloadURL);
                            }
                        }
                        if (!(urls.length > 0)) return [3 /*break*/, 8];
                        electron_log_2.default.log("Incremental update will begin for current mod using the following archive urls: " + urls.toString());
                        return [4 /*yield*/, this.ModInstall(urls)];
                    case 5:
                        _a.sent();
                        //Update the version for the mod.
                        SetNewModVersion(this.currentModVersionRemote, this.currentModData.name);
                        //Save the config changes.
                        return [4 /*yield*/, config_1.default.SaveConfig(main_1.default.config)];
                    case 6:
                        //Save the config changes.
                        _a.sent();
                        this.FakeClickMod();
                        return [4 /*yield*/, electron_1.dialog.showMessageBox(main_1.default.mainWindow, {
                                type: "info",
                                title: "Mod Update",
                                message: "Mod update for " + this.currentModData.name + " was completed successfully.",
                                buttons: ["OK"]
                            })];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 13];
                    case 8:
                        //We need to update using the main zip. Not ideal but works.
                        electron_log_2.default.warn("Update source does not have patch data! Will have to download again fully.");
                        return [4 /*yield*/, this.source_manager.GetFileURL()];
                    case 9:
                        _url = _a.sent();
                        return [4 /*yield*/, this.ModInstall(_url)];
                    case 10:
                        _a.sent();
                        SetNewModVersion(this.currentModVersionRemote, this.currentModData.name);
                        //Save the config changes.
                        return [4 /*yield*/, config_1.default.SaveConfig(main_1.default.config)];
                    case 11:
                        //Save the config changes.
                        _a.sent();
                        this.FakeClickMod();
                        return [4 /*yield*/, electron_1.dialog.showMessageBox(main_1.default.mainWindow, {
                                type: "info",
                                title: "Mod Update",
                                message: "Mod update for " + this.currentModData.name + " was completed successfully.",
                                buttons: ["OK"]
                            })];
                    case 12:
                        _a.sent();
                        _a.label = 13;
                    case 13: return [3 /*break*/, 21];
                    case 14:
                        if (!(this.currentModData.install.type == "github")) return [3 /*break*/, 19];
                        return [4 /*yield*/, this.source_manager.GetFileURL()];
                    case 15:
                        _url = _a.sent();
                        electron_log_2.default.log("Mod is type GitHub, will update using the most recent release url: " + _url);
                        return [4 /*yield*/, this.ModInstall(_url)];
                    case 16:
                        _a.sent();
                        SetNewModVersion(this.currentModVersionRemote, this.currentModData.name);
                        //Save the config changes.
                        return [4 /*yield*/, config_1.default.SaveConfig(main_1.default.config)];
                    case 17:
                        //Save the config changes.
                        _a.sent();
                        this.FakeClickMod();
                        return [4 /*yield*/, electron_1.dialog.showMessageBox(main_1.default.mainWindow, {
                                type: "info",
                                title: "Mod Update",
                                message: "Mod update for " + this.currentModData.name + " was completed successfully.",
                                buttons: ["OK"]
                            })];
                    case 18:
                        _a.sent();
                        return [3 /*break*/, 21];
                    case 19:
                        electron_log_2.default.error("Unknown mod type found during update attempt.");
                        return [4 /*yield*/, ErrorDialog("Unknown mod type found during update attempt.", "Error")];
                    case 20:
                        _a.sent();
                        _a.label = 21;
                    case 21: return [3 /*break*/, 24];
                    case 22:
                        e_3 = _a.sent();
                        return [4 /*yield*/, ErrorDialog(e_3, "Mod Update Error")];
                    case 23:
                        _a.sent();
                        return [3 /*break*/, 24];
                    case 24: return [2 /*return*/];
                }
            });
        });
    };
    ModManager.ModInstall = function (contentURL) {
        return __awaiter(this, void 0, void 0, function () {
            var urlArray, files, e_4, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (Array.isArray(contentURL))
                            urlArray = contentURL;
                        else {
                            urlArray = [];
                            urlArray.push(contentURL);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 10]);
                        return [4 /*yield*/, DownloadFiles_UI(urlArray)];
                    case 2:
                        files = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 7]);
                        return [4 /*yield*/, this.InstallFiles(files)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        e_4 = _a.sent();
                        return [4 /*yield*/, ErrorDialog(e_4, "Mod Install Error")];
                    case 6:
                        _a.sent();
                        this.FakeClickMod();
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_5 = _a.sent();
                        return [4 /*yield*/, ErrorDialog(e_5, "Mod Files Download Error")];
                    case 9:
                        _a.sent();
                        this.FakeClickMod();
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    //Set up the config information to actually define this mod as installed. MUST BE DONE.
    ModManager.SetupNewModAsInstalled = function () {
        return __awaiter(this, void 0, void 0, function () {
            var versionUpdated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        versionUpdated = SetNewModVersion(this.currentModVersionRemote, this.currentModData.name);
                        //If we didnt update the version of an exstisting object. Add it.
                        if (!versionUpdated)
                            main_1.default.config.current_mod_versions.push({ name: this.currentModData.name, version: this.currentModVersionRemote });
                        //Save the config changes.
                        return [4 /*yield*/, config_1.default.SaveConfig(main_1.default.config)];
                    case 1:
                        //Save the config changes.
                        _a.sent();
                        this.currentModState = "INSTALLED";
                        this.FakeClickMod();
                        return [4 /*yield*/, electron_1.dialog.showMessageBox(main_1.default.mainWindow, {
                                type: "info",
                                title: "Mod Install",
                                message: "Mod files installation for " + this.currentModData.name + " was completed successfully.",
                                buttons: ["OK"]
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ModManager.RemoveCurrentMod = function () {
        return __awaiter(this, void 0, void 0, function () {
            var progressBar, files_object, running, i, i_1, element, e_6, errorString;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        //Do nothing if this mod is not installed or if there is no mod data.
                        if (this.currentModData == null || this.currentModState == "NOT_INSTALLED")
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 19, , 21]);
                        return [4 /*yield*/, file_manager_1.default.GetFileList(this.currentModData.name)];
                    case 2:
                        files_object = _a.sent();
                        running = true;
                        if (!(files_object.files != null && files_object.files.length > 0)) return [3 /*break*/, 16];
                        progressBar = new electron_progressbar_1.default({
                            indeterminate: false,
                            text: "Removing Mod Files",
                            detail: "Starting Removal...",
                            maxValue: files_object.files.length,
                            abortOnError: true,
                            closeOnComplete: false,
                            browserWindow: {
                                webPreferences: {
                                    nodeIntegration: true
                                },
                                width: 550,
                                parent: main_1.default.mainWindow,
                                modal: true,
                                title: "Removing Mod Files",
                                backgroundColor: "#2b2826",
                                closable: true
                            },
                            style: {
                                text: loadingTextStyle,
                                detail: loadingTextStyle,
                                value: loadingTextStyle
                            }
                        }, main_1.default.app);
                        //Setup events to display data.
                        progressBar
                            .on('completed', function () {
                            progressBar.detail = 'Removal Done.';
                        })
                            .on('aborted', function (value) {
                            running = false;
                            ErrorDialog("Mod Removal was canceled and may be incomplete. You may need to re install the mod to remove it correctly.", "Removal Canceled!");
                            _this.FakeClickMod();
                        }).
                            on('progress', function (value) {
                            progressBar.detail = value + " files removed out of " + progressBar.maxValue;
                        });
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < files_object.files.length)) return [3 /*break*/, 8];
                        if (!running)
                            return [2 /*return*/];
                        electron_log_2.default.log("Deleting file: " + files_object.files[i]);
                        return [4 /*yield*/, fs_extensions_1.default.fileExists(files_object.files[i])];
                    case 4:
                        if (!_a.sent()) return [3 /*break*/, 6];
                        return [4 /*yield*/, fs_extensions_1.default.unlink(files_object.files[i])];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        progressBar.value = i + 1;
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 3];
                    case 8: return [4 /*yield*/, Delay(300)];
                    case 9:
                        _a.sent();
                        running = false;
                        progressBar.setCompleted();
                        progressBar.close();
                        return [4 /*yield*/, fs_extensions_1.default.fileExists(files_object.files[0])];
                    case 10:
                        if (!_a.sent()) return [3 /*break*/, 12];
                        return [4 /*yield*/, ErrorDialog("Mod Removal Failed, TF2 may be using these files still. You must close TF2 to remove a mod.", "Removal Error")];
                    case 11:
                        _a.sent();
                        this.FakeClickMod();
                        return [2 /*return*/];
                    case 12: 
                    //Remove mod file list.
                    return [4 /*yield*/, file_manager_1.default.RemoveFileList(this.currentModData.name)];
                    case 13:
                        //Remove mod file list.
                        _a.sent();
                        //Remove mod from current config
                        for (i_1 = 0; i_1 < main_1.default.config.current_mod_versions.length; i_1++) {
                            element = main_1.default.config.current_mod_versions[i_1];
                            if (element.name && element.name == this.currentModData.name) {
                                main_1.default.config.current_mod_versions.splice(i_1, 1);
                            }
                        }
                        return [4 /*yield*/, config_1.default.SaveConfig(main_1.default.config)];
                    case 14:
                        _a.sent();
                        return [4 /*yield*/, electron_1.dialog.showMessageBox(main_1.default.mainWindow, {
                                type: "info",
                                title: "Mod Removal Complete",
                                message: "The mod \"" + this.currentModData.name + "\" has been removed successfully.\n" + files_object.files.length + " files were removed.",
                                buttons: ["OK"]
                            })];
                    case 15:
                        _a.sent();
                        this.FakeClickMod();
                        return [3 /*break*/, 18];
                    case 16: return [4 /*yield*/, electron_1.dialog.showMessageBox(main_1.default.mainWindow, {
                            type: "error",
                            title: "Mod Removal Error",
                            message: "Mod cannot be removed. Please try to remove them manually.",
                            buttons: ["OK"]
                        })];
                    case 17:
                        _a.sent();
                        _a.label = 18;
                    case 18: return [3 /*break*/, 21];
                    case 19:
                        e_6 = _a.sent();
                        progressBar.setCompleted();
                        progressBar.close();
                        if (e_6.toString().includes("EBUSY")) {
                            errorString = "Mod file(s) were busy or in use. You cannot remove a mod if TF2 is still running.\nSome files may not be deleted and some may remain.\nClose TF2 and try removing the mod again.";
                        }
                        else {
                            errorString = e_6.toString();
                        }
                        return [4 /*yield*/, ErrorDialog("Mod Removal Failed.\n" + errorString, "Mod Removal Error")];
                    case 20:
                        _a.sent();
                        this.FakeClickMod();
                        return [3 /*break*/, 21];
                    case 21: return [2 /*return*/];
                }
            });
        });
    };
    //Get the mod data object by the given name.
    ModManager.GetModDataByName = function (name) {
        if (this.all_mods_data) {
            for (var i = 0; i < this.all_mods_data.mods.length; i++) {
                var element = this.all_mods_data.mods[i];
                if (element.name && element.name == name) {
                    return element;
                }
            }
        }
        return null;
    };
    //Find the current version of the mod given by name that we have in our config. No version means it is not installed.
    ModManager.GetCurrentModVersionFromConfig = function (name) {
        var toReturn = null;
        for (var i = 0; i < main_1.default.config.current_mod_versions.length; i++) {
            var element = main_1.default.config.current_mod_versions[i];
            if (element.name && element.name == name) {
                toReturn = element;
                break;
            }
        }
        //Return the version if it was there.
        if (toReturn != null) {
            return toReturn.version;
        }
        else {
            return null;
        }
    };
    ModManager.GetRealInstallPath = function () {
        var realPath = this.currentModData.install.targetdirectory;
        //To ensure the path is correct when resolved. Good one Zonical.
        if (!realPath.endsWith("/") && !realPath.endsWith("\\")) {
            realPath += "/";
        }
        realPath = path_1.default.normalize(realPath);
        return path_1.default.normalize(realPath.replace("{tf2_dir}", main_1.default.config.tf2_directory));
    };
    ModManager.InstallFiles = function (files) {
        return __awaiter(this, void 0, void 0, function () {
            var sortedFiles, i, f, handleF, fileEntries, entryIndex, entry, func, entryProcess;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sortedFiles = new Map();
                        for (i = 0; i < files.length; i++) {
                            f = files[i];
                            handleF = GetFileWriteFunction(f.extension);
                            if (!sortedFiles.has(handleF)) {
                                //Add the map value for this handle function and set its value as an empty array.
                                sortedFiles.set(handleF, []);
                            }
                            sortedFiles.get(handleF).push(f);
                        }
                        fileEntries = sortedFiles.entries();
                        entryIndex = 0;
                        entryProcess = function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        entry = fileEntries.next();
                                        if (entry != null) {
                                            func = entry.value[0];
                                        }
                                        return [4 /*yield*/, func(this.GetRealInstallPath(), entry.value[1], this.currentModData)];
                                    case 1:
                                        _a.sent();
                                        entryIndex++;
                                        if (!(entryIndex < sortedFiles.size)) return [3 /*break*/, 3];
                                        return [4 /*yield*/, entryProcess()];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); };
                        //Call to process the first entry
                        return [4 /*yield*/, entryProcess()];
                    case 1:
                        //Call to process the first entry
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ModManager.FakeClickMod = function () {
        var _this = this;
        //Send to trigger a reload of the mod in the UI. We can just trigger the mod change again in the ui now to update everything.
        //This sends an event to the render thread that we subscribe to.
        setTimeout(function () {
            main_1.default.mainWindow.webContents.send("FakeClickMod", _this.currentModData);
        }, 50);
    };
    ModManager.currentModVersion = 0;
    ModManager.currentModVersionRemote = 0;
    ModManager.downloadWindow = null;
    return ModManager;
}());
exports.default = ModManager;
function Delay(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
        });
    });
}
function DownloadFiles_UI(urls) {
    var currentIndex = 0;
    var files = [];
    return new Promise(function (resolve, reject) {
        var progressBar;
        var shouldStop = { value: false };
        var maxProgressVal = 0;
        var progressFunction = function (dataLength) {
            if (progressBar && !progressBar.isCompleted()) {
                try {
                    progressBar.value = dataLength;
                }
                catch (e) {
                    reject(e.toString());
                }
            }
        };
        var headersFunction = function (headers) {
            var contentLength = headers["content-length"];
            progressBar = new electron_progressbar_1.default({
                indeterminate: false,
                text: "Downloading Mod Files",
                detail: "Starting Download...",
                maxValue: contentLength,
                abortOnError: true,
                closeOnComplete: false,
                browserWindow: {
                    webPreferences: {
                        nodeIntegration: true
                    },
                    width: 550,
                    parent: main_1.default.mainWindow,
                    modal: true,
                    title: "Downloading Mod Files",
                    backgroundColor: "#2b2826",
                    closable: true
                },
                style: {
                    text: loadingTextStyle,
                    detail: loadingTextStyle,
                    value: loadingTextStyle
                }
            }, main_1.default.app);
            //Setup events to display data.
            progressBar
                .on('completed', function () {
                //progressBar.detail = 'Download Finished!';
            })
                .on('aborted', function (value) {
                shouldStop.value = true;
                reject("Download Cancelled by User!");
            })
                .on('progress', function (value) {
                try {
                    progressBar.detail = "[File " + (currentIndex + 1) + " of " + urls.length + "] Downloaded " + (Math.round((value / 1000000) * 100) / 100).toFixed(2) + " MB out of " + maxProgressVal + " MB.";
                }
                catch (e) {
                    reject(e.toString());
                }
            });
            maxProgressVal = Math.round((parseInt(contentLength) / 1000000) * 100) / 100;
        };
        //Setup download sequence for all files
        var downloadFunc = function () {
            electron_log_2.default.log("Starting Download for file at: " + urls[currentIndex]);
            DownloadFile(urls[currentIndex], progressFunction, headersFunction, shouldStop).then(function (file) {
                files.push(file);
                currentIndex++;
                if (currentIndex >= urls.length) {
                    progressBar.setCompleted();
                    progressBar.close();
                    resolve(files);
                }
                else {
                    progressBar.setCompleted();
                    progressBar.close();
                    setTimeout(downloadFunc, 50);
                }
            }).catch(function (error) {
                electron_log_2.default.error("Download failed on file(s) download");
                electron_log_2.default.error(error);
                reject(error);
            });
        };
        //Call the local function to download the first zip.
        downloadFunc();
    });
}
//Get all the files that exist in this zip file object and create them in the target directory.
//Also supports multiple zips to install at once.
function WriteZIPsToDirectory(targetPath, zips, currentModData) {
    return __awaiter(this, void 0, void 0, function () {
        var inProgress, written, currentZip, currentIndex, multipleZips, active, files_object, progressBar, zipConvertsInProgress, i, index, jszip, Write, HandleFile, HandleZips, DoExtract, CheckZipCreateDone;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    inProgress = 0;
                    written = 0;
                    currentIndex = 0;
                    multipleZips = false;
                    active = true;
                    return [4 /*yield*/, file_manager_1.default.GetFileList(currentModData.name)];
                case 1:
                    files_object = _a.sent();
                    progressBar = new electron_progressbar_1.default({
                        text: 'Extracting data',
                        detail: 'Starting data extraction...',
                        browserWindow: {
                            webPreferences: {
                                nodeIntegration: true
                            },
                            parent: main_1.default.mainWindow,
                            modal: true,
                            title: "Extracting files...",
                            backgroundColor: "#2b2826",
                            closable: true
                        },
                        style: {
                            text: loadingTextStyle,
                            detail: loadingTextStyle,
                            value: loadingTextStyle
                        }
                    });
                    zipConvertsInProgress = 0;
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < zips.length)) return [3 /*break*/, 5];
                    zipConvertsInProgress++;
                    index = i;
                    return [4 /*yield*/, jszip_1.default.loadAsync(zips[index].buffer)];
                case 3:
                    jszip = _a.sent();
                    zips[index] = jszip;
                    zipConvertsInProgress--;
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: return [4 /*yield*/, fs_extensions_1.default.ensureDirectoryExists(targetPath)];
                case 6:
                    _a.sent();
                    Write = function (name, d) { return __awaiter(_this, void 0, void 0, function () {
                        var fullFilePath;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    fullFilePath = path_1.default.join(targetPath, name);
                                    return [4 /*yield*/, fs_extensions_1.default.writeFile(fullFilePath, d)];
                                case 1:
                                    _a.sent();
                                    written++;
                                    progressBar.detail = "Wrote " + name + ". Total Files Written: " + written + ".";
                                    //Add file that we wrote to the file list
                                    if (!files_object.files.includes(fullFilePath))
                                        files_object.files.push(fullFilePath);
                                    electron_log_2.default.log("ZIP extract for \"" + name + "\" was successful.");
                                    inProgress--;
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    HandleFile = function (relativePath, file) { return __awaiter(_this, void 0, void 0, function () {
                        var directory, d, err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!active) {
                                        return [2 /*return*/];
                                    }
                                    inProgress++;
                                    if (!file.dir) return [3 /*break*/, 2];
                                    directory = path_1.default.join(targetPath, file.name);
                                    return [4 /*yield*/, fs_extensions_1.default.ensureDirectoryExists(directory)];
                                case 1:
                                    _a.sent();
                                    inProgress--;
                                    return [3 /*break*/, 6];
                                case 2:
                                    _a.trys.push([2, 5, , 6]);
                                    return [4 /*yield*/, currentZip.file(file.name).async("uint8array")];
                                case 3:
                                    d = _a.sent();
                                    return [4 /*yield*/, Write(file.name, d)];
                                case 4:
                                    _a.sent();
                                    return [3 /*break*/, 6];
                                case 5:
                                    err_1 = _a.sent();
                                    electron_log_1.default.error(err_1);
                                    throw err_1;
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); };
                    progressBar
                        .on('completed', function () {
                        progressBar.detail = 'Extraction completed. Exiting...';
                    })
                        .on('aborted', function () {
                        active = false;
                        throw new Error("Extraction aborted by user. You will need to re start the installation process to install this mod.");
                    });
                    HandleZips = function (zips) { return __awaiter(_this, void 0, void 0, function () {
                        var promises;
                        return __generator(this, function (_a) {
                            promises = [];
                            zips.forEach(function (rf, f) {
                                var promise = HandleFile(rf, f);
                                promises.push(promise);
                            });
                            return [2 /*return*/, Promise.all(promises)];
                        });
                    }); };
                    DoExtract = function () { return __awaiter(_this, void 0, void 0, function () {
                        var checkFunc;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    electron_log_2.default.log("Waiting for ZIP exraction to complete...");
                                    return [4 /*yield*/, HandleZips(currentZip)];
                                case 1:
                                    _a.sent();
                                    checkFunc = function () { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (!(inProgress <= 0)) return [3 /*break*/, 10];
                                                    inProgress = 0;
                                                    if (!multipleZips) return [3 /*break*/, 7];
                                                    currentIndex++;
                                                    if (!(currentIndex < zips.length)) return [3 /*break*/, 4];
                                                    //Assign the new zip and repeat the processess to handle and write the files.
                                                    currentZip = zips[currentIndex];
                                                    return [4 /*yield*/, HandleZips(currentZip)];
                                                case 1:
                                                    _a.sent();
                                                    //Make sure we set a timeout for the checking function again!!
                                                    return [4 /*yield*/, Delay(200)];
                                                case 2:
                                                    //Make sure we set a timeout for the checking function again!!
                                                    _a.sent();
                                                    return [4 /*yield*/, checkFunc()];
                                                case 3:
                                                    _a.sent();
                                                    return [3 /*break*/, 6];
                                                case 4:
                                                    progressBar.setCompleted();
                                                    return [4 /*yield*/, file_manager_1.default.SaveFileList(files_object, currentModData.name)];
                                                case 5:
                                                    _a.sent();
                                                    return [2 /*return*/];
                                                case 6: return [3 /*break*/, 9];
                                                case 7:
                                                    //Resolve now as we only had one zip to install.
                                                    progressBar.setCompleted();
                                                    return [4 /*yield*/, file_manager_1.default.SaveFileList(files_object, currentModData.name)];
                                                case 8:
                                                    _a.sent();
                                                    return [2 /*return*/];
                                                case 9: return [3 /*break*/, 13];
                                                case 10: return [4 /*yield*/, Delay(200)];
                                                case 11:
                                                    _a.sent();
                                                    return [4 /*yield*/, checkFunc()];
                                                case 12:
                                                    _a.sent();
                                                    return [2 /*return*/];
                                                case 13:
                                                    ;
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); };
                                    return [4 /*yield*/, Delay(1000)];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, checkFunc()];
                                case 3:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    CheckZipCreateDone = function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(zipConvertsInProgress <= 0)) return [3 /*break*/, 2];
                                    //Get the target zip.
                                    if (!Array.isArray(zips)) {
                                        currentZip = zips;
                                        multipleZips = false;
                                    }
                                    else {
                                        currentZip = zips[0];
                                        multipleZips = true;
                                    }
                                    return [4 /*yield*/, DoExtract()];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 5];
                                case 2: return [4 /*yield*/, Delay(50)];
                                case 3:
                                    _a.sent();
                                    return [4 /*yield*/, CheckZipCreateDone()];
                                case 4:
                                    _a.sent();
                                    _a.label = 5;
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); };
                    return [4 /*yield*/, Delay(50)];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, CheckZipCreateDone()];
                case 8:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
//Writes files to disk that are not in a zip but are just a buffer.
function WriteFilesToDirectory(targetPath, files, currentModData) {
    return __awaiter(this, void 0, void 0, function () {
        var written, files_object, active, progressBar, index, file, fullFilePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    written = 0;
                    return [4 /*yield*/, file_manager_1.default.GetFileList(currentModData.name)];
                case 1:
                    files_object = _a.sent();
                    active = true;
                    return [4 /*yield*/, fs_extensions_1.default.ensureDirectoryExists(targetPath)];
                case 2:
                    _a.sent();
                    progressBar = new electron_progressbar_1.default({
                        text: 'Extracting data',
                        detail: 'Starting data extraction...',
                        browserWindow: {
                            webPreferences: {
                                nodeIntegration: true
                            },
                            parent: main_1.default.mainWindow,
                            modal: true,
                            title: "Writing files...",
                            backgroundColor: "#2b2826",
                            closable: true
                        },
                        style: {
                            text: loadingTextStyle,
                            detail: loadingTextStyle,
                            value: loadingTextStyle
                        }
                    });
                    progressBar
                        .on('completed', function () {
                        active = false;
                        progressBar.detail = 'Writing completed. Exiting...';
                    })
                        .on('aborted', function () {
                        active = false;
                        throw new Error("User aborted file writing. You will need to restart the installation process to install this mod.");
                    });
                    electron_log_2.default.log("Waiting for File writing to complete...");
                    index = 0;
                    _a.label = 3;
                case 3:
                    if (!(index < files.length)) return [3 /*break*/, 6];
                    if (!active) {
                        return [3 /*break*/, 5];
                    }
                    file = files[index];
                    progressBar.detail = "Writing " + file.name + ". Total Files Written: " + written + ".";
                    fullFilePath = path_1.default.join(targetPath, file.name);
                    return [4 /*yield*/, fs_extensions_1.default.writeFile(fullFilePath, file.buffer)];
                case 4:
                    _a.sent();
                    written++;
                    //Add file that we wrote to the file list
                    if (!files_object.files.includes(fullFilePath))
                        files_object.files.push(fullFilePath);
                    electron_log_2.default.log("File write for '" + file.name + "' was successful.");
                    _a.label = 5;
                case 5:
                    index++;
                    return [3 /*break*/, 3];
                case 6:
                    progressBar.setCompleted();
                    return [4 /*yield*/, file_manager_1.default.SaveFileList(files_object, currentModData.name)];
                case 7:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
//Validates the tf2 directory. Can trigger dialogues depending on the outcome.
function ValidateTF2Dir() {
    return __awaiter(this, void 0, void 0, function () {
        var plat, appid_path, content, appid;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!main_1.default.config) return [3 /*break*/, 2];
                    return [4 /*yield*/, ErrorDialog("The application could not load the config. It may have failed to write it to disk.\nPlease report this issue!", "Internal Error")];
                case 1:
                    _a.sent();
                    return [2 /*return*/, false];
                case 2:
                    if (!(main_1.default.config.tf2_directory == "")) return [3 /*break*/, 4];
                    return [4 /*yield*/, ErrorDialog("No TF2 path has been specified. Please manually enter this in the Settings.\nE.g. 'C:\\Program Files (x86)\\steam\\steamapps\\common\\Team Fortress 2\\'", "TF2 Path Error")];
                case 3:
                    _a.sent();
                    return [2 /*return*/, false];
                case 4: return [4 /*yield*/, fs_extensions_1.default.pathExists(main_1.default.config.tf2_directory)];
                case 5:
                    if (!!(_a.sent())) return [3 /*break*/, 7];
                    return [4 /*yield*/, ErrorDialog("The current TF2 directory specified does not exist. Please check your settings.", "TF2 Path Error")];
                case 6:
                    _a.sent();
                    return [2 /*return*/, false];
                case 7:
                    plat = os_1.default.platform();
                    if (!(plat == "win32")) return [3 /*break*/, 9];
                    return [4 /*yield*/, fs_extensions_1.default.fileExists(path_1.default.join(main_1.default.config.tf2_directory, "hl2.exe"))];
                case 8:
                    if (_a.sent()) {
                        return [2 /*return*/, true];
                    }
                    return [3 /*break*/, 11];
                case 9:
                    if (!(plat == "linux" || plat == "freebsd" || plat == "openbsd")) return [3 /*break*/, 11];
                    return [4 /*yield*/, fs_extensions_1.default.pathExists(path_1.default.join(main_1.default.config.tf2_directory, "hl2_linux"))];
                case 10:
                    if (_a.sent()) {
                        return [2 /*return*/, true];
                    }
                    _a.label = 11;
                case 11:
                    appid_path = path_1.default.join(main_1.default.config.tf2_directory, "steam_appid.txt");
                    return [4 /*yield*/, fs_extensions_1.default.fileExists(appid_path)];
                case 12:
                    if (!_a.sent()) return [3 /*break*/, 14];
                    return [4 /*yield*/, fs_extensions_1.default.readFile(appid_path, { encoding: "utf8" })];
                case 13:
                    content = _a.sent();
                    appid = content.split("\n")[0];
                    if (appid != null && appid == "440") {
                        return [2 /*return*/, true];
                    }
                    _a.label = 14;
                case 14: 
                //All the tests failed, show dialogue for that.
                return [4 /*yield*/, ErrorDialog("The current TF2 directory specified does exist, but it did not pass validation.\nCheck it links only to the 'Team Fortress 2' folder and not to the sub 'tf' folder.\nPlease check your settings.", "TF2 Validation Error")];
                case 15:
                    //All the tests failed, show dialogue for that.
                    _a.sent();
                    return [2 /*return*/, false];
            }
        });
    });
}
function DownloadFile(_url, progressFunc, responseHeadersFunc, shouldStop) {
    return new Promise(function (resolve, reject) {
        var options = {
            headers: {
                'User-Agent': 'creators-tf-launcher'
            }
        };
        var DoRequest = function (__url, retries) {
            if (retries <= 0) {
                var error = "Endpoint " + _url + " redirected too many times. Aborted!";
                electron_log_2.default.error(error);
                reject(error);
            }
            electron_log_2.default.log("Starting GET for file data at: " + __url);
            var req = https_1.default.get(__url, function (res) {
                if (res.statusCode == 302) {
                    electron_log_2.default.log("Got a 302, re trying on new location.");
                    DoRequest(res.headers.location, retries--);
                }
                else if (res.statusCode == 404) {
                    var error = "Remote Mod file was not able to be found. Try again later.\nIf this persists please report this error.";
                    electron_log_2.default.error(error);
                    electron_log_2.default.error("404 for: " + _url);
                    reject(error);
                }
                else if (res.statusCode !== 200) {
                    var error = "Download File Request failed, response code was: " + res.statusCode + ".\nPlease report this error.";
                    electron_log_2.default.error(error);
                    reject(error);
                }
                else {
                    //Execute the callback for doing processing with the headers.
                    if (responseHeadersFunc != null)
                        responseHeadersFunc(res.headers);
                    var data = [], dataLen = 0;
                    // don't set the encoding, it will break everything !
                    // or, if you must, set it to null. In that case the chunk will be a string.
                    res.on("data", function (chunk) {
                        if (shouldStop.value) {
                            res.destroy();
                            reject();
                            return;
                        }
                        data.push(chunk);
                        dataLen += chunk.length;
                        if (progressFunc != null)
                            progressFunc(dataLen);
                    });
                    res.on("end", function () {
                        if (!shouldStop.value) {
                            var buf = Buffer.concat(data);
                            progressFunc = null;
                            responseHeadersFunc = null;
                            electron_log_2.default.log("File download finished. Returning raw data.");
                            //This approach to get the file name only works for direct file urls.
                            //A better solution for later would be via the content-disposition header if this is missing.
                            var filename;
                            var contentDispositionHeader = res.headers["content-disposition"];
                            if (contentDispositionHeader != undefined) {
                                var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                                var matches = filenameRegex.exec(contentDispositionHeader);
                                if (matches != null && matches[1]) {
                                    filename = matches[1].replace(/['"]/g, '');
                                    electron_log_2.default.info("Got filename for download fron content-disposition header: " + filename);
                                }
                            }
                            if (filename == undefined)
                                filename = GetFileName(__url);
                            resolve(new DownloadedFile(buf, filename));
                        }
                        else {
                            electron_log_2.default.log("File download was cancled by the user successfully.");
                        }
                    });
                }
            });
            req.on("error", function (err) {
                electron_log_2.default.error("File download request for " + _url + " errored out: " + err);
                reject(err);
            });
        };
        //Do initial request.
        DoRequest(_url, 5);
    });
}
function GetFileName(_url) {
    var parsed = url_1.default.parse(_url);
    return path_1.default.basename(parsed.pathname);
}
function SetNewModVersion(version, currentModName) {
    //Try to update the version of the mod if its already in the array.
    for (var i = 0; i < main_1.default.config.current_mod_versions.length; i++) {
        var modVersionObject = main_1.default.config.current_mod_versions[i];
        if (modVersionObject.name == currentModName) {
            electron_log_2.default.log("Mod " + currentModName + " version was updated from " + modVersionObject.version + " to " + version);
            modVersionObject.version = version;
            return true;
        }
    }
    return false;
}
function ErrorDialog(error, title) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    electron_log_2.default.error("Error Dialog shown: " + title + " : " + error.toString() + ".\nError Stack:" + error.stack);
                    return [4 /*yield*/, electron_1.dialog.showMessageBox(main_1.default.mainWindow, {
                            type: "error",
                            title: title,
                            message: error.toString(),
                            buttons: ["OK"]
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function FatalError(errorMessage) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, electron_1.dialog.showMessageBox(main_1.default.mainWindow, {
                        type: "error",
                        title: "Fatal Error",
                        message: errorMessage.toString(),
                        buttons: ["OK"]
                    })];
                case 1:
                    _a.sent();
                    electron_log_2.default.error("A fatal error was encountered! Program quit. Reason: " + errorMessage);
                    main_1.default.app.quit();
                    return [2 /*return*/];
            }
        });
    });
}
function GetFileWriteFunction(extension) {
    //Format to be what we expect.
    extension = extension.toLowerCase().replace(".", "");
    if (functionMap.has(extension)) {
        return functionMap.get(extension);
    }
    else
        return WriteFilesToDirectory;
}
functionMap.set("zip", WriteZIPsToDirectory);
functionMap.set("vpk", WriteFilesToDirectory);
//Some extras to check just incase the downloads are not something we can handle or a windows exe.
functionMap.set("rar", function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, FatalError("Cannot handle .rar files currently. This should not happen. Exiting...")];
        case 1:
            _a.sent();
            return [2 /*return*/];
    }
}); }); });
functionMap.set("7z", function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, FatalError("Cannot handle .7z files currently. This should not happen. Exiting...")];
        case 1:
            _a.sent();
            return [2 /*return*/];
    }
}); }); });
functionMap.set("exe", function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, FatalError("Downloaded file was windows executable. This should not happen, exiting. File was not written.")];
        case 1:
            _a.sent();
            return [2 /*return*/];
    }
}); }); });
//# sourceMappingURL=mod_manager.js.map