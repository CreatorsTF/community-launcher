module.exports.ModInstallSource = class ModInstallSource {
    data = {};
    fileType = "UNKNOWN";

    constructor(install_data) {
        this.data = install_data;
    }
    GetLatestVersionNumber() {}
    GetFileURL() {}
};
