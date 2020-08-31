"use strict";
const https = global.https;
const { ModInstallSource } = require("./mod_source_base.js");

module.exports.JsonListSource = class JsonListSource extends ModInstallSource {
    url = "";
    fileType = "ARCHIVE";
    jsonlist_data = null;

    constructor(install_data) {
        super(install_data);
        this.url = install_data.get_url;
    }

    GetJsonData() {
        return new Promise((resolve, reject) => {
            if (this.jsonlist_data == null) {
                this.GetJsonReleaseData().then(resolve).catch(reject);
            } else resolve(this.jsonlist_data);
        });
    }

    GetLatestVersionNumber() {
        return new Promise((resolve, reject) => {
            this.GetJsonData()
                .then((json_data) => {
                    resolve(json_data[this.data.version_property_name]);
                })
                .catch(reject);
        });
    }

    GetFileURL() {
        return new Promise((resolve, reject) => {
            this.GetJsonData().then((json_data) => {
                resolve(json_data[this.data.install_url_property_name]);
            });
        });
    }

    GetJsonReleaseData() {
        return new Promise((resolve, reject) => {
            let req = https.get(this.url, (res) => {
                console.log(`statusCode: ${res.statusCode}`);
                res.on("data", (d) => {
                    d = JSON.parse(d);
                    resolve(d);
                });
            });

            req.on("error", (error) => {
                reject(error);
            });

            req.end();
        });
    }
};
