const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let serverlistWindow;
const apiEndpoint = "https://creators.tf/api/IServers/GServerList?provider=15";

module.exports.OpenWindow = OpenWindow;
function OpenWindow() {
    global.log.info("Loading Server List window...");
    serverlistWindow = new BrowserWindow({
        parent: global.mainWindow,
        webPreferences: {
            preload: path.join(__dirname, "serverpage-preload.js"),
            nodeIntegration: false,
        },
        modal: true,
        show: false,
        center: true,
        darkTheme: true,
        maximizable: true,
        resizable: true,
        autoHideMenuBar: true,
        minWidth: 850,
        minHeight: 550,
        width: 950,
        height: 700,
    });
    serverlistWindow.removeMenu();
    serverlistWindow.loadFile(path.join(__dirname, "serverlist.html"));
    serverlistWindow.once("ready-to-show", () => {
        serverlistWindow.show();
    });
}

ipcMain.on("GetServerList", async (event) => {
    try {
        event.reply("GetServerList-Reply", await GetServerList());
    } catch (error) {
        event.reply("GetServerList-Reply", null);
    }
});

async function GetServerList() {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                "User-Agent": "creators-tf-launcher",
            },
        };

        const data = [];

        let req = https.get(apiEndpoint, options, (res) => {
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
                const parsed = JSON.parse(buf.toString());
                resolve(parsed);
            });
        });
        req.on("error", (error) => {
            reject(error.toString());
        });
        req.end();
    });
}
