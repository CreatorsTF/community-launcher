const { ipcRenderer, shell, win } = require("electron");

const log = require("electron-log");
log.transports.console.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.fileName = "preloadsettingspage.log";
log.transports.file.maxSize = 10485760;
log.transports.file.getFile();
log.silly("Testing log - PRELOAD OF SETTINGS PAGE");

const arrowDownHTML = ' <i class="mdi mdi-arrow-down-drop-circle"></i>';
const arrowRightHTML = ' <i class="mdi mdi-arrow-right-drop-circle"></i>';
const mapThumb = 'https://creators.tf/api/mapthumb?map=';

var container;
var hasCreatedPageContent = false;
var refreshButton;
var refreshing = false;
const regionDOMData = new Map();
//Simple way to make server names look better for now.
//Country flags are appended automatically to each new region name, so
//the shortnames !!!MUST BE!!! the ISO 3166-1-alpha-2 country's code
//They can be found here: https://www.iso.org/obp/ui/
var serverNames = new Map();
serverNames.set("eu", "Europe");
serverNames.set("us", "North America");
serverNames.set("ru", "Russia");
serverNames.set("au", "Australia");
serverNames.set("sg", "Singapore");

class ServerDOMData {
    _region = "";
    _id = "";

    id = null;
    hostname = null;
    map = null;
    mapPic = null;
    players = null;
    hearbeat = null;
    status = null;
    tr = null;
    button = null;
    lock = null;
}


window.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send("GetServerList", "");
    container = document.getElementById("server-container");

    refreshButton = document.getElementById("refreshButton");

    refreshButton.addEventListener("click", Refresh);
});

ipcRenderer.on("GetServerList-Reply", (event, serverListData) => {
    refreshing = false;
    if (serverListData != null && serverListData.result == "SUCCESS") {
        var servers = serverListData.servers;

        var serverRegionMap = SortServersIntoRegions(servers);

        //Create DOM elements for the servers if not created already.
        if(!hasCreatedPageContent) {
            CreateServerDOMElements(serverRegionMap);
        }
        
        //Update server DOM elements with the recieved information.
        for (const region of serverRegionMap) {
            var regionName = region[0].toLowerCase();
            if(!regionDOMData.has(regionName)){
                continue;
            }

            var regionDOMs = regionDOMData.get(regionName);

            for (let server of region[1]) {
                var serverDOMData = regionDOMs.get(parseInt(server.id));

                serverDOMData.id.innerHTML = `<p>${server.id}</p>`;
                serverDOMData.hostname.innerHTML = `<p>${server.hostname}</p>`;
                serverDOMData.map.innerHTML = `<p>${server.map}</p>`;
                serverDOMData.mapPic.style.backgroundImage = "url(" + mapThumb + `${server.map}` + ")";
                serverDOMData.players.innerHTML = `<p>${server.online}/${server.maxplayers}</p>`;
                serverDOMData.hearbeat.innerText = `${server.since_heartbeat}` + "s ago";

                if (server.is_down === false) {
                    serverDOMData.status.className = "mdi mdi-check-circle link-mini up";
                    serverDOMData.status.title = "Server is up!"
                    serverDOMData.tr.style.backgroundColor = null;
                } else {
                    serverDOMData.status.className = "mdi mdi-alert-circle link-mini down";
                    serverDOMData.status.title = "Server is down!"
                    serverDOMData.tr.style.backgroundColor = "#6B0F0F";
                }

                if (server.passworded === true) {
                    serverDOMData.button.innerText = `Connect (${server.online}/${server.maxplayers}) `;
                    if(serverDOMData.lock == null){
                        serverDOMData.lock = document.createElement("i");
                        serverDOMData.lock.className = "mdi mdi-lock link-mini";
                        serverDOMData.lock.title = "This server requires a password to join";
                    }

                    serverDOMData.lock.style.display = "inline";
                    serverDOMData.button.appendChild(serverDOMData.lock);
                }
                else{
                    if(serverDOMData.lock != null){
                        serverDOMData.lock.style.display = "none";
                    }

                    serverDOMData.button.innerText = "Connect";
                }
            }
        }
    }
    else {
        // remove everything but error message
        refreshHolder.remove();
        container.remove();
        loading.remove();
        document.getElementById("failMessage").innerText = "Failed to get servers.\n\nYour internet may be down\nOR\nCreators.TF may be down\n\nGo to our Twitter (@CreatorsTF) for more info!";
    }
});

function CreateServerDOMElements(serverRegionMap){
    loading.remove();
    failMessage.remove();
    //First time getting server info, create the page layout!
    for (const region of serverRegionMap) {
        var heading = document.createElement("span");
        var headingFlag = document.createElement("i");

        container.appendChild(heading);
        heading.className = "serverRegions";
        var regionName = region[0].toLowerCase();
        if (serverNames.has(regionName)) {
            heading.innerText = serverNames.get(regionName);
            headingFlag.className = "flag-icon flag-icon-" + regionName;
        }
        else {
            heading.innerText = regionName.toUpperCase();
        }
        heading.appendChild(headingFlag);
        heading.innerHTML += arrowDownHTML;

        var regionDOMDatas = new Map();
        regionDOMData.set(regionName, regionDOMDatas);

        var table = document.createElement("table");
        SetEventListener(heading, table);
        table.id = "serverlist-" + region[0];
        container.appendChild(table);

        for (let server of region[1]) {
            var domData = new ServerDOMData();
            domData._id = parseInt(server.id);
            domData._region = regionName;
            regionDOMDatas.set(domData._id, domData);

            let tr = document.createElement("tr");
            domData.tr = tr;

            let id = document.createElement("td");
            domData.id = id;
            id.className = "id";
            tr.appendChild(id);

            let hostname = document.createElement("td");
            domData.hostname = hostname;
            hostname.className = "name";
            tr.appendChild(hostname);

            let map = document.createElement("td");
            domData.map = map;
            map.className = "map";
            tr.appendChild(map);

            let mapPic = document.createElement("div");
            domData.mapPic = mapPic;
            mapPic.className = "mapCover";
            map.appendChild(mapPic);

            let playerCount = document.createElement("td");
            domData.players = playerCount;
            playerCount.className = "players";
            tr.appendChild(playerCount);

            let connectButtonHolder = document.createElement("td");
            connectButtonHolder.className = "connect";
            let button = document.createElement("button");
            domData.button = button;
            tr.appendChild(connectButtonHolder);
            connectButtonHolder.appendChild(button);
            button.innerText = "Connect";

            let hbHolder = document.createElement("td");
            hbHolder.className = "hb";
            let hb = document.createElement("p");
            domData.hearbeat = hb;
            hbHolder.title = "This is the amount of time that has passed since the last server status check. Typically, the time should not exceed 30 seconds. If it exceeds, it means the server is probably experiencing connection problems.";
            tr.appendChild(hbHolder);
            hbHolder.appendChild(hb);

            let statusHolder = document.createElement("td");
            statusHolder.className = "status";
            let status = document.createElement("i");
            domData.status = status;
            status.className = "mdi mdi-sync-circle link-mini blue";
            tr.appendChild(statusHolder);
            statusHolder.appendChild(status);

            SetButtonEventListener(button, server.ip, server.port);
            table.appendChild(tr);
        }
        table.style.display = "none";
    }

    hasCreatedPageContent = true;
}

function HeadingClicked(event, table) {
    // lol??
    table.style.display = table.style.display == "table" ? "none" : "table";
}

function SetEventListener(heading, table) {
    heading.addEventListener("click", (e) => { HeadingClicked(e, table); });
}

function SetButtonEventListener(button, ip, port) {
    var serverURL = GetServerURL(ip, port);
    button.addEventListener("click", (e) => { ConnectToServer(serverURL); });
}

function ConnectToServer(server) {
    shell.openExternal(server);
}

function GetServerURL(ip, port) {
    return `steam://connect/${ip}:${port}`;
}

function Refresh(e){
    if(!refreshing){
        ipcRenderer.send("GetServerList", "");
        refreshing = true;
    }
}

function SortServersIntoRegions(serverData){
    var resultMap = new Map();
    for (let server of serverData) {
        var regionArray;
        if (!resultMap.has(server.region)) {
            //Add this region to the map.
            regionArray = [];
            resultMap.set(server.region, regionArray);
        }
        else {
            regionArray = resultMap.get(server.region);
        }
        regionArray.push(server);
    }

    return resultMap;
}