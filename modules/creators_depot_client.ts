const https = require("https");

module.exports = 
class CreatorsDepotClient {
    //Checks for updates of local files based on their md5 hash.

    allContentURL = "https://creators.tf/api/IDepots/GVersionInfo?depid=1&tags=content";

    allContentJSON : string | undefined;

    tf2Path : string;

    constructor(tf2path : string){
        this.tf2Path = tf2path;

    }

    CheckForUpdates() : void {
        
    }

    async GetDepotData() {
        return new Promise((resolve, reject) => {
            if(this.allContentJSON == undefined){
                var options = {
                    headers: {
                      'User-Agent': 'creators-tf-launcher'
                    }
                };
    
                var req = https.get(this.allContentURL, function (res) {
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
        });
    }
}