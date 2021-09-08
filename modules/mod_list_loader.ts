import fs from "fs";
import path from "path";
import https from "https";
import log from "electron-log";
import semver from "semver";
import isDev from "electron-is-dev";
import Utilities from "./utilities";

//URLs to try to get mod lists from.
//More than one allows fallbacks.
const modListURLs = [
    "https://raw.githubusercontent.com/CreatorsTF/Creators.TF-Community-Launcher/master/internal/mods.json",
    "https://fastdl.creators.tf/launcher/mods.json"
];

const localModListName = "mods.json";

/**
 * Responsible for providing the latest mod list avaliable.
 */
class ModListLoader {

    private static lastDownloaded : ModList;
    private static localModList : ModList;

    public static LoadLocalModList(){
        this.localModList = this.GetLocalModList();
    }

    public static GetModList() : ModList {
        return this.localModList;
    }

    public static InjectDevMods() {
        const devModsPath = path.join(this.GetInternalFolderPath(), "devmods.json");
        this.localModList.mods = this.localModList.mods.concat(JSON.parse(fs.readFileSync(devModsPath, "utf-8")).mods);
    }

    /**
     * Update the local mod list file on disk to contain the latest data we found.
     */
    public static UpdateLocalModList(): boolean {
        let modlistUpdated: boolean;
        if(this.lastDownloaded != null && this.localModList.version < this.lastDownloaded.version){
            const configPath = path.join(Utilities.GetDataFolder(), localModListName);
            fs.writeFileSync(configPath, JSON.stringify(this.lastDownloaded));
            this.localModList = this.lastDownloaded;
            modlistUpdated = true;
        }
        modlistUpdated = false;

        const oldMods = this.localModList.mods.slice();
        //Filter out mods that do not meet the min version requirement
        const currentVersion = Utilities.GetCurrentVersion();
        this.localModList.mods = this.localModList.mods.filter((value) => {
            return (value.minLauncherVersion == undefined || (semver.valid(value.minLauncherVersion) != null && semver.gte(currentVersion, value.minLauncherVersion)));
        });

        //Log removed mods in development environments
        if (isDev) {
            oldMods.forEach(element => {
                if(this.localModList.mods.find((x) => x.name == element.name) == undefined){
                    log.verbose(`The mod "${element.name}" was filtered out. Version requirement: ${element.minLauncherVersion}`);
                }
            });
        }

        return modlistUpdated;
    }

    // Check if there is a newer mod list online.
    // Also checks if the internal version is newer than the local, written version.
    //
    public static async CheckForUpdates(): Promise<boolean> {
        log.log("Checking for modlist updates");

        //Not being used. Should it be removed?
        //let data = new Array<any>();

        try{
            for(let i = 0; i < modListURLs.length; i++){
                const url = modListURLs[i];
                //Soo ts shuts up about the method returning any, which it must do otherwise it gets mad.
                //Seems its not very good with async hidden promises...
                let remoteModList;
                try {
                    remoteModList = await <ModList><unknown>this.TryGetModList(url);
                }
                catch {
                    continue;
                }

                //Break if we have a valid mod list. If we have null, try again.
                if (remoteModList != null && remoteModList != undefined){
                    this.lastDownloaded = remoteModList;
                    break;
                }
            }

            if(this.lastDownloaded != null && this.lastDownloaded.hasOwnProperty("version")){
                log.log(`Local mod list version: ${this.localModList.version}, Remote mod list version: ${this.lastDownloaded.version}.`);
                return this.localModList.version < this.lastDownloaded.version;
            }
        }
        catch (error) {
            console.error("Failed to check for updates. " + error.toString());
            return false;
        }
        log.log("No mod list updates found.");
        return false;
    }

    private static async TryGetModList(url: string): Promise<ModList> {
        return new Promise((resolve) => {
            log.log("Trying to get mod list from: " + url);
            const data = new Array<any>();
            const req = https.get(url, res => {
                console.log(`statusCode: ${res.statusCode}`);

                res.on("data", (d) => {
                    if(res.statusCode != 200){
                        resolve(null);
                    }
                    data.push(d);
                });

                res.on("end", () => {
                    try {
                        let parsed;
                        const buf = Buffer.concat(data);
                        if (res.statusCode != 200) {
                            console.log("ERROR! Not parsing " + url);
                            return;
                        } else {
                            parsed = JSON.parse(buf.toString());
                        }
                        resolve(parsed);
                    }
                    catch (error){
                        //Json parsing failed soo reject.
                        log.error(`Failed to parse JSON in TryGetModList request for ${url}, error: ${error.toString()}`);
                        resolve(null);
                    }
                });
            });

            req.on("error", (error: string | undefined) => {
                log.error("General request error in a TryGetModList request, error: " + error.toString());
                resolve(null);
            });

            req.end();
        });
    }

    public static GetLocalModList(): ModList {
        //Try to load file from our local data, if that doesn't exist, write the internal mod list and return that.
        const internalModListJSON = fs.readFileSync(path.resolve(this.GetInternalFolderPath(), "mods.json"), {
            encoding: "utf-8"
        });
        const internalModList = <ModList>JSON.parse(internalModListJSON);
        const configPath = path.join(Utilities.GetDataFolder(), localModListName);

        if (fs.existsSync(configPath)) {
            const localConfig = <ModList>JSON.parse(fs.readFileSync(configPath, {
                encoding: "utf-8"
            }));
            if (localConfig.version > internalModList.version) {
                return localConfig;
            }
        }

        //Write the internal mod list then return that too.
        //We also want to re write the internal mod list if its a higher version.
        fs.writeFileSync(configPath, internalModListJSON);
        return <ModList>JSON.parse(internalModListJSON);
    }

    public static DeleteLocalModList(): boolean {
        const configPath = path.join(Utilities.GetDataFolder(), localModListName);
        if (fs.existsSync(configPath)) {
            fs.unlinkSync(configPath);
            return true;
        }
        return false;
    }

    private static GetInternalFolderPath(): string {
        return path.resolve(__dirname, "..", "internal");
    }
}

class ModList
{
    version: number;
    mods: Array<ModListEntry>;

    public GetMod(name: string): ModListEntry {
        for (const entry of this.mods) {
            if (entry.name == name) {
                return entry;
            }
        }
        return null;
    }
}

class Install {
    type: string;
    modname: string;
    get_url: string;
    targetdirectory: string;
    cloudflarebypass: boolean;
    version_property_name: string;
    install_url_property_name: string;
    asset_index: number
    itemname: string
    owner?: string
    name?: string
	displayname?: string
    setupfunc?: string
}

class ModListEntry
{
    name: string;
    blurb: string;
    icon: string;
    titleimage: string;
    backgroundimage: string;
    backgroundBlendMode: string;
    bordercolor: string;
    backgroundposX: string;
    backgroundposY: string;
    website: string;
    github: string;
    twitter: string;
    instagram: string;
    discord: string;
    serverlistproviders: Array<number>;
    isMod: boolean;
    gameId: string;
    contenttext: string;
    install: Install;
    items: Install[];
    minLauncherVersion: string;
}

class GithubAsset {
    url: string
    browser_download_url: string
    id: string
    size: string
}

class ConfigType {
    steam_directory: string;
    tf2_directory: string;
    current_mod_versions: ModVersion[]
}

class ModVersion {
    name: string;
    version: number;
    versionDisplay?: string;
    collectionversion?: string;
}

export { ModListLoader, ModList, ModListEntry, Install, GithubAsset, ConfigType, ModVersion };
