import ModInstallSource from "./mod_source_base.js";
import https from "https";

// Reference: https://developer.github.com/v3/repos/releases/#list-releases

const githubApiUrl = "https://api.github.com/";

class GithubSource extends ModInstallSource {
    githubData = null;
    fileType = "FILE";

    constructor(install_data) {
        super(install_data);
    }

    async GetLatestVersionNumber(): Promise<number> {
        return new Promise((resolve, reject) => {
            this.GetGitHubData().then((data) => {
                if (data.length == null || data.length == 0) {
                    reject("No releases avaliable to download");
                }

                let date = data[0].published_at;
                date = date.split("T")[0];
                date = date.replace(/-/g, "");

                resolve(date);
            }).catch(reject);
        });
    }

    async GetDisplayVersionNumber(): Promise<string> {
        let versionNumber = await this.GetLatestVersionNumber();
        let githubData = await this.GetGitHubData();
        return `${githubData[0].name} (${versionNumber})`;
    }

    async GetFileURL(): Promise<string> {
        return new Promise((resolve, reject) => {
            //Try to get the download url for the release asset.
            this.GetGitHubData().then((data) => {
                let releaseAssets = data[0].assets;
                if (releaseAssets != null && releaseAssets != []) {
                    let asset;

                    if (this.data.hasOwnProperty("asset_index")) asset = releaseAssets[this.data.asset_index];
                    else asset = releaseAssets[0];

                    if (asset != null) {
                        resolve(asset.browser_download_url);
                    }

                    reject("This Github repositorys latest release was missing a usable asset.");
                }
                else reject("This Github repository has no releases avaliable.");
            }).catch(reject);
        });
    }

    //Function to get the latest github data from memory or request.
    private async GetGitHubData(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.githubData != null) {
                resolve(this.githubData);
            }
            else {
                this.GetGitHubReleaseData()
                    .then(resolve)
                    .catch(reject);
            }
        });
    }

    private GetGitHubReleaseData() {
        return new Promise((resolve, reject) => {
            //Construct initial request url to github api
            let releaseUrl = `${githubApiUrl}repos/${this.data.owner}/${this.data.name}/releases`;
            var options = {
                headers: {
                    'User-Agent': 'creators-tf-launcher'
                }
            };

            var data = [];

            let req = https.get(releaseUrl, options, res => {
                console.log(`statusCode: ${res.statusCode}`);
                res.on('data', d => {
                    if (res.statusCode != 200) {
                        reject(`Failed accessing ${releaseUrl}: ` + res.statusCode);
                        return;
                    }

                    data.push(d);
                });

                res.on("end", function () {
                    var buffer = Buffer.concat(data);
                    let parsed = JSON.parse(buffer.toString());
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
export default GithubSource;