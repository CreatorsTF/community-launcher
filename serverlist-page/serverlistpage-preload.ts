import { ipcRenderer, shell } from "electron";

const arrowDownHTML = ' <i class="mdi mdi-arrow-down-drop-circle"></i>';
const arrowRightHTML = ' <i class="mdi mdi-arrow-right-drop-circle"></i>';
const mapThumb = 'https://creators.tf/api/mapthumb?map=';
const creatorsServerListPage = "https://creators.tf/servers";

var hasCreatedPageContent = false;
var refreshing = false;
var serverCount = 0;
const regionDOMData = new Map();
const refreshTime = 10 * 1000;
const maxServersForCollapsingAll = 15;

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
serverNames.set("no", "Norway");
serverNames.set("br", "Brazil");
serverNames.set("de", "Germany");
serverNames.set("pl", "Poland");

//Remove certain characters from remote data.
function EscapeString(s: string) : string{
    const tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    return s.replace(/[&<>]/g, (tag) => {
        return tagsToReplace[tag] || tag;
    });
};

class ServerDOMData {
    _region = "";
    _id = 0;
    id = null;
    hostname = null;
    map = null;
    mapPic = null;
    players = null;
    heartbeat = null;
    status = null;
    tr = null;
    button = null;
    lock = null;
}

window.addEventListener("DOMContentLoaded", () => {
    const refreshButton = document.getElementById("refreshButton");
    const serverPageA = document.getElementById("serverpagea");

    let gotServerList = false;
    serverPageA.addEventListener("click", (ev) => {
        shell.openExternal(creatorsServerListPage);
    });

    if (!gotServerList) {
        ipcRenderer.send("GetServerList", "");
        gotServerList = true;
    }
    
    refreshButton.addEventListener("click", Refresh);
    //Set an initial automatic refresh.
    setTimeout(Refresh, refreshTime);
});

ipcRenderer.on("GetServerList-Reply", (event, serverListData) => {
    refreshing = false;
    try {
        if (serverListData != null && serverListData.result != null && serverListData.result == "SUCCESS") {
            var servers = serverListData.servers;
            serverCount = servers.length;
            var serverRegionMap = SortServersIntoRegions(servers);

            //Create DOM elements for the servers if not created already.
            if (!hasCreatedPageContent) {
                CreateServerDOMElements(serverRegionMap);
            }

            //Update server DOM elements with the recieved information.
            for (const region of serverRegionMap) {
                var regionName = region[0].toLowerCase();
                if (!regionDOMData.has(regionName)) {
                    continue;
                }

                var regionDOMs = regionDOMData.get(regionName);

                for (let server of region[1]) {
                    var serverDOMData = regionDOMs.get(parseInt(server.id));
                    //Skip a server that has a long time since its last heartbeat.
                    if (server.since_heartbeat > 60 * 60) {
                        serverDOMData.tr.style.display = "none";
                    }
                    else {
                        serverDOMData.tr.style.display = "table-row";
                    }
                    serverDOMData.id.innerHTML = `<p>${EscapeString(server.id.toString())}</p>`;
                    serverDOMData.hostname.innerHTML = `<p>${EscapeString(server.hostname.toString())}</p>`;
                    serverDOMData.map.innerHTML = server.passworded ? "<p>???</p>" : `<p>${EscapeString(server.map.toString())}</p>`;

                    // let mapPic = document.createElement("div");
                    // serverDOMData.map.appendChild(mapPic);
                    // mapPic.className = "mapCover";
                    // mapPic.style.backgroundImage = server.passworded ? "" : "url(" + mapThumb + `${server.map}` + ")";

                    serverDOMData.players.innerHTML = server.passworded ? "<p>??/??</p>" : `<p>${server.online}/${server.maxplayers}</p>`;
                    serverDOMData.heartbeat.innerText = `${server.since_heartbeat}` + "s ago";

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
                        serverDOMData.button.innerText = "Requires Password ";
                        if (serverDOMData.lock == null) {
                            serverDOMData.lock = document.createElement("i");
                            serverDOMData.lock.className = "mdi mdi-lock link-mini";
                            serverDOMData.lock.title = "This server requires a password to join";
                        }
                        serverDOMData.lock.style.display = "inline";
                        serverDOMData.button.appendChild(serverDOMData.lock);
                    } else {
                        if (serverDOMData.lock != null) {
                            serverDOMData.lock.style.display = "none";
                        }
                        serverDOMData.button.innerText = "Connect";
                    }
                }
            }
        }
        else if (serverListData == "503") {
            document.getElementById("loading").remove();
            document.getElementById("cloudflare-error").style.display = "flex";
        }
        else {
            ShowFailMessage();
        }
    }
    catch (e) {
        console.error(e.toString());
        ShowFailMessage();
    }
});

function ShowFailMessage() {
    document.getElementById("loading").remove();
    document.getElementById("fail-message").style.display = "block";
    console.error("Server list failed to show.");
}

function CreateServerDOMElements(serverRegionMap) {
    const container = document.getElementById("server-container");
    document.getElementById("loading").remove();
    document.getElementById("fail-message").remove();
    //First time getting server info, create the page layout!
    for (const region of serverRegionMap) {
        var heading = document.createElement("span");
        var headingFlag = document.createElement("i");
        var regionName = region[0].toLowerCase();

        container.appendChild(heading);
        heading.className = "serverRegions";

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
            let domData = new ServerDOMData();
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
            map.className = "map";
            tr.appendChild(map);
            domData.map = map;

            let mapPic = document.createElement("div");
            map.appendChild(mapPic);
            mapPic.className = "mapCover";
            mapPic.style.backgroundImage = "url(" + mapThumb + `${server.map}` + ")";

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
            domData.heartbeat = hb;
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

        if (serverCount > maxServersForCollapsingAll) {
            table.style.display = "none";
        }
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

function Refresh(e = null) {
    if (!refreshing) {
        ipcRenderer.send("GetServerList", "");
        refreshing = true;

        //Set new timeout to refresh.
        setTimeout(Refresh, refreshTime);
    }
}

function SortServersIntoRegions(serverData) {
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