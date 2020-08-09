var sidebar;
const fs = require("fs");
const path = require("path");
const moddata = JSON.parse(fs.readFileSync(path.resolve(__dirname, "internal", "mods.json")));
const { ipcRenderer } = require("electron");

global.log = require("electron-log");
global.log.transports.console.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
global.log.transports.file.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
global.log.transports.file.fileName = "renderer.log";
global.log.transports.file.maxSize = 10485760; //why 10mb? idk.
global.log.transports.file.getFile();
global.log.silly("Testing log - PRELOAD OF MAIN WINDOW");

window.addEventListener("DOMContentLoaded", () => {
    sidebar = document.getElementById("sidebar");

    moddata.mods.forEach(modentry => {
        let div = document.createElement("div");
        div.className = "entry";
        sidebar.appendChild(div);

        let image = document.createElement("img");
        image.src = modentry.icon;
        div.appendChild(image);

        let divModInfoSidebar = document.createElement("div");
        divModInfoSidebar.className = "modInfoSidebar";
        div.appendChild(divModInfoSidebar);

        let title = document.createElement("h2");
        title.innerText = modentry.name;
        divModInfoSidebar.appendChild(title);

        let blurb = document.createElement("p");
        blurb.innerText = modentry.blurb;
        divModInfoSidebar.appendChild(blurb);

        div.addEventListener("click", function(e){OnClick_Mod(modentry)}, false);
    });
});
