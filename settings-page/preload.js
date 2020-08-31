const { ipcRenderer } = require("electron");

const log = require("electron-log");
log.transports.console.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.fileName = "preloadsettingspage.log";
log.transports.file.maxSize = 10485760;
log.transports.file.getFile();
log.silly("Testing log - PRELOAD OF SETTINGS PAGE");

window.addEventListener("DOMContentLoaded", () => {
    const cfg_debug = document.getElementById("config-debug");
    const btn_showCfg = document.getElementById("config-show-button");
    const btn_showCfgClose = document.getElementById("config-dontshow-button");
    const btn_openconfigloc = document.getElementById("open-config-location");

    log.info("Asking for config");
    ipcRenderer.send("GetConfig", "");

    btn_showCfg.onclick = () => {
        cfg_debug.style.display = "block";
    }
    btn_showCfgClose.onclick = () => {
        cfg_debug.style.display = "none";
    }
    btn_openconfigloc.onclick = () => {
        ipcRenderer.send("open-config-location", "");
    };
});

ipcRenderer.on("GetConfig-Reply", (_, config_arg) => {
    log.info("Populating settings values");
    document.getElementById("tf2_directory").value = config_arg.tf2_directory;
    document.getElementById("steam_directory").value = config_arg.steam_directory;
    document.getElementById("config-contents").innerText = JSON.stringify(config_arg);
});

ipcRenderer.on("GetNewSettings", (_, arg) => {
    log.info("GetNewSettings event recieved. Sending data back");
    arg.tf2_directory = document.getElementById("tf2_directory").value;
    arg.steam_directory = document.getElementById("steam_directory").value;
    ipcRenderer.send("GetNewSettings-Reply", arg);
});
