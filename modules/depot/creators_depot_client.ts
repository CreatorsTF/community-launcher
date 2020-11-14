import https from "https";
import fs from "fs";
import _crypto from "crypto";
import path from "path";
const ProgressBar = require("electron-progressbar");
const strf = require('string-format');
import { Worker } from 'worker_threads';
import {ChecksumWorkerData} from "./ChecksumWorkerData";
import { Utilities } from "../utilities";

//Checks for updates of local files based on their md5 hash.
class CreatorsDepotClient {

    private allContentURL = "https://creators.tf/api/IDepots/GVersionInfo?depid=1&tags=content";
    private downloadRequestURL = "https://creators.tf/api/IDepots/GDownloadFile?depid=1&file={0}";
    private allDepotData : string | undefined;
    private modPath : string;
    private filesToUpdate : Array<ChecksumWorkerData> = [];
    private MaxConcurrentDownloads = 3;
    private updateActive = false;
    private currentDownloads = 0;
    private workerThreadCount = 6;

    constructor(modpath : string){
        this.modPath = modpath;
    }

    public CheckForUpdates() : Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            var data : any;
            try{
                data = await this.GetDepotData();
            }
            catch(error){
                reject(error);
            }

            //@ts-ignore
            var progressBar = Utilities.GetNewLoadingPopup("Checking files for updates", global.mainWindow, reject);
            var detailStr = "Checking files ";
            progressBar.detail = detailStr + `(${this.workerThreadCount}/${this.workerThreadCount}) workers left.`;

            var workerData = new Array<ChecksumWorkerData>();

            if(data.result == "SUCCESS"){
                for(var group of data.groups){
                    var dir = group.directory.local;
                    dir = dir.replace("Path_Mod", this.modPath);
                    dir = path.normalize(dir);
                    for(var fileData of group.files){
                        let filePath = fileData[0];
                        let hash = fileData[1];

                        let remotePath = path.join(group.directory.remote, filePath.replace("\\", "/"));

                        workerData.push(new ChecksumWorkerData( path.join(dir, filePath), hash,  remotePath));
                    }
                }
            }
            else{
                reject(`Server error, status was: ${data.result}`);
            }

            //Setup workers to check and calculate checksums
            var dataPerWorker = Math.ceil(workerData.length / this.workerThreadCount);
            var processedWorkerData = new Array<ChecksumWorkerData>();
            var runningWorkers = 0;

            const ProcessWorkerResults = (filesToUpdate : ChecksumWorkerData[]) => {
                for(var processedData of processedWorkerData){
                    if(!processedData.ismatch){
                        filesToUpdate.push(processedData);
                    }
                }
                progressBar.setCompleted();
                resolve(filesToUpdate.length > 0);
            };

            for(var i = 0; i < this.workerThreadCount; i++){
                let startIndex = dataPerWorker * i;
                let endIndex = dataPerWorker * (i + 1);
                let ourIndex = i;
                let splicedWorkers = workerData.slice(startIndex, endIndex);
                runningWorkers++;
                //@ts-ignore
                global.log.log("Starting Checksumworker no:" + i);
                this.RunNewChecksumWorker(splicedWorkers).then(
                (result : any) => {
                    runningWorkers--;
                    //@ts-ignore
                    global.log.log(`Worker ${ourIndex} finished! ${runningWorkers} remain.`);
                    progressBar.detail = detailStr + `(${runningWorkers}/${this.workerThreadCount}) workers left.`;
                    processedWorkerData = processedWorkerData.concat(result.result);
                    if(runningWorkers < 1) {
                        //@ts-ignore
                        global.log.log(`Workers done. Processing results.`);
                        ProcessWorkerResults(this.filesToUpdate);
                    }
                }).catch(reject);
            }
        });
    }

    async GetDepotData() : Promise<any> {
        return new Promise((resolve, reject) => {
            if(this.allDepotData == undefined){
                var options = {
                    headers: {
                      'User-Agent': 'creators-tf-launcher'
                    }
                };
    
                var req = https.get(this.allContentURL, options, function (res : any) {
                    if (res.statusCode !== 200) {
                        let error = `Request failed, response code was: ${res.statusCode}`;
                        reject(error);
                    }
                    else {  
                        var data: any[] = [], dataLen = 0;
        
                        res.on("data", function (chunk: string | any[]) {
                            data.push(chunk);
                            dataLen += chunk.length;
                        });
        
                        res.on("end", () => {
                            var buf = Buffer.concat(data);
    
                            resolve(JSON.parse(buf.toString()));
                        });
                    }
                });
        
                req.on("error", function (err : any) {
                    reject(err.toString());
                });
    
            }

            else resolve(this.allDepotData);
        });
    }

    public async UpdateFiles(mainWindow : any, app : any, loadingTextStyle : any) : Promise<void> {
        return new Promise((resolve, reject) => {
            if(this.filesToUpdate.length > 0){
                var progressBar = new ProgressBar({
                    indeterminate: false,
                    text: "Downloading Mod Files",
                    detail: "Starting Download...",
                    abortOnError: true,
                    closeOnComplete: false,
                    maxValue: this.filesToUpdate.length,
                    browserWindow: {
                        webPreferences: {
                            nodeIntegration: true
                        },
                        width: 550,
                        parent: mainWindow,
                        modal: true,
                        title: "Downloading Mod Files",
                        backgroundColor: "#2b2826",
                        closable: true
                    },
                    style: {
                        text: loadingTextStyle,
                        detail: loadingTextStyle,
                        value: loadingTextStyle
                    }
                }, app);
    
                //Setup events to display data.
                progressBar
                .on('completed', function () {
                    //progressBar.detail = 'Download Finished!';
                })
                .on('aborted', function (value : any) {
                    reject("Download Cancelled by User!");
                });

                this.updateActive = true;
                var currentIndex = 0;

                //Start downloads equal to files to update length or max amount, whichever is smaller.
                for(var i = 0; i < Math.min(this.filesToUpdate.length, this.MaxConcurrentDownloads); i++){
                    //Download the file then write to disk strait away.
                    try{
                        this.UpdateNextFile(currentIndex, progressBar);
                        currentIndex++;
                    }
                    catch(error : any){
                        reject(error);
                    }
                }

                if(currentIndex < this.filesToUpdate.length){
                    var checkFunction = () => {
                        if(this.currentDownloads > 0 && this.updateActive){
                            //Can we start updating a new file?
                            if(this.currentDownloads < this.MaxConcurrentDownloads){
                                if(currentIndex < this.filesToUpdate.length){
                                    try{
                                        this.UpdateNextFile(currentIndex, progressBar);
                                        currentIndex++;
                                    }
                                    catch(error : any){
                                        reject(error);
                                    }
                                }
                                else if(this.currentDownloads == 0){
                                    this.updateActive = false;
                                    progressBar.setCompleted();
                                    progressBar.close();
                                    resolve();
                                }
                            }

                            //Recheck this in 100ms.
                            setTimeout(checkFunction, 100);
                        }

                        if(!this.updateActive){
                            resolve();
                        }
                    };

                    checkFunction();
                }
            }
        });
    }

    //Start a download and write the first file from the queue. 
    private UpdateNextFile(index : number, progressBar : any) {
        var fileToUpdate = this.filesToUpdate[index];

        //Format request url, then fix the slashes used
        let fileReqURL = strf(this.downloadRequestURL, fileToUpdate.remotePath);
        fileReqURL = fileReqURL.replace(/\\/g,"/");

        this.DownloadFile(fileReqURL, progressBar).then(
            (fileBuffer) => {
                this.WriteFile(fileToUpdate.filePath, fileBuffer);
                this.currentDownloads--;
            }
        ).catch((e) => {throw new Error(e);});
        this.currentDownloads++;
    }

    private async DownloadFile(url : string, progressBar : any) : Promise<Buffer> {
        return new Promise((resolve, reject) => {
            //@ts-ignore
            global.log.log(`Starting download for ${url}`);
            var options = {
                headers: {
                  'User-Agent': 'creators-tf-launcher'
                }
            };
    
            var req = https.get(url, options, function (res : any) {
                if (res.statusCode !== 200) {
                    let error = `Request failed, response code was: ${res.statusCode}`;
                    reject(error);
                }
                else {
                    var data: any[] = [];
    
                    res.on("data", function (chunk: string | any[]) {
                        data.push(chunk);
                    });
    
                    res.on("end", () => {
                        var buf = Buffer.concat(data);
                        progressBar.detail = "Downloaded " + url;
                        progressBar.value++;
                        resolve(buf);
                    });
                }
            });
    
            req.on("error", function (err : any) {
                reject(new Error(err.toString()));
            });
        });
    }

    private WriteFile(targetpath : string, data : Buffer){
        //@ts-ignore
        global.log.log(`Writing file "${targetpath}"`);
        let dir = path.dirname(targetpath);

        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir, {recursive: true});
        }
        
        fs.writeFileSync(targetpath, data);
    }

    private RunNewChecksumWorker(checksumWorkerData : ChecksumWorkerData[]) {
        return new Promise((resolve, reject) => {
          const worker = new Worker(path.join(__dirname, 'checksum_worker.js'), { workerData: checksumWorkerData });
          worker.on('message', resolve);
          worker.on('error', (e) => {
              reject(e);
            });
          worker.on('exit', (code) => {
            if (code !== 0)
              reject(new Error(`Worker stopped with exit code ${code}`));
          })
        })
    }

}

export {CreatorsDepotClient};