const { ipcRenderer } = require("electron");

const log = require("electron-log");
log.transports.console.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.format = "[{d}-{m}-{y}] [{h}:{i}:{s}T{z}] -- [{processType}] -- [{level}] -- {text}";
log.transports.file.fileName = "preloadsettingspage.log";
log.transports.file.maxSize = 10485760;
log.transports.file.getFile();

window.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send("GetCurrentVersion", "");

    var cfg_debug = document.getElementById("config-debug");
    var btn_showCfg = document.getElementById("config-show-button");
    var btn_showCfgClose = document.getElementById("config-dontshow-button");
    var btn_copyCfgContents = document.getElementById("config-copycontents-button");
    var btn_openConfigLoc = document.getElementById("open-config-location");
    var btn_openLogLoc = document.getElementById("open-log-location");
    var btn_reload = document.getElementById("reload-button");
    var btn_clearmodlist = document.getElementById("config-clearmodlist");
    
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
        const steamdir = document.getElementById("steam_directory").value;
        ipcRenderer.send("config-reload-tf2directory", steamdir);
    };

    btn_clearmodlist.onclick = () => {
        ipcRenderer.send("ClearModList", "");
    };
});

ipcRenderer.on("GetConfig-Reply", (event, config_arg) => {
    log.info("Populating settings values");
    document.getElementById("tf2_directory").value = config_arg.tf2_directory;
    document.getElementById("steam_directory").value = config_arg.steam_directory;
    document.getElementById("config-contents").value = JSON.stringify(config_arg);
});

ipcRenderer.on("GetNewSettings", (event, arg) => {
    log.info("GetNewSettings event recieved. Sending data back");
    arg.tf2_directory = document.getElementById("tf2_directory").value;
    arg.steam_directory = document.getElementById("steam_directory").value;
    ipcRenderer.send("GetNewSettings-Reply", arg);
});

ipcRenderer.on("GetCurrentVersion-Reply", async (event, version) => {
    document.getElementById("version-box").innerHTML = `<p>Launcher Version: ${version}</p>`;
});

function copyCfgContentsToClipboard() {
    var cfgContents = document.getElementById("config-contents");
    cfgContents.select();
    document.execCommand("copy");
}
