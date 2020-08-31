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
window.log.info("Main Window Preload Began.");

window.addEventListener("DOMContentLoaded", () => {
    sidebar = document.getElementById("sidebar");

    moddata.mods.forEach(modentry => {
        const div = document.createElement("div");
        div.className = "entry";
        sidebar.appendChild(div);

        const image = document.createElement("img");
        image.src = modentry.icon;
        div.appendChild(image);

        const divModInfoSidebar = document.createElement("div");
        divModInfoSidebar.className = "modInfoSidebar";
        div.appendChild(divModInfoSidebar);

        const title = document.createElement("h2");
        title.innerText = modentry.name;
        divModInfoSidebar.appendChild(title);

        const blurb = document.createElement("p");
        blurb.innerText = modentry.blurb;
        divModInfoSidebar.appendChild(blurb);

        div.addEventListener("click", (e) => OnClick_Mod(modentry), false);
    });

    const launcherversionBox = document.getElementById("launcherversion");
    const config = require("./package.json");
    const currentClientVersion = config.version;
    const request = new XMLHttpRequest();
    request.open("GET", "https://api.github.com/repos/ampersoftware/Creators.TF-Community-Launcher/releases/latest");
    request.send();
    request.onload = () => {
        if (request.status === 200) {
            const answer = JSON.parse(request.response);
            const version = answer.name;
            if (currentClientVersion === version) {
                launcherversionBox.remove();
            } else {
                launcherversionBox.innerText = "A new update is available for the launcher.\nCheck the website to download the new version.\nIf you are using the auto-updater version,\ndownload it automatically by clicking the yellow\nbutton!";
            }
        } else {
            launcherversionBox.innerText = "Can't check for updates.\nEither your internet or GitHub's API is down!";
        }
    }
});
