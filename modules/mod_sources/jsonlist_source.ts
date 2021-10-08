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
            if(this.jsonlist_data != null){
                resolve(this.jsonlist_data);
            } else {
                this.GetJsonReleaseData().then(resolve).catch(reject);
            }
        });
    }

    async GetLatestVersionNumber() : Promise<number> {
        return new Promise((resolve, reject) => {
            this.GetJsonData().then((json_data) => {
                try {
                    if (json_data == null || json_data == "") {
                        reject("Empty JSON.");
                    }
                    else {
                        const version: number = json_data[this.data[0].version_property_name];
                        resolve(version);
                    }
                }
                catch (error) {
                    reject("An error occurred on JSON parse. Cause: " + error.toString());
                }
            }).catch(reject);
        });
    }

    async GetDisplayVersionNumber() : Promise<string> {
        const version = await this.GetLatestVersionNumber();
        return version.toString();
    }

    async GetFileURL() : Promise<string>{
        return new Promise((resolve) => {
            this.GetJsonData().then((json_data) => {
                const propertyName = json_data[this.data[0].install_url_property_name];
                resolve(propertyName);
            });
        });
    }

    async GetJsonReleaseData() : Promise<any> {
        const resp = await axios.get(this.url);
        if (resp.status == 200) {
            let data = resp.data;
            return data;
        }
        else if(resp.status == 403){
            throw new Error("File was missing/not found.");
        }
        else if(resp.status == 503){
            throw new Error(cloudFlareMessage);
        }
        else {
            throw new Error(`Could not properly access "${this.url}". HTTP code was: ${resp.status}. Error: ${resp.statusText}`);
        }
    }
}

export default JsonListSource;
