"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var utilities_1 = __importDefault(require("../utilities"));
var ChecksumCache = /** @class */ (function () {
    function ChecksumCache(name) {
        this.name = name;
        this.cachePath = path_1.default.join(utilities_1.default.GetDataFolder(), "depot_checksum_cache");
    }
    ChecksumCache.prototype.GetFileChecksum = function (filePath) {
        return "";
    };
    return ChecksumCache;
}());
exports.default = ChecksumCache;
//# sourceMappingURL=checksum_cache.js.map