"use strict";
import https from "https";
import ModInstallSource from "./mod_source_base";
import ElectronLog from "electron-log";

const cloudFlareMessage = "\nFailed to get this mods latest data due to Cloudflare rate limiting. \nPlease wait till normal web service resumes or report on our Discord.";

class JsonListSource extends ModInstallSource {
    url: string = "";
    fileType = "ARCHIVE";
    jsonlist_data = null;

    constructor(install_data) {
        super(install_data);
        this.url = install_data.get_url;

        //If this property is present, lets add a random query on the end of the URL to get an un cached version of this file.
        if (install_data.cloudflarebypass != null) {
            this.url += `?${Math.floor(Math.random() * 1000000000)}`;
        }
    }

    GetJsonData(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.jsonlist_data == null) {
                this.GetJsonReleaseData().then(resolve).catch(reject);
            }
            else resolve(this.jsonlist_data);
        });
    }

    GetLatestVersionNumber(): Promise<number> {
        return new Promise((resolve, reject) => {
            this.GetJsonData().then((json_data) => {
                resolve(json_data[this.data.version_property_name]);
            }).catch(reject);
        });
    }

    async GetDisplayVersionNumber(): Promise<string> {
        return await this.GetLatestVersionNumber().toString();
    }

    GetFileURL(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.GetJsonData().then((json_data) => {
                resolve(json_data[this.data.install_url_property_name]);
            });
        });
    }

    GetJsonReleaseData() {
        return new Promise((resolve, reject) => {
            var data = [];

            var options = {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0"
                }
            };

            let req = https.get(this.url, options, res => {
                console.log(`statusCode: ${res.statusCode}`);

                res.on('data', d => {
                    if (res.statusCode == 503) {
                        reject(cloudFlareMessage);
                        return;
                    }

                    data.push(d);
                });

                res.on("end", () => {
                    try {
                        var buf = Buffer.concat(data);
                        if (res.statusCode == 503) {
                            reject(cloudFlareMessage);
                            return;
                        }
                        else if (res.statusCode != 200) {
                            reject(`Failed accessing ${this.url}: ${res.statusCode}.`);
                            ElectronLog.error(buf.toString());
                            return;
                        }
                        else {
                            let parsed = JSON.parse(buf.toString());
                            resolve(parsed);
                        }
                    }
                    catch (error) {
                        //Json parsing failed soo reject.
                        ElectronLog.error("Json parse failed. Endpoint is probably not returning valid JSON. Site may be down!");
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

export default JsonListSource;