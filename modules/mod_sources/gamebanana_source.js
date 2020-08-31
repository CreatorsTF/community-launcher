"use strict";
const https = global.https;
const { ModInstallSource } = require("./mod_source_base.js");

//Regex to find the game banana download page url
const downloadPageURLRegex = /(")(https?:.+gamebanana.+\/download\/.+)(")/i;
//Regex to find dl link to the mod file on download page.
const downloadLinkRegex = /(")(https?:.+gamebanana.+\/dl\/.+)(")/i;

const fileDateRegex = /((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec) ((\d{1,2}) \d\d\d\d)).*\n(<wrapper title="Downloads">)/i;

//Ref page: https://gamebanana.com/skins/169236

const loadingTextStyle = {
    color: "ghostwhite",
};

//Manager class to get latest version number and file download url for a game banana mod.
//Page crawling and data extraction is used instead meaning all data is cached in seperate urls firstly and no internal promises return the data.
module.exports.GameBananaSource = class GameBananaSource extends ModInstallSource {
    //Url of the main mod page.
    mod_page_url = "";

    //Found mod download page that contains more data and  link to file.
    mod_download_page_url = "";

    //Found url to get mod download content. Not direct but special GET requiring handling of headers to decode name.
    download_url = "";

    latest_version = 0;

    datapresent = false;

    constructor(install_data) {
        super(install_data);
        this.mod_page_url = install_data.get_url;
    }

    GetModData() {
        return new Promise((resolve, reject) => {
            if (this.datapresent == false) {
                this.GetModPageData().then(resolve).catch(reject);
            } else resolve();
        });
    }

    GetLatestVersionNumber() {
        return new Promise((resolve, reject) => {
            this.GetModData()
                .then(() => {
                    resolve(this.latest_version);
                })
                .catch(reject);
        });
    }

    GetFileURL() {
        return new Promise((resolve, _) => {
            this.GetModData().then(() => {
                resolve(this.download_url);
            });
        });
    }

    //Get mod page data and store in local variables. No data is returned on promise due to fragmented nature of data.
    GetModPageData() {
        return new Promise((resolve, reject) => {
            GetWebPage(this.mod_page_url)
                .then((pageString) => {
                    const downloadPageUrlResult = pageString.match(
                        downloadPageURLRegex
                    );
                    if (
                        (downloadPageUrlResult != null) &
                        (downloadPageUrlResult.length > 0)
                    ) {
                        //Get capture group 1 to already remove the surrounding "s.
                        const capture1 = downloadPageUrlResult[2];
                        if (capture1 != null && capture1 != "") {
                            this.mod_download_page_url = capture1;
                            console.log(
                                "Game Banana: Found mod download page url: " +
                                    capture1
                            );

                            GetWebPage(this.mod_download_page_url).then(
                                (dlPageString) => {
                                    //Use regex to get the download url.
                                    const downloadURL = dlPageString.match(
                                        downloadLinkRegex
                                    );

                                    //Use another reg ex to locate the files release date to use as a version.
                                    const fileDate = dlPageString.match(
                                        fileDateRegex
                                    );
                                    this.latest_version = Date.parse(
                                        fileDate[1]
                                    );

                                    if (
                                        downloadURL != null &&
                                        downloadURL != ""
                                    ) {
                                        //Get capture group 1 as that is the download url.
                                        this.download_url = downloadURL[2];

                                        resolve();
                                    } else {
                                        reject(
                                            "Failed to find mod file url on download page."
                                        );
                                    }
                                }
                            );
                        } else {
                            reject("Regex capture 1 is null.");
                        }
                    } else {
                        reject("Regex failed to get any matches");
                    }

                    this.datapresent = true;
                })
                .catch(reject);
        });
    }
};

function GetWebPage(_url) {
    return new Promise((resolve, reject) => {
        const options = {
            //A real user agent from a browser to make us look like a normal client.
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:79.0) Gecko/20100101 Firefox/79.0",
            },
        };

        const data = [];
        const req = https.get(_url, options, (res) => {
            console.log(`statusCode: ${res.statusCode}`);
            res.on("data", (d) => {
                if (res.statusCode != 200) {
                    reject(`Failed accessing ${url}: ` + res.statusCode);
                    return;
                }

                data.push(d);
            });

            res.on("end", () => {
                const buf = Buffer.concat(data);
                const pageContentStr = buf.toString("utf-8");

                resolve(pageContentStr);
            });
        });

        req.on("error", (error) => {
            reject(error.toString());
        });

        req.end();
    });
}
