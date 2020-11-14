import { ChecksumWorkerData } from "./ChecksumWorkerData";
import fs from "fs";
import _crypto from "crypto";
const { workerData, parentPort } = require('worker_threads');

var checksumWorkerData : Array<ChecksumWorkerData>;
checksumWorkerData = <Array<ChecksumWorkerData>>workerData;

if(checksumWorkerData.length > 0){
    //Loop through our data objects and calculate their checksums and if they are a match.
    for(var data of checksumWorkerData) {
        if(fs.existsSync(data.filePath)){
            let file = fs.readFileSync(data.filePath);
            let hash = _crypto.createHash("md5").update(file).digest("hex");
            data.localMd5Hash = hash;
            data.ismatch = (hash == data.remoteMd5Hash);
            data.fileExisted = true;
        }
        else {
            data.fileExisted = false;
            data.ismatch = false;
        }
    }
}
else{
    throw new Error("ChecksumWorker was given an empty array");
}

parentPort.postMessage({ result: checksumWorkerData });