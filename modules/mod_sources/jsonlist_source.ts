"use strict";
import https from "https";
import ModInstallSource from "./mod_source_base";
import ElectronLog from "electron-log";
import { Install } from "modules/mod_list_loader";

const cloudFlareMessage = "\nFailed to get this mods latest data due to Cloudflare rate limiting. \nPlease wait till normal web service resumes or report on our Discord.";

class JsonListSource extends ModInstallSource {
    url: string = "";
    fileType = "ARCHIVE";
    jsonlist_data = null;

    constructor(install_data: Install[]){
        super(install_data);
        this.url = install_data[0].get_url;

        //If this property is present, lets add a random query on the end of the URL to get an un cached version of this file.
        if(install_data[0].cloudflarebypass != null){
            this.url += `?${Math.floor(Math.random() * 1000000000)}`;
        }
    }

    GetJsonData() : Promise<any>{
        return new Promise((resolve, reject) => {
            if(this.jsonlist_data == null){
                this.GetJsonReleaseData().then(resolve).catch(reject);
            }
            else resolve(this.jsonlist_data);
        });
    }

    async GetLatestVersionNumber() : Promise<number> {
        return new Promise((resolve, reject) => {
            this.GetJsonData().then((json_data) => {
                resolve(json_data[this.data[0].version_property_name]);
            }).catch(reject);
        });
    }

    async GetDisplayVersionNumber() : Promise<string> {
        let version = await this.GetLatestVersionNumber();
        return version.toString();
    }

    GetFileURL() : Promise<string>{
        return new Promise((resolve, reject) => {
            this.GetJsonData().then((json_data) => {
                resolve(json_data[this.data[0].install_url_property_name]);
            });
        });
    }

    GetJsonReleaseData(){
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
                    if(res.statusCode == 503){
                        reject(cloudFlareMessage);
                        return;
                    }

                    data.push(d);
                });

                res.on("end",  () => {
                    try{
                        var buf = Buffer.concat(data);
                        if(res.statusCode == 503){
                            reject(cloudFlareMessage);
                            return;
                        }
                        else if(res.statusCode == 403){
                            reject("File was missing/not found.");
                        }
                        else if(res.statusCode == 503){
                            reject("HTTP 503, The server is busy/unable to handle the request at the current time. Try again later.");
                        }
                        else if(res.statusCode != 200){
                            reject(`Could not properly access "${this.url}". HTTP code was:${res.statusCode}.`);
                            return;
                        }
                        else{
                            let parsed = JSON.parse(buf.toString());
                            resolve(parsed);
                        }
                    }
                    catch (error){
                        //Json parsing failed, reject.
                        ElectronLog.error("Json parse failed. Website is not returning valid JSON. Site may be down!");
                        reject(error.toString());
                    }
                });
            });
            
            req.on('error', error => {
                reject("Request Error: " + error);
            });
            
            req.end();
        });
    }
}

export default JsonListSource;