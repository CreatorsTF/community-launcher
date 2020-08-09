const { ipcRenderer } = require("electron");

const log = require("electron-log");
log.transports.console.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.fileName = "preloadsettingspage.log";
log.transports.file.maxSize = 10485760;
log.transports.file.getFile();
log.silly("Testing log - PRELOAD OF SETTINGS PAGE");

var container;

window.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send("GetServerList", "");
    container = document.getElementById("server-container");
});

ipcRenderer.on("GetServerList-Reply", (event, serverListData) => {
    if(serverListData.result == "SUCCESS"){
        var servers = serverListData.servers;

        //Remove the old server list if its there.
        //let oldServerList = document.getElementById("serverlist");
        //if(oldServerList != null) oldServerList.parentElement.removeChild(oldServerList);

        var serverRegionMap = new Map();
        for (let server of servers){
            var regionArray;
            if(!serverRegionMap.has(server.region)){
                //Add this region to the map.
                regionArray = [];
                serverRegionMap.set(server.region, regionArray);
            }
            else{
                regionArray = serverRegionMap.get(server.region);
            }

            regionArray.push(server);
        }

        for (const region of serverRegionMap) {
            var heading = document.createElement("h2");
            
            container.appendChild(heading);
            heading.innerText = region[0];

            var table = document.createElement("table");
            SetEventListner(heading, table);
            table.id = "serverlist-" + region[0];
            container.appendChild(table);

            for (let server of region[1]){
                let tr = document.createElement("tr");

                let id = document.createElement("td");
                id.innerHTML = `<p>${server.id}</p>`;
                tr.appendChild(id);

                let hostname = document.createElement("td");
                hostname.innerHTML = `<p>${server.hostname}</p>`;
                tr.appendChild(hostname);

                let map = document.createElement("td");
                map.innerHTML = `<p>${server.map}</p>`;
                tr.appendChild(map);

                table.appendChild(tr);
            }

            table.style.display = "none";
        }
    }
    else{
        document.getElementById("server-container").innerText = "Failed to get servers";
    }
});

function HeadingClicked(event, table){
    table.style.display = table.style.display == "block" ? "none" : "block";
}

function SetEventListner(heading, table){
    heading.addEventListener("click", (e) => { HeadingClicked(e, table); });
}