"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecksumWorkerData = void 0;
var ChecksumWorkerData = /** @class */ (function () {
    function ChecksumWorkerData(fPath, md5, remotePath) {
        this.filePath = fPath;
        this.remoteMd5Hash = md5;
        this.localMd5Hash = "";
        this.computed = false;
        this.ismatch = false;
        this.fileExisted = false;
        this.remotePath = remotePath;
    }
    return ChecksumWorkerData;
}());
exports.ChecksumWorkerData = ChecksumWorkerData;
//# sourceMappingURL=ChecksumWorkerData.js.map