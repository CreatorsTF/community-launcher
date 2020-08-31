"use strict";
module.exports = /** @class */ (function () {
    function CreatorsDepotClient(tf2path) {
        //Checks for updates of local files based on their md5 hash.
        this.allContentURL = "https://creators.tf/api/IDepots/GVersionInfo?depid=1&tags=content";
        this.allContentJSON = "";
        this.tf2Path = tf2path;
    }
    CreatorsDepotClient.prototype.CheckForUpdates = function () {
    };
    return CreatorsDepotClient;
}());
