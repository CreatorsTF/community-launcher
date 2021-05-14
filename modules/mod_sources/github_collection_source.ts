import  ModInstallSource from "./mod_source_base.js";
import CollectionSource from "./collection_source"
import https from "https";
import { Install } from "modules/mod_list_loader.js";

// Reference: https://developer.github.com/v3/repos/releases/#list-releases

const github_api_url = "https://api.github.com/";

class GithubCollectionSource extends CollectionSource {
    github_data = null;
    fileType = "FILE";

    constructor(install_data : Install[]){
        super(install_data);
    }

    //Function to get the latest github data from memory or request.
    async _GetGithubData(): Promise<any>{
        return new Promise((resolve, reject) => {
            if(this.github_data != null) resolve(this.github_data);
            else {
                this._GetGitHubReleaseData().then(resolve).catch(reject);
            }
        });
    }

    async GetLatestVersionNumber() : Promise<number>{
        return new Promise((resolve, reject) => {
            this._GetGithubData().then((data) => {
                if(data.length == null || data.length == 0) reject("No releases avaliable to download");

                let date = data[0].published_at;
                date = date.split("T")[0];
                date = date.replace(/-/g, "");
                
                resolve(date);
            }).catch(reject);
        });
    }

    async GetDisplayVersionNumber(): Promise<string> {
        let versionNumber = await this.GetLatestVersionNumber();
        let githubData = await this._GetGithubData();
        return `${githubData[0].name} (${versionNumber})`;
    }

    async GetFileURL(asset_number: number) : Promise<string>{
        return new Promise((resolve, reject) => {
            //Try to get the download url for the release asset.
            this._GetGithubData().then((data) => {
                let releaseAssets : Asset[] = data[0].assets;
                if(releaseAssets != null && releaseAssets != []){
                    let asset : Asset;
                    
                    if(this.data.hasOwnProperty("asset_index")) asset = releaseAssets[this.data[asset_number].asset_index];
                    else asset = releaseAssets[0];

                    if(asset != null){
                        resolve(asset.browser_download_url);
                    }

                    reject("This Github repositorys latest release was missing a usable asset.");
                }
                else reject("This Github repository has no releases avaliable.");
             }).catch(reject);
        });
    }

    _GetGitHubReleaseData(){
        return new Promise((resolve, reject) => {
            //Construct initial request url to github api
            //Use the first one
            let url = github_api_url + `repos/${this.data[0].owner}/${this.data[0].name}/releases`;
            var options = {
                headers: {
                  'User-Agent': 'creators-tf-launcher'
                }
            };

            var data = [], dataLen = 0;

            let req = https.get(url, options, res => {
            console.log(`statusCode: ${res.statusCode}`);
                res.on('data', d => {
                    if(res.statusCode != 200){
                        reject(`Failed accessing ${url}: ` + res.statusCode);
                        return;
                    }
                    
                    data.push(d);
                });

                res.on("end", function () {
                    var buf = Buffer.concat(data);
                    let parsed = JSON.parse(buf.toString());
                    resolve(parsed);
                });
            });

            req.on('error', error => {
                reject(error.toString());
            });
            
            req.end();
        });
    }
}

export default GithubCollectionSource;