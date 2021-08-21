import process from "process";
import os from "os";
import path from "path";
import { promises } from "fs";
import log from "electron-log";
import FsExtensions from "./fs_extensions";

//Home made regex to find a path. May not be perfect.
const pathStringRegex = new RegExp(/("(\S+[:]+[\S]+)")/, "g");

class Config {
    public static config: any | null

    //Save the config given.
    public static async SaveConfig(_config: any): Promise<any> {
        const filePathFull = await this.GetConfigFullPath();

        await promises.writeFile(filePathFull, JSON.stringify(_config), { encoding: "utf8" });
        log.log("Config file was saved.");
    }

    //Get the config from disk.
    public static async GetConfig(): Promise<any> {
        //If config is null, load it.
        const filePathFull = await this.GetConfigFullPath();

        //If the config file exists, read and parse it.
        if (await FsExtensions.fileExists(filePathFull)) {
            this.config = JSON.parse(await promises.readFile(filePathFull, "utf8"));
            log.log("Loaded pre existing config");
            return this.config;
        }
        else {
            log.log("User does not have a config file, creating one");
            //Create default config
            this.config = {
                steam_directory: "",
                tf2_directory: "",
                current_mod_versions: []
            };

            //Try to populate the default values of the steam directory and tf2 directory automatically.
            this.config.steam_directory = await Config.GetSteamDirectory();

            log.log(`Auto locater for the users steam directory returned "${this.config.steam_directory}"`);

            if (this.config.steam_directory != "") {
                //Try to find the users tf2 directory automatically.
                try {
                    const result = await this.GetTF2Directory(this.config.steam_directory);
                    log.log("TF2 directory was found successfully at: " + result);
                    this.config.tf2_directory = result;
                } catch {
                    log.error("TF2 directory was not found automatically");
                }
            }
            //Return whether or not the TF2/Steam directory was found
            //User is told later anyway.
            await this.SaveConfig(this.config);
            return this.config;
        }
    }

    //This attempts to find the users tf2 directory automatically.
    public static async GetTF2Directory(steamdir: string): Promise<string> {
        let tf2Path = "steamapps/common/Team Fortress 2/";

        //Check if tf2 is installed in the steam installation steamapps.
        if (await FsExtensions.pathExists(path.join(steamdir, tf2Path))) {
            tf2Path = path.join(steamdir, tf2Path);
            return tf2Path;
        } else {
            //Check the library folders file and check all those for the tf2 directory.
            const libraryFolders = `${steamdir}/steamapps/libraryfolders.vdf`;
            if (await FsExtensions.pathExists(libraryFolders)) {
                //How this works:
                //Read the lines of the libraryfolders
                //If we find a match with the regular expression, we have a possible other library folder.
                //We check this library folder to see if it has a tf2 install folder.
                //If yes, we use this!
                //If no, we just fail.

                const data = await promises.readFile(libraryFolders, "utf8");
                const lines = data.split("\n");
                for (let i = 0; i < lines.length; i++) {
                    const result = pathStringRegex.exec(lines[i]);
                    if (result) {
                        if (result[2]) {
                            const potentialPath = path.join(result[2], "/", tf2Path);
                            if (await FsExtensions.pathExists(potentialPath)) {
                                return potentialPath;
                            }
                        }
                    }
                }
                throw new Error("No other tf2 libraries had TF2");
            } else {
                throw new Error("TF2 not found in base install location, no other libraries found.");
            }
        }
    }

    public static async GetConfigFullPath(): Promise<string> {
        const _path = (process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share")) + "/creators-tf-launcher";
        await FsExtensions.ensureDirectoryExists(_path);

        const configName = "config.json";
        const fullPath = path.join(_path, configName);
        return fullPath;
    }

    //Attempts to locate the steam directory automatically.
    //This aids in finding the tf2 dir later.
    public static async GetSteamDirectory(): Promise<string> {
        let basedir = "";
        /**
         * Gets first existing path in an array of strings
         * @param {string[]} steamPaths An array of directory paths
         * @returns First existing path in steamPaths or null if none of the paths exist, with prefix added
         */

        async function getExistingPath(steamPaths: Array<string>): Promise<string> {
            for (let steamPath of steamPaths) {
                steamPath = path.join(steamPath);
                if (await FsExtensions.pathExists(steamPath)) {
                    return steamPath;
                }
            }
            return "";
        }

        //Try to find steam installation directory
        //Not using the registry for Windows installations
        //We check the most likely install paths.
        if (os.platform() == "win32") {
            const steamPaths = ["C:/Program Files (x86)/Steam", "C:/Program Files/Steam"];
            basedir = await getExistingPath(steamPaths);
        }
        else if (os.platform() == "linux" || "freebsd" || "openbsd") {
            //Linux solution is untested
            const homedir = process.env.HOME;
            const steamPaths = [".steam/steam", ".local/share/steam"];
            for (const pathGroup of steamPaths) {
                let existingPath = await getExistingPath(pathGroup["paths"]);
                basedir = path.join(homedir, existingPath);
                if (basedir != "") {
                    break;
                }
            }
        }
        else {
            basedir = "";
        }
        return basedir;
    }
}

export default Config;
