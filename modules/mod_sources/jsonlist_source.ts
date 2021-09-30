import https from "https";
import log from "electron-log";
import ModInstallSource from "./mod_source_base";
import { Install } from "../mod_list_loader";
import axios from "axios";

const cloudFlareMessage = "\nFailed to get this mods latest data due to Cloudflare rate limiting. \nPlease wait till normal web service resumes or report on our Discord.";

class JsonListSource extends ModInstallSource {
    url: string;
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
            else {
                resolve(this.jsonlist_data);
            }
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
        const version = await this.GetLatestVersionNumber();
        return version.toString();
    }

    GetFileURL() : Promise<string>{
        return new Promise((resolve) => {
            this.GetJsonData().then((json_data) => {
                resolve(json_data[this.data[0].install_url_property_name]);
            });
        });
    }

    async GetJsonReleaseData() : Promise<any> {
        const resp = await axios.get(this.url);
        if(resp.status == 200) {
            return resp.data;
        }
        else if(resp.status == 403){
            throw new Error("File was missing/not found.");
        }
        else if(resp.status == 503){
            throw new Error(cloudFlareMessage);
        }
        else if(resp.status != 200){
            throw new Error(`Could not properly access "${this.url}". HTTP code was:${resp.status}.`);
        }
        else {
            throw new Error(resp.statusText);
        }
    }
}

export default JsonListSource;
