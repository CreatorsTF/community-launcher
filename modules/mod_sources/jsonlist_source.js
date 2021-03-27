"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var https_1 = __importDefault(require("https"));
var mod_source_base_1 = __importDefault(require("./mod_source_base"));
var electron_log_1 = __importDefault(require("electron-log"));
var cloudFlareMessage = "\nFailed to get this mods latest data due to Cloudflare rate limiting. \nPlease wait till normal web service resumes or report on our Discord.";
var JsonListSource = /** @class */ (function (_super) {
    __extends(JsonListSource, _super);
    function JsonListSource(install_data) {
        var _this = _super.call(this, install_data) || this;
        _this.url = "";
        _this.fileType = "ARCHIVE";
        _this.jsonlist_data = null;
        _this.url = install_data.get_url;
        //If this property is present, lets add a random query on the end of the URL to get an un cached version of this file.
        if (install_data.cloudflarebypass != null) {
            _this.url += "?" + Math.floor(Math.random() * 1000000000);
        }
        return _this;
    }
    JsonListSource.prototype.GetJsonData = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.jsonlist_data == null) {
                _this.GetJsonReleaseData().then(resolve).catch(reject);
            }
            else
                resolve(_this.jsonlist_data);
        });
    };
    JsonListSource.prototype.GetLatestVersionNumber = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.GetJsonData().then(function (json_data) {
                resolve(json_data[_this.data.version_property_name]);
            }).catch(reject);
        });
    };
    JsonListSource.prototype.GetFileURL = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.GetJsonData().then(function (json_data) {
                resolve(json_data[_this.data.install_url_property_name]);
            });
        });
    };
    JsonListSource.prototype.GetJsonReleaseData = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var data = [];
            var options = {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0"
                }
            };
            var req = https_1.default.get(_this.url, options, function (res) {
                console.log("statusCode: " + res.statusCode);
                res.on('data', function (d) {
                    if (res.statusCode == 503) {
                        reject(cloudFlareMessage);
                        return;
                    }
                    data.push(d);
                });
                res.on("end", function () {
                    try {
                        var buf = Buffer.concat(data);
                        if (res.statusCode == 503) {
                            reject(cloudFlareMessage);
                            return;
                        }
                        else if (res.statusCode != 200) {
                            reject("Failed accessing " + _this.url + ": " + res.statusCode + ".");
                            electron_log_1.default.error(buf.toString());
                            return;
                        }
                        else {
                            var parsed = JSON.parse(buf.toString());
                            resolve(parsed);
                        }
                    }
                    catch (error) {
                        //Json parsing failed soo reject.
                        electron_log_1.default.error("Json parse failed. Endpoint is probably not returning valid JSON. Site may be down!");
                        reject(error.toString());
                    }
                });
            });
            req.on('error', function (error) {
                reject(error);
            });
            req.end();
        });
    };
    return JsonListSource;
}(mod_source_base_1.default));
exports.default = JsonListSource;
//# sourceMappingURL=jsonlist_source.js.map