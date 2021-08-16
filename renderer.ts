const content = document.getElementById("content");
const contentDummy = document.getElementById("content-dummy");
const titleImage = document.getElementById("title-image") as HTMLImageElement;
const text = document.getElementById("content-text");
const modVersion = document.getElementById("mod-version");
const modVersionText = document.getElementById("mod-version-text");

const installButton = document.getElementById("install-play-button") as HTMLButtonElement;
const removeButton = document.getElementById("remove-mod") as HTMLButtonElement;

const updateButton_Download = document.getElementById("update-button-download");
const updateButton_Downloading = document.getElementById("update-button-downloading");
const updateButton_Update = document.getElementById("update-button-update");
const updateButton_Updated = document.getElementById("update-button-updated");
const updateButton_Fail = document.getElementById("update-button-fail");

const website = document.getElementById("socialMediaWebsite");
const github = document.getElementById("socialMediaGithub");
const twitter = document.getElementById("socialMediaTwitter");
const discord = document.getElementById("socialMediaDiscord");
const instagram = document.getElementById("socialMediaInstagram");
const serverlist = document.getElementById("server-list");
const titleHeader = document.getElementById("title-header");
const collectionMenu = document.getElementById("collection-menu");
const collectionSelect = document.getElementById("collection-versions") as HTMLButtonElement;

const settingsButton = document.getElementById("settings-button");
const patchnotesButton = document.getElementById("patchnotes-button");
const serverListButton = document.getElementById("server-list");

let hasClickedInstallButton = false;

website.onclick = () => { window.ipcRenderer.send("Visit-Mod-Social", "website"); };
github.onclick = () => { window.ipcRenderer.send("Visit-Mod-Social", "github"); };
twitter.onclick = () => { window.ipcRenderer.send("Visit-Mod-Social", "twitter"); };
instagram.onclick = () => { window.ipcRenderer.send("Visit-Mod-Social", "instagram"); };
discord.onclick = () => { window.ipcRenderer.send("Visit-Mod-Social", "discord"); };

document.onload = () => {
    installButton.disabled = true;
};

const defaultBackgroundImage = "images/backgrounds/servers.jpg";

function OnClick_Mod(data) {
    if (hasClickedInstallButton) {
        return;
    }

    window.log.info("Mod entry clicked: " + data.name);

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
    // TypeScript does not have "backgroundBlendMode" on "CSSStyleDeclaration"...
    // @ts-ignore
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
    serverlist.style.display = data.serverlistproviders != "" ? "block" : "none";

    //Get the current state of this mod to set the name of the button correctly.
    //To do that, we tell the main process to set the current mod and set that up.
    window.ipcRenderer.send("SetCurrentMod", data.name);
    window.ipcRenderer.send("GetCurrentModVersion", "");
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
}

updateButton_Download.onclick = (downloadUpdate) => {
    window.ipcRenderer.send("download_update");
    window.log.info("User chose to download the update. Downloading it." + downloadUpdate);
};

updateButton_Update.onclick = (closeProgramAndUpdate) => {
    window.ipcRenderer.send("restart_app");
    window.log.info("User chose to restart the launcher to update." + closeProgramAndUpdate);
};

window.ipcRenderer.on("update_not_available", () => {
    window.ipcRenderer.removeAllListeners("update_not_available");
    updateButton_Updated.classList.remove("hidden");
    window.log.info("No update available... Sad!");
});

window.ipcRenderer.on("update_available", () => {
    window.ipcRenderer.removeAllListeners("update_available");
    updateButton_Updated.remove();
    updateButton_Download.classList.remove("hidden");
    window.log.info("An update is available. Waiting for user's input to actually download it.");
});

window.ipcRenderer.on("update_downloading", () => {
    window.ipcRenderer.removeAllListeners("update_downloading");
    updateButton_Download.remove();
    updateButton_Downloading.classList.remove("hidden");
    window.log.info("Downloading update...");
});

window.ipcRenderer.on("update_downloaded", () => {
    window.ipcRenderer.removeAllListeners("update_downloaded");
    updateButton_Downloading.remove();
    updateButton_Update.classList.remove("hidden");
    window.log.info("The update was downloaded and will be installed on restart. Waiting for user's input.");
});

window.ipcRenderer.on("update_error", () => {
    window.ipcRenderer.removeAllListeners("update_error");
    updateButton_Fail.classList.remove("hidden");
    window.log.info("An error occurred while trying to get update info");
});

settingsButton.addEventListener("click", () => {
    window.ipcRenderer.send("SettingsWindow", "");
});
patchnotesButton.addEventListener("click", () => {
    window.ipcRenderer.send("PatchNotesWindow", "");
});
serverListButton.addEventListener("click", () => {
    window.ipcRenderer.send("ServerListWindow", "");
});

installButton.addEventListener("click", () => {
    //Do NOT use e
    installButton.innerText = "STARTING...";
    installButton.disabled = true;
    window.ipcRenderer.send("install-play-click", collectionSelect.value);
});

// Disabling stuff based on if the mod is installed or not
window.ipcRenderer.on("GetCurrentModVersion-Reply", (event, arg) => {
    if (arg != "" && arg != null) {
        modVersion.style.display = "block";
        modVersionText.innerText = "Mod version: " + arg;
        removeButton.style.display = "block";
    } else {
        modVersion.style.display = "none";
        modVersionText.innerText = "";
        removeButton.style.display = "none";
    }
});

window.ipcRenderer.on("InstallButtonName-Reply", (event, arg) => {
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
            installButton.innerHTML = "<i class='mdi mdi-play'></i>PLAY";
            installButton.onclick = () => { window.ipcRenderer.send("Open-External-Game", "gameId"); };
            break;
        case "install":
            installButton.style.background = "#FF850A";
            collectionSelect.disabled = false;
            break;
        case "update":
            // Blue (dark-to-light)
            installButton.style.background = "linear-gradient(to left, #1A96FF 35%, #1A70FF 75%)";
            collectionSelect.disabled = true;
            break;
        case "internal error":
            // Red (light-to-dark)
            installButton.style.background = "linear-gradient(to right, #C72D1A 25%, #9B1100 75%)";
            collectionSelect.disabled = true;
            break;
        default:
            installButton.style.background = "grey";
            collectionSelect.disabled = true;
            break;
    }
});

window.ipcRenderer.on("FakeClickMod", (event, moddata) => {
    OnClick_Mod(moddata);
});

removeButton.addEventListener("click", (e) => {
    window.ipcRenderer.send("Remove-Mod", "");
});
