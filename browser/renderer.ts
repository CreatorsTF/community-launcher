import type { IpcRenderer } from "electron";
import type {ConfigFileModVersion} from "../modules/config";
import type {ElectronLog} from "electron-log";

declare global {
    interface Window {
        ipcRenderer?: typeof ipcRenderer;
        log?: ElectronLog;
        OnClick_Mod?: (any) => void;
    }
}

const ipcRenderer = <IpcRenderer>window.ipcRenderer;
const log = <ElectronLog>window.log;

const content = document.getElementById("content");
const contentDummy = document.getElementById("content-dummy");
const titleImage = document.getElementById("title-image") as HTMLImageElement;
const text = document.getElementById("content-text");
const modVersion = document.getElementById("mod-version");
const modVersionText = document.getElementById("mod-version-text");
const configPresetText = document.getElementById("config-preset-text");

const updateButton_Download = document.getElementById("update-button-download") as HTMLButtonElement;
const updateButton_Downloading = document.getElementById("update-button-downloading") as HTMLButtonElement;
const updateButton_Update = document.getElementById("update-button-update") as HTMLButtonElement;
const updateButton_Updated = document.getElementById("update-button-updated") as HTMLButtonElement;
const updateButton_Fail = document.getElementById("update-button-fail") as HTMLButtonElement;

const website = document.getElementById("socialMediaWebsite") as HTMLButtonElement;
const github = document.getElementById("socialMediaGithub") as HTMLButtonElement;
const twitter = document.getElementById("socialMediaTwitter") as HTMLButtonElement;
const discord = document.getElementById("socialMediaDiscord") as HTMLButtonElement;
const instagram = document.getElementById("socialMediaInstagram") as HTMLButtonElement;
const titleHeader = document.getElementById("title-header");
const collectionMenu = document.getElementById("collection-menu");
const collectionSelect = document.getElementById("collection-versions") as HTMLButtonElement;

const installButton = document.getElementById("install-play-button") as HTMLButtonElement;
const removeButton = document.getElementById("remove-mod") as HTMLButtonElement;
const settingsButton = document.getElementById("settings-button") as HTMLButtonElement;
const patchnotesButton = document.getElementById("patchnotes-button") as HTMLButtonElement;
const serverListButton = document.getElementById("server-list") as HTMLButtonElement;

let hasClickedInstallButton = false;

website.onclick = () => { ipcRenderer.send("Visit-Mod-Social", "website"); };
github.onclick = () => { ipcRenderer.send("Visit-Mod-Social", "github"); };
twitter.onclick = () => { ipcRenderer.send("Visit-Mod-Social", "twitter"); };
instagram.onclick = () => { ipcRenderer.send("Visit-Mod-Social", "instagram"); };
discord.onclick = () => { ipcRenderer.send("Visit-Mod-Social", "discord"); };

document.onload = () => {
    installButton.disabled = true;
};

const defaultBackgroundImage = "images/backgrounds/servers.jpg";

window.OnClick_Mod = (data) => {
    if (hasClickedInstallButton) {
        return;
    }

    log.info("Mod entry clicked: " + data.name);

    let bgImg: string;

    if (data.backgroundimage != "") {
        bgImg = data.backgroundimage;
    } else {
        bgImg = defaultBackgroundImage;
    }

    if (bgImg.includes("https")) {
        content.style.backgroundImage = `url("${bgImg}")`;
    } else {
        content.style.backgroundImage = `url("${"./" + bgImg}")`;
    }

    if (data.titleimage == "") {
        titleHeader.innerText = data.name;
        titleHeader.style.display = "block";
        titleImage.style.display = "none";
    } else {
        titleImage.src = data.titleimage;
        titleImage.style.display = "block";
        titleHeader.style.display = "none";
    }

    text.innerText = data.contenttext;
    content.style.borderColor = data.bordercolor;
    content.style.backgroundPositionX = data.backgroundposX;
    content.style.backgroundPositionY = data.backgroundposY;
    content.style.backgroundBlendMode = data.backgroundBlendMode;

    contentDummy.remove();
    content.style.display = "flex";

    installButton.style.background = "";
    installButton.style.backgroundColor = "grey";
    installButton.style.color = "#EEE";
    installButton.innerText = "LOADING...";
    installButton.disabled = true;

    website.style.display = data.website != "" ? "block" : "none";
    github.style.display = data.github != "" ? "block" : "none";
    twitter.style.display = data.twitter != "" ? "block" : "none";
    instagram.style.display = data.instagram != "" ? "block" : "none";
    discord.style.display = data.discord != "" ? "block" : "none";
    serverListButton.style.display = data.serverlistproviders != "" ? "block" : "none";

    //Get the current state of this mod to set the name of the button correctly.
    //To do that, we tell the main process to set the current mod and set that up.
    ipcRenderer.send("SetCurrentMod", data.name);
    ipcRenderer.send("GetCurrentModVersion", "");
    collectionSelect.disabled = true;
    
    if (data.install.type == "githubcollection" || data.install.type == "jsonlistcollection") {
        //Do stuff for collections
        if (data.items != "") {
            collectionMenu.style.display = "block";
        } else {
            collectionMenu.style.display = "none";
        }

        //Clear the select
        collectionSelect.innerHTML = "";
        //Populate the select
        data.items.forEach((element) => {
            const opt = document.createElement("option");
            opt.value = element.itemname;
            opt.innerHTML = element.displayname;
            collectionSelect.appendChild(opt);
            if (element.default == true) {
                opt.selected = true;
            }
        });
    } else {
        collectionMenu.style.display = "none";
    }
    hasClickedInstallButton = true;
};

updateButton_Download.onclick = (downloadUpdate) => {
    ipcRenderer.send("download_update");
    log.info("User chose to download the update. Downloading it." + downloadUpdate);
};

updateButton_Update.onclick = (closeProgramAndUpdate) => {
    ipcRenderer.send("restart_app");
    log.info("User chose to restart the launcher to update." + closeProgramAndUpdate);
};

ipcRenderer.on("update_not_available", () => {
    ipcRenderer.removeAllListeners("update_not_available");
    updateButton_Updated.classList.remove("hidden");
    log.info("No update available... Sad!");
});

ipcRenderer.on("update_available", () => {
    ipcRenderer.removeAllListeners("update_available");
    updateButton_Updated.remove();
    updateButton_Download.classList.remove("hidden");
    log.info("An update is available. Waiting for user's input to actually download it.");
});

ipcRenderer.on("update_downloading", () => {
    ipcRenderer.removeAllListeners("update_downloading");
    updateButton_Download.remove();
    updateButton_Downloading.classList.remove("hidden");
    log.info("Downloading update...");
});

ipcRenderer.on("update_downloaded", () => {
    ipcRenderer.removeAllListeners("update_downloaded");
    updateButton_Downloading.remove();
    updateButton_Update.classList.remove("hidden");
    log.info("The update was downloaded and will be installed on restart. Waiting for user's input.");
});

ipcRenderer.on("update_error", () => {
    ipcRenderer.removeAllListeners("update_error");
    updateButton_Fail.classList.remove("hidden");
    log.info("An error occurred while trying to get update info");
});

settingsButton.addEventListener("click", () => {
    ipcRenderer.send("SettingsWindow", "");
});
patchnotesButton.addEventListener("click", () => {
    ipcRenderer.send("PatchNotesWindow", "");
});
serverListButton.addEventListener("click", () => {
    ipcRenderer.send("ServerListWindow", "");
});

installButton.addEventListener("click", () => {
    //Do NOT use e
    installButton.innerText = "STARTING...";
    installButton.disabled = true;
    ipcRenderer.send("install-play-click", collectionSelect.value);
    ipcRenderer.send("Open-External-Game", "gameId");
});

// Disabling stuff based on if the mod is installed or not
ipcRenderer.on("GetCurrentModVersion-Reply", (event, arg: ConfigFileModVersion) => {
    if (arg != null) {
        modVersion.style.display = "block";
        modVersionText.innerText = "Mod version: " + arg.versionDisplay;
        configPresetText.innerText = "Config preset: " + arg.collectionversion;
        removeButton.style.display = "block";
    } else {
        modVersion.style.display = "none";
        modVersionText.innerText = "";
        configPresetText.innerText = "Config preset:";
        removeButton.style.display = "none";
    }
});

ipcRenderer.on("InstallButtonName-Reply", (event, arg) => {
    hasClickedInstallButton = false;
    arg = arg.toLowerCase();
    installButton.innerText = arg.toUpperCase();
    if (arg != "internal error") {
        installButton.disabled = false;
    }

    switch (arg) {
        case "installed":
            // Green (light-to-dark)
            installButton.style.background = "linear-gradient(to right, #009028 35%, #006419 75%)";
            collectionSelect.disabled = true;
            collectionSelect.style.display = "none";
            installButton.innerHTML = "<i class='mdi mdi-play'></i>PLAY";
            break;
        case "install":
            installButton.style.background = "#FF850A";
            collectionSelect.disabled = false;
            collectionSelect.style.display = "inline-flex";
            break;
        case "update":
            // Blue (dark-to-light)
            installButton.style.background = "linear-gradient(to left, #1A96FF 35%, #1A70FF 75%)";
            collectionSelect.disabled = true;
            collectionSelect.style.display = "none";
            break;
        case "internal error":
            // Red (light-to-dark)
            installButton.style.background = "linear-gradient(to right, #C72D1A 25%, #9B1100 75%)";
            collectionSelect.disabled = true;
            collectionSelect.style.display = "none";
            break;
        default:
            installButton.style.background = "grey";
            collectionSelect.disabled = true;
            collectionSelect.style.display = "none";
            break;
    }
});

ipcRenderer.on("FakeClickMod", (event, moddata) => {
    window.OnClick_Mod(moddata);
});

removeButton.addEventListener("click", (e) => {
    ipcRenderer.send("Remove-Mod", "");
});
