"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var crypto_1 = __importDefault(require("crypto"));
var _a = require('worker_threads'), workerData = _a.workerData, parentPort = _a.parentPort;
var checksumWorkerData;
checksumWorkerData = workerData;
//Loop through our data objects and calculate their checksums and if they are a match.
for (var _i = 0, checksumWorkerData_1 = checksumWorkerData; _i < checksumWorkerData_1.length; _i++) {
    var data = checksumWorkerData_1[_i];
    var file = fs_1.default.readFileSync(data.filePath);
    var hash = crypto_1.default.createHash("md5").update(file).digest("hex");
    data.SetIsMatch(hash != data.md5Hash);
}
parentPort.postMessage({ result: checksumWorkerData });
//# sourceMappingURL=checksum_worker.js.map