const ipcRenderer = window.ipcRenderer;

var content = document.getElementById("content");
var contentDummy = document.getElementById("contentdummy");
var titleImage = document.getElementById("title-image");
var text = document.getElementById("content-text");
var version = document.getElementById("version-text");

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

website.onclick = (handle, e) => { ipcRenderer.send("Visit-Mod-Social", "website"); };
github.onclick = (handle, e) => { ipcRenderer.send("Visit-Mod-Social", "github"); };
twitter.onclick = (handle, e) => { ipcRenderer.send("Visit-Mod-Social", "twitter"); };
instagram.onclick = (handle, e) => { ipcRenderer.send("Visit-Mod-Social", "instagram"); };
discord.onclick = (handle, e) => { ipcRenderer.send("Visit-Mod-Social", "discord"); };

var installButton = document.getElementById("install-play-update");
document.onload = () => {
    installButton.disabled = true;
};

function OnClick_Mod(data) {
    window.log.info("Mod entry clicked");

    content.style.backgroundImage = `url("${"./" + data.backgroundimage}")`;
    titleImage.src = data.titleimage;
    text.innerText = data.contenttext;
    content.style.borderColor = data.bordercolor;
    content.style.backgroundPositionX = data.backgroundpos;

    contentDummy.remove();
    content.style.display = "block";
    content.style.backgroundBlendMode = "soft-light";

    installButton.style.background = "";
    installButton.style.backgroundColor = "grey";
    installButton.style.color = "black";
    installButton.innerText = "LOADING...";
    installButton.disabled = true;

    website.style.display = data.website != "" ? "block" : "none";
    github.style.display = data.github != "" ? "block" : "none";
    twitter.style.display = data.twitter != "" ? "block" : "none";
    instagram.style.display = data.instagram != "" ? "block" : "none";
    discord.style.display = data.discord != "" ? "block" : "none";

    //Get the current state of this mod to set the name of the button correctly.
    //To do that, we tell the main process to set the current mod and set that up.
    ipcRenderer.send("SetCurrentMod", data.name);
}

updateButton_Download.onclick = (downloadUpdate) => {
  ipcRenderer.send("download_update");
  window.log.info("User chose to download the update. Downloading it." + downloadUpdate);
}

updateButton_Update.onclick = (closeProgramAndUpdate) => {
  ipcRenderer.send("restart_app");
  window.log.info("The launcher was restarted to update" + closeProgramAndUpdate);
}

ipcRenderer.on("update_not_available", () => {
  ipcRenderer.removeAllListeners("update_not_available");
  updateButton_Updated.classList.remove("hidden");
  updateButton_Download.remove();
  updateButton_Downloading.remove();
  updateButton_Update.remove();
  window.log.info("No update available... Sad!");
});

ipcRenderer.on("update_available", () => {
  ipcRenderer.removeAllListeners("update_available");
  updateButton_Updated.remove();
  updateButton_Download.classList.remove("hidden");
  window.log.info("An update is available. Waiting for user's input to actually download it.");
});

ipcRenderer.on("update_downloading", () => {
  ipcRenderer.removeAllListeners("update_downloading");
  updateButton_Download.remove();
  updateButton_Downloading.classList.remove("hidden");
  window.log.info("Downloading update");
});

ipcRenderer.on("update_downloaded", () => {
  ipcRenderer.removeAllListeners("update_downloaded");
  updateButton_Download.remove();
  updateButton_Update.classList.remove("hidden");
  window.log.info("The update was downloaded and will be installed on restart. Waiting for user's input.");
});

document.getElementById("settings-button").addEventListener("click", (a,b) => {
    ipcRenderer.send("SettingsWindow", "");
});

document.getElementById("patchnotes-button").addEventListener("click", (a,b) => {
    ipcRenderer.send("PatchNotesWindow", "");
});

document.getElementById("serverlist").addEventListener("click", (a, b) => {
    ipcRenderer.send("ServerListWindow", "");
});

installButton.addEventListener("click", (e) => {
    installButton.innerText = "STARTING...";
    installButton.disabled = true;
    ipcRenderer.send("install-play-click", e);
});

ipcRenderer.on("GetCurrentModVersion-Reply", (event, arg) => {
    version.innerText = arg;
});

ipcRenderer.on("InstallButtonName-Reply", (event, arg) => {
    arg = arg.toLowerCase();
    installButton.innerText = arg.toUpperCase();
    if(arg != "installed" && arg != "internal error"){
        installButton.disabled = false;
    }

    switch(arg) {
        case "installed":
            installButton.style.background = "linear-gradient(to right, #009028 25%, #007520 75%)"; //Green (light-to-dark)
            installButton.style.color = "white";
            removeButton.style.display = "block";
            break;
        case "install":
            installButton.style.background = "";
            installButton.style.backgroundColor = "#FF850A";
            installButton.style.color = "white";
            removeButton.style.display = "none";
            break;
        case "update":
            installButton.style.background = "linear-gradient(to left, #1A96FF 25%, #1A70FF 75%)"; //Blue (dark-to-light)
            installButton.style.color = "white";
            removeButton.style.display = "block";
            break;
        case "internal error":
            installButton.style.background = "";
            installButton.style.backgroundColor = "#B51804";
            installButton.style.color = "white";
            removeButton.style.display = "none";
            break;
        default:
            installButton.style.background = "";
            installButton.style.backgroundColor = "grey";
            installButton.style.color = "black";
            removeButton.style.display = "none";
            break;
    }
});

ipcRenderer.on("FakeClickMod", (event, moddata) => {
    OnClick_Mod(moddata);
});

removeButton.addEventListener("click", function(e) {
    ipcRenderer.send("Remove-Mod", "");
});
