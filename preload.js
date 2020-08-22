var sidebar;
const fs = require("fs");
const path = require("path");
const moddata = JSON.parse(fs.readFileSync(path.resolve(__dirname, "internal", "mods.json")));
const { ipcRenderer } = require("electron");

window.ipcRenderer = ipcRenderer;

window.log = require("electron-log");
window.log.transports.console.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
window.log.transports.file.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
window.log.transports.file.fileName = "renderer.log";
window.log.transports.file.maxSize = 10485760; //why 10mb? idk.
window.log.transports.file.getFile();
window.log.silly("Testing log - PRELOAD OF MAIN WINDOW");

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

    var launcherversionBox = document.getElementById("launcherversion");
    const config = require("./package.json");
    const currentClientVersion = config.version;
    let request = new XMLHttpRequest();
    request.open("GET", "https://api.github.com/repos/ampersoftware/Creators.TF-Community-Launcher/releases/latest");
    request.send();
    request.onload = () => {
        if (request.status === 200) {
            var answer = JSON.parse(request.response);
            var version = answer.name;
            if (currentClientVersion === version) {
                launcherversionBox.remove();
            } else {
                launcherversionBox.innerText = "A new update is available but it seems you don't have\nauto-update working.\nCheck the website to download the new version.";
            }
        } else {
            console.log("Status: " + `${request.status}` + "\nMessage: " + `${request.statusText}`);
        }
    }
});
