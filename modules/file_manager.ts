import { promises } from "fs";
import FsExtensions from "./fs_extensions";
var process = global.process;

class FileManager {
    public static fileListPath: any | null

    public static async Init() {
        this.fileListPath = await this.GetPath();
    }

    /**
     * Gets the mod's file list
     * @param {string} modName Mod name
     */
    public static async GetFileList(modName: string) {
        let path = this.fileListPath + modName + "_files.json";
        if (await FsExtensions.fileExists(path)) {
            const json = await promises.readFile(path, { encoding: "utf8" });
            return JSON.parse(json);
        }
        else {
            //Make new object and return it.
            return {
                files: []
            }
        }
    }

    /**
     * Saves the mod's file list
     * @param {string} fileList file list
     * @param {string} modName mod name
     */
    public static async SaveFileList(fileList: string, modName: string) {
        let path = this.fileListPath + modName + "_files.json";
        await promises.writeFile(path, JSON.stringify(fileList), "utf-8");
    }

    /**
     * Removes the mod's file list
     * @param {string} modName mod name
     */
    public static async RemoveFileList(modName: string) {
        let path = this.fileListPath + modName + "_files.json";
        if (await FsExtensions.fileExists(path)) {
            await promises.unlink(path);
        }
    }

    public static async GetPath() {
        let path = (process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share")) + "/creators-tf-launcher";
        
        await FsExtensions.ensureDirectoryExists(path);

        let fullPath = path + "/";
        return fullPath;
    }
}

export default FileManager