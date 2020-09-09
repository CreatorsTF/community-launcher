import https from "https";
import fs from "fs";
import _crypto from "crypto";
import path from "path";
import { exception } from "console";
const ProgressBar = require("electron-progressbar");

module.exports = 
class CreatorsDepotClient {
    //Checks for updates of local files based on their md5 hash.

    allContentURL = "https://creators.tf/api/IDepots/GVersionInfo?depid=1&tags=content";

    allDepotData : string | undefined;

    modPath : string;

    filesToUpdate : Array<string> = [];

    constructor(modpath : string){
        this.modPath = modpath;
    }

    async CheckForUpdates() : Promise<boolean> {
        var data = await this.GetDepotData();

        if(data.result == "SUCCESS"){
            for(var group of data.groups){
                var dir = group.directory.local;
                dir.replace("Path_Mod/", "");
                dir = path.join(this.modPath, dir);

                for(var fileData of group.files){
                    let path = fileData[0];
                    let hash = fileData[1];

                    if(this.DoesFileNeedUpdate(path, hash)){
                        this.filesToUpdate.push(path);
                    }
                }
            }
        }

        return this.filesToUpdate.length > 0;
    }

    DoesFileNeedUpdate(filePath : string, md5Hash : string) : boolean {
        if(fs.existsSync(filePath)){
            var file = fs.readFileSync(filePath);

            var hash = _crypto.createHash("md5").update(file).digest("hex");
            return (hash != md5Hash);
        }
        else return true;
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

    async UpdateFiles(mainWindow : any, app : any, loadingTextStyle : string) : Promise<void> {
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

                //We need to download files and write them to disk as soon as we get them to not hold them in memory.
                
            }
        });
    }

    async DownloadFile(url : string) : Promise<Buffer> {
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
                    var data: any[] = [], dataLen = 0;
    
                    res.on("data", function (chunk: string | any[]) {
                        data.push(chunk);
                        dataLen += chunk.length;
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

    async WriteFile(path : string, data : Buffer) : Promise<void> {
        fs.writeFileSync(path, data);
    }
}