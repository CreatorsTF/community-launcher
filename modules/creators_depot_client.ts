const https = require("https");
const fs = require("fs");
const _crypto = require("crypto");

module.exports = 
class CreatorsDepotClient {
    //Checks for updates of local files based on their md5 hash.

    allContentURL = "https://creators.tf/api/IDepots/GVersionInfo?depid=1&tags=content";

    allDepotData : string | undefined;

    tf2Path : string;

    filesToUpdate : Array<string> = [];

    constructor(tf2path : string){
        this.tf2Path = tf2path;
    }

    async CheckForUpdates() : Promise<void> {
        var data = await this.GetDepotData();

        if(data.result == "SUCCESS"){
            for(var group of data.groups){

            }
        }
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
    
                var req = https.get(this.allContentURL, function (res : any) {
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
}