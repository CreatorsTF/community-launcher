"use strict";
const https = require("https");
const { ModInstallSource } = require("./mod_source_base.js");

module.exports.JsonListSource = class JsonListSource extends ModInstallSource {
    url = "";
    fileType = "ARCHIVE";
    jsonlist_data = null;

    constructor(install_data){
        super(install_data);
        this.url = install_data.get_url;
    }

    GetJsonData(){
        return new Promise((resolve, reject) => {
            if(this.jsonlist_data == null){
                this.GetJsonReleaseData().then(resolve).catch(reject);
            }
            else resolve(this.jsonlist_data);
        });
    }

    GetLatestVersionNumber(){
        return new Promise((resolve, reject) => {
            this.GetJsonData().then((json_data) => {
                resolve(json_data[this.data.version_property_name]);
            }).catch(reject);
        });
    }

    GetFileURL(){
        return new Promise((resolve, reject) => {
            this.GetJsonData().then((json_data) => {
                resolve(json_data[this.data.install_url_property_name]);
            });
        });
    }

    GetJsonReleaseData(){
        return new Promise((resolve, reject) => {

            var data = [], dataLen = 0;
            let req = https.get(this.url, res => {
                console.log(`statusCode: ${res.statusCode}`);

                res.on('data', d => {
                    if(res.statusCode != 200){
                        reject(`Failed accessing ${url}: ` + res.statusCode);
                        return;
                    }
                    
                    data.push(d);
                });

                res.on("end", function () {
                    try{
                        var buf = Buffer.concat(data);
                        let parsed = JSON.parse(buf.toString());
                        resolve(parsed);
                    }
                    catch (error){
                        //Json parsing failed soo reject.
                        global.log.error("Json parse failed. Endpoint is probably not returning valid JSON. Site may be down!");
                        reject(error.toString());
                    }
                });
            });
            
            req.on('error', error => {
                reject(error);
            });
            
            req.end();
        });
    }
}
