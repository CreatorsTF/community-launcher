const { ipcRenderer, shell } = require("electron");

const log = require("electron-log");
log.transports.console.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.fileName = "preloadsettingspage.log";
log.transports.file.maxSize = 10485760;
log.transports.file.getFile();
log.silly("Testing log - PRELOAD OF SETTINGS PAGE");

const arrowHTML = ' <i class="mdi mdi-arrow-down-drop-circle"></i>';
const mapThumb = 'https://creators.tf/api/mapthumb?map=';

var container;
//Simple way to make server names look better for now.
var serverNames = new Map();
serverNames.set("eu", "Europe");
serverNames.set("us", "North America");
serverNames.set("ru", "Russia");
serverNames.set("au", "Australia");
serverNames.set("sg", "Singapore");

window.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send("GetServerList", "");
    container = document.getElementById("server-container");
});

ipcRenderer.on("GetServerList-Reply", (event, serverListData) => {
    if (serverListData.result == "SUCCESS") {
        var servers = serverListData.servers;
        loading.remove();
        failMessage.remove();

        //Remove the old server list if its there.
        //let oldServerList = document.getElementById("serverlist");
        //if(oldServerList != null) oldServerList.parentElement.removeChild(oldServerList);

        var serverRegionMap = new Map();
        for (let server of servers) {
            var regionArray;
            if (!serverRegionMap.has(server.region)) {
                //Add this region to the map.
                regionArray = [];
                serverRegionMap.set(server.region, regionArray);
            }
            else {
                regionArray = serverRegionMap.get(server.region);
            }
            regionArray.push(server);
        }

        for (const region of serverRegionMap) {
            var heading = document.createElement("h2");
            var headingFlag = document.createElement("span");

            container.appendChild(heading);
            var regionName = region[0].toLowerCase();
            if (serverNames.has(regionName)) {
                heading.innerText = serverNames.get(regionName);
                headingFlag.className = "flag-icon flag-icon-" + regionName;
            }
            else {
                heading.innerText = regionName.toUpperCase();
            }
            heading.appendChild(headingFlag);
            heading.innerHTML += arrowHTML;

            var table = document.createElement("table");
            SetEventListner(heading, table);
            table.id = "serverlist-" + region[0];
            container.appendChild(table);

            for (let server of region[1]) {
                let tr = document.createElement("tr");

                let id = document.createElement("td");
                id.innerHTML = `<p>${server.id}</p>`;
                id.className = "id";
                tr.appendChild(id);

                let hostname = document.createElement("td");
                hostname.innerHTML = `<p>${server.hostname}</p>`;
                hostname.className = "name";
                tr.appendChild(hostname);

                let map = document.createElement("td");
                map.innerHTML = `<p>${server.map}</p>`;
                map.className = "map";
                tr.appendChild(map);

                let connectButtonHolder = document.createElement("td");
                connectButtonHolder.className = "connect";
                let button = document.createElement("button");
                tr.appendChild(connectButtonHolder);
                connectButtonHolder.appendChild(button);
                button.innerText = `Connect (${server.online}/${server.maxplayers})`;

                let hbHolder = document.createElement("td");
                hbHolder.className = "hb";
                let hb = document.createElement("p");
                hb.innerText = `${server.since_heartbeat}`;
                tr.appendChild(hbHolder);
                hbHolder.appendChild(hb);

                let statusHolder = document.createElement("td");
                statusHolder.className = "status";
                let status = document.createElement("i");
                status.className = "mdi mdi-sync-circle link-mini blue";
                tr.appendChild(statusHolder);
                statusHolder.appendChild(status);
                if (server.is_down === false) {
                    status.className = "mdi mdi-check-circle link-mini up";
                    status.title = "Server is up!"
                } else {
                    status.className = "mdi mdi-alert-circle link-mini down";
                    status.title = "Server is down!"
                }

                if (server.passworded === true) {
                    button.innerText = `Connect (${server.online}/${server.maxplayers}) `;
                    let lock = document.createElement("i");
                    lock.className = "mdi mdi-lock link-mini";
                    lock.title = "This server requires a password to join";
                    button.appendChild(lock);
                }
                SetButtonEventListner(button, server.ip, server.port);
                table.appendChild(tr);
            }
            table.style.display = "none";
        }
    }
    else {
        loading.remove();
        document.getElementById("failMessage").innerText = "Failed to get servers\nYour internet may be down\nOR\nCreators.TF may be down";
    }
});

function HeadingClicked(event, table) {
    table.style.display = table.style.display == "table" ? "none" : "table";
}

function SetEventListner(heading, table) {
    heading.addEventListener("click", (e) => { HeadingClicked(e, table); });
}

function SetButtonEventListner(button, ip, port){
    var serverURL = GetServerURL(ip, port);
    button.addEventListener("click", (e) => { ConnectToServer(serverURL); });
}

function ConnectToServer(server) {
    shell.openExternal(server);
}

function GetServerURL(ip, port) {
    return `steam://connect/${ip}:${port}`;
}
