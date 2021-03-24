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
exports.ServerListPage = void 0;
var electron_1 = require("electron");
var path_1 = __importDefault(require("path"));
var string_format_1 = __importDefault(require("string-format"));
var electron_is_dev_1 = __importDefault(require("electron-is-dev"));
var https_1 = __importDefault(require("https"));
var electron_log_1 = __importDefault(require("electron-log"));
var apiEndpoint = "https://creators.tf/api/IServers/GServerList?provider={0}";
var ServerListPage = /** @class */ (function () {
    function ServerListPage() {
    }
    ServerListPage.OpenWindow = function (mainWindow, screenWidth, screenHeight, providers) {
        var _this = this;
        electron_log_1.default.info("Loading Server List window...");
        this.serverlistWindow = new electron_1.BrowserWindow({
            parent: mainWindow,
            webPreferences: {
                preload: path_1.default.join(__dirname, "serverpage-preload.js"),
                nodeIntegration: false
            },
            modal: true,
            show: false,
            center: true,
            darkTheme: true,
            maximizable: true,
            resizable: true,
            autoHideMenuBar: true,
            minWidth: 960,
            minHeight: 600,
            width: screenWidth - 300,
            height: screenHeight - 100
        });
        if (!electron_is_dev_1.default)
            this.serverlistWindow.removeMenu();
        this.latestProviders = providers;
        this.serverlistWindow.loadFile(path_1.default.join(__dirname, "serverlist.html"));
        this.serverlistWindow.once("ready-to-show", function () {
            _this.serverlistWindow.show();
        });
    };
    ServerListPage.GetServerList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var options, getProviderServerList, serverData, _i, _a, provider, response;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.latestProviders == null) {
                            electron_log_1.default.error("Failed to get server list as provider ids were missing");
                            throw new Error("No providers avaliable.");
                        }
                        options = {
                            headers: {
                                'User-Agent': 'creators-tf-launcher'
                            }
                        };
                        getProviderServerList = function (providerId) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                //Use a promise to ensure the inner request callback can return its value and ensure we await properly.
                                return [2 /*return*/, new Promise(function (resolve, reject) {
                                        var data = [];
                                        var url = string_format_1.default(apiEndpoint, providerId);
                                        var req = https_1.default.get(url, options, function (res) {
                                            console.log("statusCode: " + res.statusCode);
                                            res.on('data', function (d) {
                                                if (res.statusCode != 200) {
                                                    throw new Error(res.statusCode.toString());
                                                }
                                                data.push(d);
                                            });
                                            res.on("end", function () {
                                                res.destroy();
                                                try {
                                                    var buf = Buffer.concat(data);
                                                    var parsed = JSON.parse(buf.toString());
                                                    resolve(parsed);
                                                }
                                                catch (e) {
                                                    throw e;
                                                }
                                            });
                                        });
                                        req.on('error', function (error) {
                                            throw new Error(error.toString());
                                        });
                                        req.end();
                                    })];
                            });
                        }); };
                        serverData = null;
                        _i = 0, _a = this.latestProviders;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        provider = _a[_i];
                        return [4 /*yield*/, getProviderServerList(provider.toString())];
                    case 2:
                        response = _b.sent();
                        if (response != null && response.result != null && response.result == "SUCCESS") {
                            if (serverData == null) {
                                serverData = response;
                            }
                            else {
                                serverData = this.CombineServerData(serverData, response);
                            }
                        }
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (serverData == null) {
                            throw new Error("Unable to get any server list data.");
                        }
                        return [2 /*return*/, serverData];
                }
            });
        });
    };
    /**
     * Combines the server data of these two objects together.
     * @param oldData Main object to add to.
     * @param newData Other obect to take the .servers property from.
     */
    ServerListPage.CombineServerData = function (oldData, newData) {
        if (oldData.hasOwnProperty("servers")) {
            oldData.servers = oldData.servers.concat(newData.servers);
            return oldData;
        }
        else {
            return oldData;
        }
    };
    return ServerListPage;
}());
exports.ServerListPage = ServerListPage;
electron_1.ipcMain.on("GetServerList", function (event, arg) { return __awaiter(void 0, void 0, void 0, function () {
    var serverList, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, ServerListPage.GetServerList()];
            case 1:
                serverList = _a.sent();
                event.reply("GetServerList-Reply", serverList);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                event.reply("GetServerList-Reply", error_1.toString());
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=serverlistpage.js.map