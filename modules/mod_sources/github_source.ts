import https from "https";
import ModInstallSource from "./mod_source_base";
import { Install } from "../mod_list_loader";

// Reference: https://developer.github.com/v3/repos/releases/#list-releases

const github_api_url = "https://api.github.com/";

export default class GithubSource extends ModInstallSource {
    protected github_data = null;
    fileType = "FILE";

    constructor(install_data: Install[]) {
        super(install_data);
    }

    //Function to get the latest github data from memory or request.
    async _GetGithubData(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.github_data != null) {
                resolve(this.github_data);
            } else {
                this._GetGitHubReleaseData().then(resolve).catch(reject);
            }
        });
    }

    async GetLatestVersionNumber(): Promise<number> {
        return new Promise((resolve, reject) => {
            this._GetGithubData().then((data) => {
                try {
                    if (data.length == null || data.length == 0) {
                        reject("No releases avaliable to download");
                    }
                    else {
                        const releaseID = data[0].id;
                        resolve(releaseID);
                    }
                }
                catch (error) {
                    reject("Failed to correctly parse the latest release publish ID. Cause: " + error.toString());
                }
            }).catch(reject);
        });
    }

    async GetDisplayVersionNumber(): Promise<string> {
        const githubData = await this._GetGithubData();
        return githubData[0].tag_name;
    }

    override async GetFileURL(asset_index?: number): Promise<string | string[]> {
        const githubData = await this._GetGithubData();
        const releaseAssets = githubData[0].assets;
        if (releaseAssets != null && releaseAssets != []) {
            return this.GetFileURLs(githubData, this.data[0].asset_index);
        }
        else {
            throw new Error("This Github repository has no releases avaliable.");
        }
    }

    protected GetFileURLs(githubData: JSON, asset_index: number | Array<number>): string | string[] {
        let asset;
        const releaseAssets = githubData[0].assets;
        if (releaseAssets != null && releaseAssets != []) {
            if (asset_index != null) {
                //Is asset_index an array?
                //If so get all the urls relating to the asset ids.
                if(Array.isArray(asset_index)) {
                    const urls = new Array<string>();
                    for(const index of asset_index) {
                        urls.push(releaseAssets[index].browser_download_url);
                    }
                    return urls;
                }
                else {
                    //Single asset id
                    asset = releaseAssets[asset_index];
                }
            }
            else {
                //Default to 0 if we have no asset id specified.
                asset = releaseAssets[0];
            }
            if(asset != null) {
                return asset.browser_download_url;
            }
        }
         
        throw new Error("This Github repository's latest release was missing an usable asset.");
    }

    private _GetGitHubReleaseData(): Promise<any> {
        return new Promise((resolve, reject) => {
            //Construct initial request url to github api
            const url = github_api_url + `repos/${this.data[0].owner}/${this.data[0].name}/releases`;
            const options = {
                headers: {
                    "User-Agent": "creators-tf-launcher"
                }
            };

            const data = [];

            const req = https.get(url, options, res => {
                console.log(`statusCode: ${res.statusCode}`);
                res.on("data", (d) => {
                    if (res.statusCode != 200) {
                        reject(`Failed accessing ${url}: ` + res.statusCode);
                        return;
                    }
                    data.push(d);
                });

                res.on("end", () => {
                    try {
                        const buf = Buffer.concat(data);
                        const parsed = JSON.parse(buf.toString());
                        resolve(parsed);
                    }
                    catch (error) {
                        reject("Failed to parse the GitHub release api response. Cause: " + error);
                    }
                });
            });

            req.on("error", (error) => {
                reject(error.toString());
            });

            req.end();
        });
    }
}
