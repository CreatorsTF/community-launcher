"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ChecksumWorkerData = /** @class */ (function () {
    function ChecksumWorkerData(fPath, md5) {
        this.filePath = fPath;
        this.md5Hash = md5;
        this.computed = false;
        this.ismatch = false;
    }
    ChecksumWorkerData.prototype.SetIsMatch = function (value) {
        this.ismatch = value;
        this.computed = true;
    };
    ChecksumWorkerData.prototype.GetIsComputed = function () {
        return this.computed;
    };
    ChecksumWorkerData.prototype.GetIsMatch = function () {
        return this.ismatch;
    };
    return ChecksumWorkerData;
}());
exports.default = ChecksumWorkerData;
//# sourceMappingURL=ChecksumWorkerData.js.map