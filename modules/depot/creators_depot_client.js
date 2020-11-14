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
exports.CreatorsDepotClient = void 0;
var https_1 = __importDefault(require("https"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var ProgressBar = require("electron-progressbar");
var strf = require('string-format');
var worker_threads_1 = require("worker_threads");
var ChecksumWorkerData_1 = require("./ChecksumWorkerData");
var utilities_1 = require("../utilities");
//Checks for updates of local files based on their md5 hash.
var CreatorsDepotClient = /** @class */ (function () {
    function CreatorsDepotClient(modpath) {
        this.allContentURL = "https://creators.tf/api/IDepots/GVersionInfo?depid=1&tags=content";
        this.downloadRequestURL = "https://creators.tf/api/IDepots/GDownloadFile?depid=1&file={0}";
        this.filesToUpdate = [];
        this.MaxConcurrentDownloads = 3;
        this.updateActive = false;
        this.currentDownloads = 0;
        this.workerThreadCount = 6;
        this.modPath = modpath;
    }
    CreatorsDepotClient.prototype.CheckForUpdates = function () {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var data, error_1, progressBar, detailStr, workerData, _i, _a, group, dir, _b, _c, fileData, filePath, hash, remotePath, dataPerWorker, processedWorkerData, runningWorkers, ProcessWorkerResults, _loop_1, this_1, i;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.GetDepotData()];
                    case 1:
                        data = _d.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _d.sent();
                        reject(error_1);
                        return [3 /*break*/, 3];
                    case 3:
                        progressBar = utilities_1.Utilities.GetNewLoadingPopup("Checking files for updates", global.mainWindow, reject);
                        detailStr = "Checking files ";
                        progressBar.detail = detailStr + ("(" + this.workerThreadCount + "/" + this.workerThreadCount + ") workers left.");
                        workerData = new Array();
                        if (data.result == "SUCCESS") {
                            for (_i = 0, _a = data.groups; _i < _a.length; _i++) {
                                group = _a[_i];
                                dir = group.directory.local;
                                dir = dir.replace("Path_Mod", this.modPath);
                                dir = path_1.default.normalize(dir);
                                for (_b = 0, _c = group.files; _b < _c.length; _b++) {
                                    fileData = _c[_b];
                                    filePath = fileData[0];
                                    hash = fileData[1];
                                    remotePath = path_1.default.join(group.directory.remote, filePath.replace("\\", "/"));
                                    workerData.push(new ChecksumWorkerData_1.ChecksumWorkerData(path_1.default.join(dir, filePath), hash, remotePath));
                                }
                            }
                        }
                        else {
                            reject("Server error, status was: " + data.result);
                        }
                        dataPerWorker = Math.ceil(workerData.length / this.workerThreadCount);
                        processedWorkerData = new Array();
                        runningWorkers = 0;
                        ProcessWorkerResults = function (filesToUpdate) {
                            for (var _i = 0, processedWorkerData_1 = processedWorkerData; _i < processedWorkerData_1.length; _i++) {
                                var processedData = processedWorkerData_1[_i];
                                if (!processedData.ismatch) {
                                    filesToUpdate.push(processedData);
                                }
                            }
                            progressBar.setCompleted();
                            resolve(filesToUpdate.length > 0);
                        };
                        _loop_1 = function () {
                            var startIndex = dataPerWorker * i;
                            var endIndex = dataPerWorker * (i + 1);
                            var ourIndex = i;
                            var splicedWorkers = workerData.slice(startIndex, endIndex);
                            runningWorkers++;
                            //@ts-ignore
                            global.log.log("Starting Checksumworker no:" + i);
                            this_1.RunNewChecksumWorker(splicedWorkers).then(function (result) {
                                runningWorkers--;
                                //@ts-ignore
                                global.log.log("Worker " + ourIndex + " finished! " + runningWorkers + " remain.");
                                progressBar.detail = detailStr + ("(" + runningWorkers + "/" + _this.workerThreadCount + ") workers left.");
                                processedWorkerData = processedWorkerData.concat(result.result);
                                if (runningWorkers < 1) {
                                    //@ts-ignore
                                    global.log.log("Workers done. Processing results.");
                                    ProcessWorkerResults(_this.filesToUpdate);
                                }
                            }).catch(reject);
                        };
                        this_1 = this;
                        for (i = 0; i < this.workerThreadCount; i++) {
                            _loop_1();
                        }
                        return [2 /*return*/];
                }
            });
        }); });
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
                                    reject(error);
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
                                    backgroundColor: "#2b2826",
                                    closable: true
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
                            _this.updateActive = true;
                            var currentIndex = 0;
                            //Start downloads equal to files to update length or max amount, whichever is smaller.
                            for (var i = 0; i < Math.min(_this.filesToUpdate.length, _this.MaxConcurrentDownloads); i++) {
                                //Download the file then write to disk strait away.
                                try {
                                    _this.UpdateNextFile(currentIndex, progressBar);
                                    currentIndex++;
                                }
                                catch (error) {
                                    reject(error);
                                }
                            }
                            if (currentIndex < _this.filesToUpdate.length) {
                                var checkFunction = function () {
                                    if (_this.currentDownloads > 0 && _this.updateActive) {
                                        //Can we start updating a new file?
                                        if (_this.currentDownloads < _this.MaxConcurrentDownloads) {
                                            if (currentIndex < _this.filesToUpdate.length) {
                                                try {
                                                    _this.UpdateNextFile(currentIndex, progressBar);
                                                    currentIndex++;
                                                }
                                                catch (error) {
                                                    reject(error);
                                                }
                                            }
                                            else if (_this.currentDownloads == 0) {
                                                _this.updateActive = false;
                                                progressBar.setCompleted();
                                                progressBar.close();
                                                resolve();
                                            }
                                        }
                                        //Recheck this in 100ms.
                                        setTimeout(checkFunction, 100);
                                    }
                                    if (!_this.updateActive) {
                                        resolve();
                                    }
                                };
                                checkFunction();
                            }
                        }
                    })];
            });
        });
    };
    //Start a download and write the first file from the queue. 
    CreatorsDepotClient.prototype.UpdateNextFile = function (index, progressBar) {
        var _this = this;
        var fileToUpdate = this.filesToUpdate[index];
        //Format request url, then fix the slashes used
        var fileReqURL = strf(this.downloadRequestURL, fileToUpdate.remotePath);
        fileReqURL = fileReqURL.replace(/\\/g, "/");
        this.DownloadFile(fileReqURL, progressBar).then(function (fileBuffer) {
            _this.WriteFile(fileToUpdate.filePath, fileBuffer);
            _this.currentDownloads--;
        }).catch(function (e) { throw new Error(e); });
        this.currentDownloads++;
    };
    CreatorsDepotClient.prototype.DownloadFile = function (url, progressBar) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        //@ts-ignore
                        global.log.log("Starting download for " + url);
                        var options = {
                            headers: {
                                'User-Agent': 'creators-tf-launcher'
                            }
                        };
                        var req = https_1.default.get(url, options, function (res) {
                            if (res.statusCode !== 200) {
                                var error = "Request failed, response code was: " + res.statusCode;
                                reject(error);
                            }
                            else {
                                var data = [];
                                res.on("data", function (chunk) {
                                    data.push(chunk);
                                });
                                res.on("end", function () {
                                    var buf = Buffer.concat(data);
                                    progressBar.detail = "Downloaded " + url;
                                    progressBar.value++;
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
    CreatorsDepotClient.prototype.WriteFile = function (targetpath, data) {
        //@ts-ignore
        global.log.log("Writing file \"" + targetpath + "\"");
        var dir = path_1.default.dirname(targetpath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        fs_1.default.writeFileSync(targetpath, data);
    };
    CreatorsDepotClient.prototype.RunNewChecksumWorker = function (checksumWorkerData) {
        return new Promise(function (resolve, reject) {
            var worker = new worker_threads_1.Worker(path_1.default.join(__dirname, 'checksum_worker.js'), { workerData: checksumWorkerData });
            worker.on('message', resolve);
            worker.on('error', function (e) {
                reject(e);
            });
            worker.on('exit', function (code) {
                if (code !== 0)
                    reject(new Error("Worker stopped with exit code " + code));
            });
        });
    };
    return CreatorsDepotClient;
}());
exports.CreatorsDepotClient = CreatorsDepotClient;
//# sourceMappingURL=creators_depot_client.js.map