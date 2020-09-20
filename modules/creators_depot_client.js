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
var https_1 = __importDefault(require("https"));
var fs_1 = __importDefault(require("fs"));
var crypto_1 = __importDefault(require("crypto"));
var path_1 = __importDefault(require("path"));
var ProgressBar = require("electron-progressbar");
module.exports = /** @class */ (function () {
    function CreatorsDepotClient(modpath) {
        //Checks for updates of local files based on their md5 hash.
        this.allContentURL = "https://creators.tf/api/IDepots/GVersionInfo?depid=1&tags=content";
        this.filesToUpdate = [];
        this.modPath = modpath;
    }
    CreatorsDepotClient.prototype.CheckForUpdates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, _i, _a, group, dir, _b, _c, fileData, filePath, hash;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.GetDepotData()];
                    case 1:
                        data = _d.sent();
                        if (data.result == "SUCCESS") {
                            for (_i = 0, _a = data.groups; _i < _a.length; _i++) {
                                group = _a[_i];
                                dir = group.directory.local;
                                dir = dir.replace("Path_Mod/", "");
                                dir = path_1.default.join(this.modPath, dir);
                                for (_b = 0, _c = group.files; _b < _c.length; _b++) {
                                    fileData = _c[_b];
                                    filePath = fileData[0];
                                    hash = fileData[1];
                                    if (this.DoesFileNeedUpdate(path_1.default.join(dir, filePath), hash)) {
                                        this.filesToUpdate.push(filePath);
                                    }
                                }
                            }
                        }
                        return [2 /*return*/, this.filesToUpdate.length > 0];
                }
            });
        });
    };
    CreatorsDepotClient.prototype.DoesFileNeedUpdate = function (filePath, md5Hash) {
        //@ts-ignore
        global.log.log(("Checking if file needs update: " + filePath));
        if (fs_1.default.existsSync(filePath)) {
            var file = fs_1.default.readFileSync(filePath);
            //@ts-ignore
            global.log.log("File exists, comparing md5 hashes.");
            var hash = crypto_1.default.createHash("md5").update(file).digest("hex");
            //@ts-ignore
            global.log.log("Our hash: '" + hash + "'. Remote hash: '" + md5Hash + "'.");
            //@ts-ignore
            global.log.log(hash == md5Hash ? "    Same!" : "    Different!");
            return (hash != md5Hash);
        }
        //@ts-ignore
        global.log.log("    File does not exist. Update.");
        return true;
    };
    CreatorsDepotClient.prototype.GetDepotData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        if (_this.allDepotData == undefined) {
                            var options = {
                                headers: {
                                    'User-Agent': 'creators-tf-launcher'
                                }
                            };
                            var req = https_1.default.get(_this.allContentURL, options, function (res) {
                                if (res.statusCode !== 200) {
                                    var error = "Request failed, response code was: " + res.statusCode;
                                }
                                else {
                                    var data = [], dataLen = 0;
                                    res.on("data", function (chunk) {
                                        data.push(chunk);
                                        dataLen += chunk.length;
                                    });
                                    res.on("end", function () {
                                        var buf = Buffer.concat(data);
                                        resolve(JSON.parse(buf.toString()));
                                    });
                                }
                            });
                            req.on("error", function (err) {
                                reject(err.toString());
                            });
                        }
                        else
                            resolve(_this.allDepotData);
                    })];
            });
        });
    };
    CreatorsDepotClient.prototype.UpdateFiles = function (mainWindow, app, loadingTextStyle) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        if (_this.filesToUpdate.length > 0) {
                            var progressBar = new ProgressBar({
                                indeterminate: false,
                                text: "Downloading Mod Files",
                                detail: "Starting Download...",
                                abortOnError: true,
                                closeOnComplete: false,
                                maxValue: _this.filesToUpdate.length,
                                browserWindow: {
                                    webPreferences: {
                                        nodeIntegration: true
                                    },
                                    width: 550,
                                    parent: mainWindow,
                                    modal: true,
                                    title: "Downloading Mod Files",
                                    backgroundColor: "#2b2826"
                                },
                                style: {
                                    text: loadingTextStyle,
                                    detail: loadingTextStyle,
                                    value: loadingTextStyle
                                }
                            }, app);
                            //Setup events to display data.
                            progressBar
                                .on('completed', function () {
                                //progressBar.detail = 'Download Finished!';
                            })
                                .on('aborted', function (value) {
                                reject("Download Cancelled by User!");
                            });
                            //We need to download files and write them to disk as soon as we get them to not hold them in memory.
                        }
                    })];
            });
        });
    };
    CreatorsDepotClient.prototype.DownloadFile = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var options = {
                            headers: {
                                'User-Agent': 'creators-tf-launcher'
                            }
                        };
                        var req = https_1.default.get(url, options, function (res) {
                            if (res.statusCode !== 200) {
                                var error = "Request failed, response code was: " + res.statusCode;
                            }
                            else {
                                var data = [], dataLen = 0;
                                res.on("data", function (chunk) {
                                    data.push(chunk);
                                    dataLen += chunk.length;
                                });
                                res.on("end", function () {
                                    var buf = Buffer.concat(data);
                                    resolve(buf);
                                });
                            }
                        });
                        req.on("error", function (err) {
                            reject(new Error(err.toString()));
                        });
                    })];
            });
        });
    };
    CreatorsDepotClient.prototype.WriteFile = function (path, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                fs_1.default.writeFileSync(path, data);
                return [2 /*return*/];
            });
        });
    };
    return CreatorsDepotClient;
}());
//# sourceMappingURL=creators_depot_client.js.map