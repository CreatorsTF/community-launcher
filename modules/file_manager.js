let fileListPath;
const fs = global.fs;
const process = global.process;

"use strict";

module.exports = {
    Init() {
        fileListPath = this.GetPath();
    },

    GetFileList(modName) {
        return new Promise((resolve, _) => {
            const path = fileListPath + modName + "_files.json";
            if (fs.existsSync(path)) {
                resolve(JSON.parse(fs.readFileSync(path, "utf8")));
            } else {
                //Make new object and return it.
                resolve({
                    files: [],
                });
            }
        });
    },

    GetFileListSync(modName) {
        const path = fileListPath + modName + "_files.json";
        if (fs.existsSync(path)) {
            return JSON.parse(fs.readFileSync(path, "utf8"));
        } else {
            //Make new object and return it.
            return {
                files: [],
            };
        }
    },

    SaveFileList(filelist, modName) {
        return new Promise((resolve, _) => {
            const path = fileListPath + modName + "_files.json";
            fs.writeFileSync(path, filelist, "utf8");
            resolve();
        });
    },

    SaveFileListSync(filelist, modName) {
        const path = fileListPath + modName + "_files.json";
        fs.writeFileSync(path, JSON.stringify(filelist), "utf8");
    },

    RemoveFileList(modName) {
        const path = fileListPath + modName + "_files.json";
        if (fs.existsSync(path)) fs.unlinkSync(path);
    },

    GetPath() {
        const path =
            (process.env.APPDATA ||
                (process.platform == "darwin"
                    ? process.env.HOME + "/Library/Preferences"
                    : process.env.HOME + "/.local/share")) +
            "/creators-tf-launcher";

        if (!fs.existsSync(path)) fs.mkdirSync(path);

        const fullpath = path + "/";
        return fullpath;
    },
};
