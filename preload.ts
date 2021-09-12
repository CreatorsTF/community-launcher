import fs from "fs";
import path from "path";
import { ipcRenderer } from "electron";
import log from "electron-log";

declare global {
    interface Window {
        ipcRenderer?: typeof ipcRenderer;
        log?: typeof log;
        OnClick_Mod?: (any) => void;
    }
}
window.ipcRenderer = ipcRenderer;

log.transports.console.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.fileName = "renderer.log";
log.transports.file.maxSize = 10485760;
log.transports.file.getFile();
log.info("Main Window Preload Began.");

window.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send("GetModData", "");
    console.log("%cDON'T TYPE ANYTHING IN THIS CONSOLE UNLESS YOU KNOW WHAT YOU ARE DOING!", "background-color:black;border-radius:10px;padding:5px;color:red;font-family:Arial;font-size:25px;font-weight:bold;");
});

// Can't load this before initialization!
window.log = log;

ipcRenderer.on("ShowMods", (event, data) => {
    document.getElementById("modlist-updating").remove();

    const sidebar = document.getElementById("sidebar");

    data.mods.forEach((modentry) => {
        if (!modentry.hasOwnProperty("devOnly") || !modentry.devOnly || (modentry.devOnly && data.isDev)) {
            const div = document.createElement("div");
            div.className = "entry";
            sidebar.appendChild(div);

            const image = document.createElement("img");
            image.src = modentry.icon;
            div.appendChild(image);

            const divModInfoSidebar = document.createElement("div");
            divModInfoSidebar.className = "mod-info-sidebar";
            div.appendChild(divModInfoSidebar);

            const title = document.createElement("h2");
            title.innerText = modentry.name;
            divModInfoSidebar.appendChild(title);

            const blurb = document.createElement("p");
            blurb.innerText = modentry.blurb;
            divModInfoSidebar.appendChild(blurb);

            div.addEventListener("click", () => {
                window.OnClick_Mod(modentry);
            }, false);
        }
    });
    const updateButton_Fail = document.getElementById("update-button-fail");
    const launcherVersionBox = document.getElementById("launcher-version");
    const config: any = fs.readFileSync(path.join(__dirname, "package.json"));
    const currentClientVersion: number = JSON.parse(config).version;
    fetch("https://api.github.com/repos/CreatorsTF/Creators.TF-Community-Launcher/releases/latest").then((res) => {
        if (res.status === 200) {
            res.json().then((data) => {
                const version = data.tag_name;
                if (currentClientVersion === version) {
                    launcherVersionBox.remove();
                } else {
                    launcherVersionBox.innerText = "A new update is available for the launcher.";
                }
            });
        } else {
            updateButton_Fail.classList.remove("hidden");
            console.log("There was a problem! Status Code: " + res.status);
            return;
        }
    })
        .catch((err) => {
            console.log("Error!", err);
        });
});