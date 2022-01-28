import { BrowserWindow, ipcMain } from "electron";
import path from "path";
import stringformat from "string-format";
import isDev from "electron-is-dev";
import https from "https";
import log from "electron-log";

const apiEndpoint = "https://creators.tf/api/IServers/GServerList?provider={0}";
class ServerListPage {
    public static serverlistWindow: BrowserWindow;
    public static latestProviders: Array<number>

    public static OpenWindow(mainWindow: any, screenWidth: number, screenHeight: number, minWindowWidth: number, minWindowHeight: number, providers: Array<number>, icon: string) {
        log.info("Loading Server List window...");
        this.serverlistWindow = new BrowserWindow({
            parent: mainWindow,
            webPreferences: {
                preload: path.join(__dirname, "serverlistpage-preload.js"),
                nodeIntegration: false,
                contextIsolation: false
            },
            modal: true,
            show: false,
            center: true,
            darkTheme: true,
            maximizable: true,
            resizable: true,
            autoHideMenuBar: true,
            minWidth: minWindowWidth,
            minHeight: minWindowHeight,
            width: screenWidth-250,
            height: screenHeight-100,
            icon: icon
        });
        if (!isDev) {
            this.serverlistWindow.removeMenu();
        }
        this.latestProviders = providers;
        this.serverlistWindow.loadFile(path.join(__dirname, "..", "..", "serverlist-page", "serverlist.html"));
        this.serverlistWindow.once("ready-to-show", () => {
            this.serverlistWindow.show();
        });
    }

    public static async GetServerList(): Promise<any> {
        if (this.latestProviders == null) {
            log.error("Failed to get server list as provider ids were missing");
            throw new Error("No providers avaliable.");
        }

        const options = {
            headers: {
                "User-Agent": "creators-tf-launcher"
            }
        };

        const getProviderServerList = async (providerId: string): Promise<any> => {
            //Use a promise to ensure the inner request callback can return its value and ensure we await properly.
            return new Promise((resolve, reject) => {
                const data = [];
                const url = stringformat(apiEndpoint, providerId);
                const req = https.get(url, options, (res) => {
                    console.log(`statusCode: ${res.statusCode}`);
                    res.on("data", (d) => {
                        if (res.statusCode != 200) {
                            reject(res.statusCode.toString());
                            req.destroy();
                            return;
                        }
                        data.push(d);
                    });
                    res.on("end", () => {
                        res.destroy();
                        try {
                            const buf = Buffer.concat(data);
                            const parsed = JSON.parse(buf.toString());
                            resolve(parsed);
                        }
                        catch (e) {
                            log.error("Server List Parse error: " + e.toString());
                            reject();
                        }
                    });
                });
                req.on("error", (error) => {
                    reject(error.toString());
                    req.destroy();
                });
                req.end();
            });
        };

        let serverData = null;
        //Get server data for the given providers.
        for (const provider of this.latestProviders) {
            //Request server data for this specific provider id.
            //If it fails we just use what we have.
            const response = await getProviderServerList(provider.toString());
            if (response != null && response.result != null && response.result == "SUCCESS") {
                if (serverData == null) {
                    serverData = response;
                }
                else {
                    serverData = this.CombineServerData(serverData, response);
                }
            }
        }

        if (serverData == null) {
            log.error("Unable to get any server list data.");
        }

        return serverData;
    }

    /**
     * Combines the server data of these two objects together.
     * @param oldData Main object to add to.
     * @param newData Other obect to take the .servers property from.
     */
    private static CombineServerData(oldData: any, newData: any): any {
        if (oldData.hasOwnProperty("servers")) {
            oldData.servers = oldData.servers.concat(newData.servers);
            return oldData;
        }
        else {
            return oldData;
        }
    }
}

ipcMain.on("GetServerList", async (event) => {
    try {
        const serverList = await ServerListPage.GetServerList();
        event.reply("GetServerList-Reply", serverList);
    }
    catch (error) {
        event.reply("GetServerList-Reply", error.toString());
    }
});

export default ServerListPage;