//const { ipcRenderer } = require("electron");

var content = document.getElementById("content");
var contentDummy = document.getElementById("content-dummy");
var titleImage = document.getElementById("title-image");
var text = document.getElementById("content-text");
var modVersion = document.getElementById("mod-version");
var modVersionText = document.getElementById("mod-version-text");

var installButton = document.getElementById("install-play-button");
var removeButton = document.getElementById("remove-mod");

var updateButton_Download = document.getElementById("update-button-download");
var updateButton_Downloading = document.getElementById("update-button-downloading");
var updateButton_Update = document.getElementById("update-button-update");
var updateButton_Updated = document.getElementById("update-button-updated");

var website = document.getElementById("socialMediaWebsite");
var github = document.getElementById("socialMediaGithub");
var twitter = document.getElementById("socialMediaTwitter");
var discord = document.getElementById("socialMediaDiscord");
var instagram = document.getElementById("socialMediaInstagram");
var serverlist = document.getElementById("server-list");
var titleheader = document.getElementById("title-header");
var collectionselect = document.getElementById("collection-versions").style.display = "none";

var hasClickedInstallButton = false;

website.onclick = (handle, e) => { window.ipcRenderer.send("Visit-Mod-Social", "website"); };
github.onclick = (handle, e) => { window.ipcRenderer.send("Visit-Mod-Social", "github"); };
twitter.onclick = (handle, e) => { window.ipcRenderer.send("Visit-Mod-Social", "twitter"); };
instagram.onclick = (handle, e) => { window.ipcRenderer.send("Visit-Mod-Social", "instagram"); };
discord.onclick = (handle, e) => { window.ipcRenderer.send("Visit-Mod-Social", "discord"); };

document.onload = () => {
    installButton.disabled = true;
}

const defaultBackgroundImage = "images/backgrounds/servers.jpg";

function OnClick_Mod(data) {
    if(hasClickedInstallButton) return;

    window.log.info("Mod entry clicked: " + data.name);
    
    var bgImg;
    if (data.backgroundimage != "") {
        bgImg = data.backgroundimage;
    }
    else {
        bgImg = defaultBackgroundImage;
    }

    if(bgImg.includes("https")){
        content.style.backgroundImage = `url("${bgImg}")`;
    }
    else{
        content.style.backgroundImage = `url("${"./" + bgImg}")`;
    }

    if (data.titleimage == "") {
        titleheader.style.display = "block";
        titleheader.innerText = data.name;
        titleImage.style.display = "none";
    }
    else {
        titleImage.src = data.titleimage;
        titleImage.style.display = "block";
        titleheader.style.display = "none";
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
    serverlist.style.display = data.serverlistproviders != null ? "block" : "none";

    //Get the current state of this mod to set the name of the button correctly.
    //To do that, we tell the main process to set the current mod and set that up.
    window.ipcRenderer.send("SetCurrentMod", data.name);
    window.ipcRenderer.send("GetCurrentModVersion", "");
    if ((data.install.type == "githubcollection") || (data.install.type == "jsonlistcollection")) {
        //Do stuff for collections
        let select = document.getElementById("collection-versions");
        select.style.display = "block";
        //Clear the select
        select.innerHTML = '';
        //Populate the select
        data.items.forEach(element => {
            let opt = document.createElement("option");
            opt.value = element.itemname;
            opt.innerHTML = element.displayname;
            select.appendChild(opt);
            if (element.default == true) {
                opt.selected = true;
            }
        });
    }
    else {
        collectionselect.style.display = "none";
    }

    hasClickedInstallButton = true;
}

updateButton_Download.onclick = (downloadUpdate) => {
    window.ipcRenderer.send("download_update");
    window.log.info("User chose to download the update. Downloading it." + downloadUpdate);
}

updateButton_Update.onclick = (closeProgramAndUpdate) => {
    window.ipcRenderer.send("restart_app");
    window.log.info("User chose to restart the launcher to update." + closeProgramAndUpdate);
}

window.ipcRenderer.on("update_not_available", () => {
    window.ipcRenderer.removeAllListeners("update_not_available");
    updateButton_Updated.classList.remove("hidden");
    updateButton_Download.remove();
    updateButton_Downloading.remove();
    updateButton_Update.remove();
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

document.getElementById("settings-button").addEventListener("click", (a,b) => {
    window.ipcRenderer.send("SettingsWindow", "");
});
document.getElementById("patchnotes-button").addEventListener("click", (a,b) => {
    window.ipcRenderer.send("PatchNotesWindow", "");
});
document.getElementById("server-list").addEventListener("click", (a,b) => {
    window.ipcRenderer.send("ServerListWindow", "");
});

installButton.addEventListener("click", (e) => {
    //Do NOT use e
    installButton.innerText = "STARTING...";
    installButton.disabled = true;
    window.ipcRenderer.send("install-play-click", document.getElementById("collection-versions").value);
});

window.ipcRenderer.on("GetCurrentModVersion-Reply", (event, arg) => {
    if (arg == "?") {
        modVersion.style.display = "none";
    } else {
        modVersion.style.display = "block";
        modVersionText.innerText = "Mod version: " + arg;
    }
});

window.ipcRenderer.on("InstallButtonName-Reply", (event, arg) => {
    hasClickedInstallButton = false;
    arg = arg.toLowerCase();
    installButton.innerText = arg.toUpperCase();
    if (arg != "installed" && arg != "internal error") {
        installButton.disabled = false;
    }

    switch(arg) {
        case "installed":
            installButton.style.background = "linear-gradient(to right, #009028 35%, #006419 75%)"; //Green (light-to-dark)
            removeButton.style.display = "block";
            break;
        case "install":
            installButton.style.background = "#FF850A";
            removeButton.style.display = "none";
            break;
        case "update":
            installButton.style.background = "linear-gradient(to left, #1A96FF 35%, #1A70FF 75%)"; //Blue (dark-to-light)
            removeButton.style.display = "block";
            break;
        case "internal error":
            installButton.style.background = "linear-gradient(to right, #C72D1A 25%, #9B1100 75%)"; //Red (light-to-dark)
            removeButton.style.display = "none";
            break;
        default:
            installButton.style.background = "grey";
            removeButton.style.display = "none";
            break;
    }
});

window.ipcRenderer.on("FakeClickMod", (event, moddata) => {
    OnClick_Mod(moddata);
});

removeButton.addEventListener("click", function(e) {
    window.ipcRenderer.send("Remove-Mod", "");
});
