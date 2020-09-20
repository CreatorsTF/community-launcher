"use strict";
const https = global.https;
const { ModInstallSource } = require("./mod_source_base.js");

// Reference: https://developer.github.com/v3/repos/releases/#list-releases
// Test GET url: https://api.github.com/repos/agrastiOs/Ultimate-TF2-Visual-Fix-Pack/releases

const github_api_url = "https://api.github.com/";

module.exports.GithubSource = class GithubSource extends ModInstallSource {

    github_data = null;
    fileType = "FILE";

    //Function to get the latest github data from memory or request.
    _GetGithubData(){
        return new Promise((resolve, reject) => {
            if(this.github_data != null) resolve(this.github_data);
            else {
                this._GetGitHubReleaseData().then(resolve).catch(reject);
            }
        });
    }

    GetLatestVersionNumber(){
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

    GetFileURL() {
        return new Promise((resolve, reject) => {
            //Try to get the download url for the release asset.
            this._GetGithubData().then((data) => {
                let releaseAssets = data[0].assets;
                if(releaseAssets != null && releaseAssets != []){
                    let asset;
                    
                    if(this.data.hasOwnProperty("asset_index")) asset = releaseAssets[this.data.asset_index];
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
            let url = github_api_url + `repos/${this.data.owner}/${this.data.name}/releases`;
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

    SetSubmod(submodName){
        super.SetSubmod(submodName);

        this.github_data = null;
    }
}