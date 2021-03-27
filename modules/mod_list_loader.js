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
exports.ModListEntry = exports.ModList = exports.ModListLoader = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var https_1 = __importDefault(require("https"));
var utilities_1 = require("./utilities");
var electron_log_1 = __importDefault(require("electron-log"));
//URLs to try to get mod lists from.
//More than one allows fallbacks.
var modListURLs = [
    "https://fastdl.creators.tf/launcher/mods.json",
    "https://raw.githubusercontent.com/ampersoftware/Creators.TF-Community-Launcher/master/internal/mods.json"
];
var localModListName = "mods.json";
/**
 * Responsible for providing the latest mod list avaliable.
 */
var ModListLoader = /** @class */ (function () {
    function ModListLoader() {
    }
    ModListLoader.LoadLocalModList = function () {
        this.localModList = this.GetLocalModList();
    };
    ModListLoader.GetModList = function () {
        return this.localModList;
    };
    /**
     * Update the local mod list file on disk to contain the latest data we found.
     */
    ModListLoader.UpdateLocalModList = function () {
        if (this.lastDownloaded != null && this.localModList.version < this.lastDownloaded.version) {
            var configPath = path_1.default.join(utilities_1.Utilities.GetDataFolder(), localModListName);
            fs_1.default.writeFileSync(configPath, JSON.stringify(this.lastDownloaded));
            return true;
        }
        return false;
    };
    /**Check if there is a newer mod list online.
     * Also checks if the internal version is newer than the local, written version.
     */
    ModListLoader.CheckForUpdates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, i, url, remoteModList, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        electron_log_1.default.log("Checking for modlist updates");
                        data = new Array();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 9, , 10]);
                        i = 0;
                        _b.label = 2;
                    case 2:
                        if (!(i < modListURLs.length)) return [3 /*break*/, 8];
                        url = modListURLs[i];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.TryGetModList(url)];
                    case 4:
                        remoteModList = _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        _a = _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        //Break if we have a valid mod list. If we have null, try again.
                        if (remoteModList != null && remoteModList != undefined) {
                            this.lastDownloaded = remoteModList;
                            return [3 /*break*/, 8];
                        }
                        _b.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 2];
                    case 8:
                        if (this.lastDownloaded != null && this.lastDownloaded.hasOwnProperty("version")) {
                            electron_log_1.default.log("Local mod list version: " + this.localModList.version + ", Remote mod list version: " + this.lastDownloaded.version + ".");
                            return [2 /*return*/, this.localModList.version < this.lastDownloaded.version];
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        error_1 = _b.sent();
                        console.error("Failed to check for updates. " + error_1.toString());
                        return [2 /*return*/, false];
                    case 10:
                        electron_log_1.default.log("No mod list updates found.");
                        return [2 /*return*/, false];
                }
            });
        });
    };
    ModListLoader.TryGetModList = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        electron_log_1.default.log("Trying to get mod list from: " + url);
                        var data = new Array();
                        var req = https_1.default.get(url, function (res) {
                            console.log("statusCode: " + res.statusCode);
                            res.on('data', function (d) {
                                if (res.statusCode != 200) {
                                    resolve(null);
                                }
                                data.push(d);
                            });
                            res.on("end", function () {
                                try {
                                    var buf = Buffer.concat(data);
                                    var parsed = JSON.parse(buf.toString());
                                    resolve(parsed);
                                }
                                catch (error) {
                                    //Json parsing failed soo reject.
                                    electron_log_1.default.error("Failed to parse json in TryGetModList request for " + url + ", error: " + error.toString());
                                    resolve(null);
                                }
                            });
                        });
                        req.on('error', function (error) {
                            electron_log_1.default.error("General request error in a TryGetModList request, error: " + error.toString());
                            resolve(null);
                        });
                        req.end();
                    })];
            });
        });
    };
    ModListLoader.GetLocalModList = function () {
        //Try to load file from our local data, if that doesn't exist, write the internal mod list and return that.
        var internalModListJSON = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "..", "internal", "mods.json"), { encoding: "utf-8" });
        var internalModList = JSON.parse(internalModListJSON);
        var configPath = path_1.default.join(utilities_1.Utilities.GetDataFolder(), localModListName);
        if (fs_1.default.existsSync(configPath)) {
            var localConfig = JSON.parse(fs_1.default.readFileSync(configPath, { encoding: "utf-8" }));
            if (localConfig.version > internalModList.version) {
                return localConfig;
            }
        }
        //Write the internal mod list then return that too.
        //We also want to re write the internal mod list if its a higher version.
        fs_1.default.writeFileSync(configPath, internalModListJSON);
        return JSON.parse(internalModListJSON);
    };
    ModListLoader.DeleteLocalModList = function () {
        var configPath = path_1.default.join(utilities_1.Utilities.GetDataFolder(), localModListName);
        if (fs_1.default.existsSync(configPath)) {
            fs_1.default.unlinkSync(configPath);
            return true;
        }
        return false;
    };
    return ModListLoader;
}());
exports.ModListLoader = ModListLoader;
var ModList = /** @class */ (function () {
    function ModList() {
    }
    ModList.prototype.GetMod = function (name) {
        for (var _i = 0, _a = this.mods; _i < _a.length; _i++) {
            var entry = _a[_i];
            if (entry.name == name) {
                return entry;
            }
        }
        return null;
    };
    return ModList;
}());
exports.ModList = ModList;
var ModListEntry = /** @class */ (function () {
    function ModListEntry() {
    }
    return ModListEntry;
}());
exports.ModListEntry = ModListEntry;
//# sourceMappingURL=mod_list_loader.js.map