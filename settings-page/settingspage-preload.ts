import { ipcRenderer } from "electron";
import log from "electron-log";
log.transports.console.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.fileName = "settingspage.log";
log.transports.file.maxSize = 10485760;
log.transports.file.getFile();

window.addEventListener("DOMContentLoaded", () => {
    const cfg_debug = document.getElementById("config-debug");
    const btn_showCfg = document.getElementById("config-show-button");
    const btn_showCfgClose = document.getElementById("config-dontshow-button");
    const btn_copyCfgContents = document.getElementById("config-copycontents-button");
    const btn_openConfigLoc = document.getElementById("open-config-location");
    const btn_openLogLoc = document.getElementById("open-log-location");
    const btn_reload = document.getElementById("reload-button");
    const btn_clearmodlist = document.getElementById("config-clearmodlist");
    
    ipcRenderer.send("GetCurrentVersion", "");

    log.info("Asking for config");
    ipcRenderer.send("GetConfig", "");
    
    btn_showCfg.onclick = () => {
        cfg_debug.style.display = "block";
    }
    btn_showCfgClose.onclick = () => {
        cfg_debug.style.display = "none";
    }
    btn_openConfigLoc.onclick = () => {
        ipcRenderer.send("open-config-location", "");
    };
    btn_openLogLoc.onclick = () => {
        ipcRenderer.send("open-log-location", "");
    };
    btn_copyCfgContents.onclick = () => {
        copyCfgContentsToClipboard();
    }
    btn_reload.onclick = () => {
        const steamdir = (<HTMLInputElement>document.getElementById("steam-directory")).value;
        ipcRenderer.send("config-reload-tf2directory", steamdir);
    };
    
    btn_clearmodlist.onclick = () => {
        ipcRenderer.send("ClearModList", "");
    };
});

ipcRenderer.on("GetConfig-Reply", (event, config_arg) => {
    log.info("Populating settings values");
    (<HTMLInputElement>document.getElementById("tf2-directory")).value = config_arg.tf2_directory;
    (<HTMLInputElement>document.getElementById("steam-directory")).value = config_arg.steam_directory;
    (<HTMLInputElement>document.getElementById("config-contents")).value = JSON.stringify(config_arg);
});

ipcRenderer.on("GetNewSettings", (event, arg) => {
    log.info("GetNewSettings event received. Sending data back");
    arg.tf2_directory = (<HTMLInputElement>document.getElementById("tf2-directory")).value;
    arg.steam_directory = (<HTMLInputElement>document.getElementById("steam-directory")).value;
    ipcRenderer.send("GetNewSettings-Reply", arg);
});

ipcRenderer.on("GetCurrentVersion-Reply", async (event, version) => {
    document.getElementById("version-box").innerHTML = `<p>Launcher Version: ${version}</p>`;
});

function copyCfgContentsToClipboard() {
    (<HTMLTextAreaElement>document.getElementById("config-contents")).select();
    document.execCommand("copy");
}