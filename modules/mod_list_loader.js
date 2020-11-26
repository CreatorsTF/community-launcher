const fs = require("fs");
const https = require("https");

const modListURL = "https://fastdl.creators.tf/launcher/mods.json";
const modListBackupURL = "https://raw.githubusercontent.com/ampersoftware/Creators.TF-Community-Launcher/master/internal/mods.json";

const ModListLoader = class ModListLoader {

    CheckForUpdates() {
        
    }


}

module.exports.ModListLoader = ModListLoader;