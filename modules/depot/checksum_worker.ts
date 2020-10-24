import ChecksumWorkerData from "./ChecksumWorkerData";
import fs from "fs";
import _crypto from "crypto";
const { workerData, parentPort } = require('worker_threads');

var checksumWorkerData : ChecksumWorkerData[];
checksumWorkerData = <ChecksumWorkerData[]>workerData;

//Loop through our data objects and calculate their checksums and if they are a match.
for(var data of checksumWorkerData) {
    let file = fs.readFileSync(data.filePath);
    let hash = _crypto.createHash("md5").update(file).digest("hex");
    data.SetIsMatch(hash != data.md5Hash);
}

parentPort.postMessage({ result: checksumWorkerData });