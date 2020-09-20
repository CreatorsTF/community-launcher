"use strict";
const https = global.https;
const { ModInstallSource } = require("./mod_source_base.js");

module.exports.JsonListSource = class JsonListSource extends ModInstallSource {
    fileType = "ARCHIVE";
    jsonlist_data = null;

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
                resolve(json_data[this.GetInstallData().version_property_name]);
            }).catch(reject);
        });
    }

    GetFileURL(){
        return new Promise((resolve, reject) => {
            this.GetJsonData().then((json_data) => {
                resolve(json_data[this.GetInstallData().install_url_property_name]);
            });
        });
    }

    GetJsonReleaseData(){
        return new Promise((resolve, reject) => {
            let req = https.get(this.GetInstallData().get_url, res => {
            console.log(`statusCode: ${res.statusCode}`)
                res.on('data', d => {
                    d = JSON.parse(d);
                    resolve(d);
                });
            });
            
            req.on('error', error => {
                reject(error);
            });
            
            req.end();
        });
    }

    SetSubmod(submodName){
        super.SetSubmod(submodName);

        this.jsonlist_data = null;
    }
}
