"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var mod_source_base_js_1 = __importDefault(require("./mod_source_base.js"));
var https_1 = __importDefault(require("https"));
// Reference: https://developer.github.com/v3/repos/releases/#list-releases
var github_api_url = "https://api.github.com/";
var GithubSource = /** @class */ (function (_super) {
    __extends(GithubSource, _super);
    function GithubSource(install_data) {
        var _this = _super.call(this, install_data) || this;
        _this.github_data = null;
        _this.fileType = "FILE";
        return _this;
    }
    //Function to get the latest github data from memory or request.
    GithubSource.prototype._GetGithubData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        if (_this.github_data != null)
                            resolve(_this.github_data);
                        else {
                            _this._GetGitHubReleaseData().then(resolve).catch(reject);
                        }
                    })];
            });
        });
    };
    GithubSource.prototype.GetLatestVersionNumber = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this._GetGithubData().then(function (data) {
                            if (data.length == null || data.length == 0)
                                reject("No releases avaliable to download");
                            var date = data[0].published_at;
                            date = date.split("T")[0];
                            date = date.replace(/-/g, "");
                            resolve(date);
                        }).catch(reject);
                    })];
            });
        });
    };
    GithubSource.prototype.GetDisplayVersionNumber = function () {
        return __awaiter(this, void 0, void 0, function () {
            var versionNumber, githubData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.GetLatestVersionNumber()];
                    case 1:
                        versionNumber = _a.sent();
                        return [4 /*yield*/, this._GetGithubData()];
                    case 2:
                        githubData = _a.sent();
                        return [2 /*return*/, githubData[0].name + " (" + versionNumber + ")"];
                }
            });
        });
    };
    GithubSource.prototype.GetFileURL = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        //Try to get the download url for the release asset.
                        _this._GetGithubData().then(function (data) {
                            var releaseAssets = data[0].assets;
                            if (releaseAssets != null && releaseAssets != []) {
                                var asset = void 0;
                                if (_this.data.hasOwnProperty("asset_index"))
                                    asset = releaseAssets[_this.data.asset_index];
                                else
                                    asset = releaseAssets[0];
                                if (asset != null) {
                                    resolve(asset.browser_download_url);
                                }
                                reject("This Github repositorys latest release was missing a usable asset.");
                            }
                            else
                                reject("This Github repository has no releases avaliable.");
                        }).catch(reject);
                    })];
            });
        });
    };
    GithubSource.prototype._GetGitHubReleaseData = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            //Construct initial request url to github api
            var url = github_api_url + ("repos/" + _this.data.owner + "/" + _this.data.name + "/releases");
            var options = {
                headers: {
                    'User-Agent': 'creators-tf-launcher'
                }
            };
            var data = [], dataLen = 0;
            var req = https_1.default.get(url, options, function (res) {
                console.log("statusCode: " + res.statusCode);
                res.on('data', function (d) {
                    if (res.statusCode != 200) {
                        reject("Failed accessing " + url + ": " + res.statusCode);
                        return;
                    }
                    data.push(d);
                });
                res.on("end", function () {
                    var buf = Buffer.concat(data);
                    var parsed = JSON.parse(buf.toString());
                    resolve(parsed);
                });
            });
            req.on('error', function (error) {
                reject(error.toString());
            });
            req.end();
        });
    };
    return GithubSource;
}(mod_source_base_js_1.default));
exports.default = GithubSource;
//# sourceMappingURL=github_source.js.map