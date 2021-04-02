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
exports.RemoteFile = void 0;
var axios_1 = __importDefault(require("axios"));
var fs_1 = __importDefault(require("fs"));
var utilities_1 = require("../utilities");
var path_1 = __importDefault(require("path"));
var electron_log_1 = __importDefault(require("electron-log"));
var RemoteLoader = (function () {
    function RemoteLoader() {
        this.localFileName = "";
        this.remoteUrls = [
            ""
        ];
    }
    RemoteLoader.prototype.LoadLocalFile = function () {
        this.localFile = this.GetLocalFile();
    };
    RemoteLoader.prototype.GetFile = function () {
        return this.localFile;
    };
    RemoteLoader.prototype.UpdateLocalFile = function () {
        if (this.lastDownloaded != null && this.localFile.version < this.lastDownloaded.version) {
            var configPath = path_1.default.join(utilities_1.Utilities.GetDataFolder(), this.localFileName);
            fs_1.default.writeFileSync(configPath, JSON.stringify(this.lastDownloaded));
            return true;
        }
        return false;
    };
    RemoteLoader.prototype.CheckForUpdates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, i, url, remoteFile, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        electron_log_1.default.log("Checking for remote file updates for : " + this.localFileName);
                        data = new Array();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 9, , 10]);
                        i = 0;
                        _b.label = 2;
                    case 2:
                        if (!(i < this.remoteUrls.length)) return [3, 8];
                        url = this.remoteUrls[i];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4, this.TryGetRemoteFile(url)];
                    case 4:
                        remoteFile = _b.sent();
                        return [3, 6];
                    case 5:
                        _a = _b.sent();
                        return [3, 7];
                    case 6:
                        if (remoteFile != null && remoteFile != undefined) {
                            this.lastDownloaded = remoteFile;
                            return [3, 8];
                        }
                        _b.label = 7;
                    case 7:
                        i++;
                        return [3, 2];
                    case 8:
                        if (this.lastDownloaded != null && this.lastDownloaded.version != null) {
                            electron_log_1.default.log("Local mod list version: " + this.localFile.version + ", Remote mod list version: " + this.lastDownloaded.version + ".");
                            return [2, this.localFile.version < this.lastDownloaded.version];
                        }
                        return [3, 10];
                    case 9:
                        error_1 = _b.sent();
                        console.error("Failed to check for updates. " + error_1.toString());
                        return [2, false];
                    case 10:
                        electron_log_1.default.log("No mod list updates found.");
                        return [2, false];
                }
            });
        });
    };
    RemoteLoader.prototype.TryGetRemoteFile = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var resp, parsed, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        electron_log_1.default.log("Trying to get file from: " + url);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, axios_1.default.get(url)];
                    case 2:
                        resp = _a.sent();
                        if (resp.data.hasOwnProperty("version")) {
                            return [2, resp.data];
                        }
                        parsed = JSON.parse(resp.data);
                        return [2, parsed];
                    case 3:
                        error_2 = _a.sent();
                        electron_log_1.default.error("Failed to get remote file at " + url + ", error: " + error_2.toString());
                        throw error_2;
                    case 4: return [2];
                }
            });
        });
    };
    RemoteLoader.prototype.GetLocalFile = function () {
        var internalFileJSON = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "..", "..", "internal", this.localFileName), { encoding: "utf-8" });
        var internalFile = JSON.parse(internalFileJSON);
        var configPath = path_1.default.join(utilities_1.Utilities.GetDataFolder(), this.localFileName);
        if (fs_1.default.existsSync(configPath)) {
            var localWrittenFile = JSON.parse(fs_1.default.readFileSync(configPath, { encoding: "utf-8" }));
            if (localWrittenFile.version > internalFile.version) {
                return localWrittenFile;
            }
        }
        fs_1.default.writeFileSync(configPath, internalFileJSON);
        return JSON.parse(internalFileJSON);
    };
    RemoteLoader.prototype.DeleteLocalFile = function () {
        var configPath = path_1.default.join(utilities_1.Utilities.GetDataFolder(), this.localFileName);
        if (fs_1.default.existsSync(configPath)) {
            fs_1.default.unlinkSync(configPath);
            return true;
        }
        return false;
    };
    return RemoteLoader;
}());
var RemoteFile = (function () {
    function RemoteFile() {
    }
    return RemoteFile;
}());
exports.RemoteFile = RemoteFile;
exports.default = RemoteLoader;
//# sourceMappingURL=remote_file_loader.js.map