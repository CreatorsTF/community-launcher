import https from "https";
import fs from "fs";
import _crypto from "crypto";
import path from "path";
const ProgressBar = require("electron-progressbar");
const strf = require('string-format');
const isDev = require("electron-is-dev");

//Checks for updates of local files based on their md5 hash.
class CreatorsDepotClient {

    private allContentURL = "https://creators.tf/api/IDepots/GVersionInfo?depid=1&tags=content";
    private downloadRequestURL = "https://creators.tf/api/IDepots/GDownloadFile?depid=1&file={0}";
    private allDepotData : string | undefined;
    private modPath : string;
    private filesToUpdate : Array<string> = [];
    private MaxConcurrentDownloads = 3;
    private updateActive = false;
    private currentDownloads = 0;

    constructor(modpath : string){
        this.modPath = modpath;
    }

    async CheckForUpdates() : Promise<boolean> {
        var data = await this.GetDepotData();

        if(data.result == "SUCCESS"){
            for(var group of data.groups){
                var dir = group.directory.local;
                dir = dir.replace("Path_Mod/", "");
                dir = path.join(this.modPath, dir);

                for(var fileData of group.files){
                    let filePath = fileData[0];
                    let hash = fileData[1];

                    if(this.DoesFileNeedUpdate(path.join(dir, filePath), hash)){
                        this.filesToUpdate.push(filePath);
                    }
                }
            }
        }

        return this.filesToUpdate.length > 0;
    }

    private DoesFileNeedUpdate(filePath : string, md5Hash : string) : boolean {
        if(fs.existsSync(filePath)){
            var file = fs.readFileSync(filePath);

            var hash = _crypto.createHash("md5").update(file).digest("hex");
            return (hash != md5Hash);
        }
        return true;
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

    public async UpdateFiles(mainWindow : any, app : any, loadingTextStyle : string) : Promise<void> {
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
                        backgroundColor: "#2b2826"
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

                //We need to download files and write them to disk as soon as we get them to not hold them in memory.
                for(var url of this.filesToUpdate) {
                    //Start downloads equal to files to update length or max amount, whichever is smaller.
                    for(var i = 0; i < Math.min(this.filesToUpdate.length, this.MaxConcurrentDownloads); i++){
                        //Download the file then write to disk strait away.
                        this.UpdateNextFile();
                    }
                }

                if(this.filesToUpdate.length > 0){
                    var checkFunction = () => {
                        if(this.currentDownloads > 0 && this.updateActive){
                            if(this.currentDownloads < this.MaxConcurrentDownloads){
                                this.UpdateNextFile();
                            }

                            //Recheck this in 100ms.
                            setTimeout(checkFunction, 100);
                        }
                        else {
                            //We should be finished. Lets resolve.
                            resolve();
                        }
                    };
                }
            }
        });
    }

    //Start a download and write the first file from the queue. 
    private UpdateNextFile() {
        try {
            var fileToUpdate = this.filesToUpdate[0];
            this.filesToUpdate.splice(0);
            this.DownloadFile(strf.format(this.downloadRequestURL, fileToUpdate)).then(
                (fileBuffer) => {
                    this.WriteFile(fileToUpdate, fileBuffer);
                    this.currentDownloads--;
                }
            );
            this.currentDownloads++;
        }
        catch (error : any) {
            this.updateActive = false;

            //We want to rethrow this error in development.
            //@ts-ignore
            if(isDev) global.log.error("Tried to update file but an error occured");
            else throw error;
        }
    }

    private async DownloadFile(url : string) : Promise<Buffer> {
        return new Promise((resolve, reject) => {
            var options = {
                headers: {
                  'User-Agent': 'creators-tf-launcher'
                }
            };
    
            var req = https.get(url, options, function (res : any) {
                if (res.statusCode !== 200) {
                    let error = `Request failed, response code was: ${res.statusCode}`;
                }
                else {  
                    var data: any[] = [];
    
                    res.on("data", function (chunk: string | any[]) {
                        data.push(chunk);
                    });
    
                    res.on("end", () => {
                        var buf = Buffer.concat(data);
    
                        resolve(buf);
                    });
                }
            });
    
            req.on("error", function (err : any) {
                reject(new Error(err.toString()));
            });
        });
    }

    private WriteFile(path : string, data : Buffer){
        fs.writeFileSync(path, data);
    }
}

export default CreatorsDepotClient;