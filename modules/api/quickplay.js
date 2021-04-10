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
var CreatorsAPIDispatcher_1 = __importDefault(require("./CreatorsAPIDispatcher"));
var CreateMatchCommand_1 = require("./quickplay/CreateMatchCommand");
var quickplay_config_loader_1 = __importDefault(require("../remote_file_loader/quickplay_config_loader"));
var electron_1 = require("electron");
var electron_log_1 = __importDefault(require("electron-log"));
var utilities_1 = require("../../modules/utilities");
var electron_is_dev_1 = __importDefault(require("electron-is-dev"));
var MatchStatusCommand_1 = require("./quickplay/MatchStatusCommand");
var STATUS_INITITATED = 0;
var STATUS_FINDING_SERVERS = 1;
var STATUS_CHANGING_MAPS = 2;
var STATUS_FAILED = 3;
var STATUS_CANCELLED = 4;
var STATUS_FINISHED = 5;
var Quickplay = (function () {
    function Quickplay() {
        var _this = this;
        electron_1.ipcMain.on("InitQuickplay", function (event, args) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                electron_log_1.default.verbose("Sending Quickplay config to renderer");
                event.reply("quickplay-setup", quickplay_config_loader_1.default.instance.GetFile());
                return [2];
            });
        }); });
        electron_1.ipcMain.on("quickplay-search", function (event, arg) {
            _this.currentMatchId = null;
            _this.Search(event, arg);
        });
    }
    Quickplay.prototype.Search = function (event, arg) {
        return __awaiter(this, void 0, void 0, function () {
            var params, resp, e_1, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        electron_log_1.default.log("Starting quickplay search...");
                        params = arg;
                        return [4, this.CreateNewMatch(params)];
                    case 1:
                        resp = _a.sent();
                        if (resp.result == "SUCCESS") {
                            this.currentMatchId = resp.match_id;
                            event.reply("quickplay-search-reply");
                        }
                        return [4, this.WaitForMatchResult(this.currentMatchId, event)];
                    case 2:
                        _a.sent();
                        return [3, 4];
                    case 3:
                        e_1 = _a.sent();
                        error = electron_is_dev_1.default ? e_1.toString() : "Failed to start a quickplay search";
                        utilities_1.Utilities.ErrorDialog(error, "Quickplay Error");
                        return [3, 4];
                    case 4: return [2];
                }
            });
        });
    };
    Quickplay.prototype.WaitForMatchResult = function (matchId, event) {
        return __awaiter(this, void 0, void 0, function () {
            var status;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.GetEndMatchStatus(matchId)];
                    case 1:
                        status = _a.sent();
                        if (status.status == STATUS_FINISHED) {
                            event.reply("quickplay-search-success", status);
                        }
                        else {
                            event.reply("quickplay-search-fail", null);
                        }
                        return [2];
                }
            });
        });
    };
    Quickplay.prototype.GetEndMatchStatus = function (matchId) {
        return __awaiter(this, void 0, void 0, function () {
            var resp, statusCommand, _resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resp = null;
                        _a.label = 1;
                    case 1:
                        if (!(resp == null)) return [3, 3];
                        electron_log_1.default.verbose("Starting new MatchStatusCommand");
                        statusCommand = new MatchStatusCommand_1.MatchStatusCommand(matchId);
                        return [4, CreatorsAPIDispatcher_1.default.instance.ExecuteCommandAsync(statusCommand)];
                    case 2:
                        _resp = _a.sent();
                        switch (_resp.status) {
                            case STATUS_FINDING_SERVERS:
                            case STATUS_CHANGING_MAPS:
                            case STATUS_INITITATED:
                                electron_log_1.default.verbose("Retrying MatchStatusCommand");
                                resp = null;
                                break;
                            case STATUS_FINISHED:
                            case STATUS_FAILED:
                            case STATUS_CANCELLED:
                                electron_log_1.default.verbose("Finished MatchStatusCommand, got FINISHED or FAILED");
                                resp = _resp;
                                break;
                        }
                        return [3, 1];
                    case 3: return [2, resp];
                }
            });
        });
    };
    Quickplay.prototype.CreateNewMatch = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (resp, rej) {
                        var matchCmd = new CreateMatchCommand_1.CreateMatchCommand(params);
                        matchCmd.OnResponse = resp;
                        matchCmd.OnFailure = rej;
                        CreatorsAPIDispatcher_1.default.instance.ExecuteCommand(matchCmd);
                    })];
            });
        });
    };
    return Quickplay;
}());
exports.default = Quickplay;
//# sourceMappingURL=quickplay.js.map