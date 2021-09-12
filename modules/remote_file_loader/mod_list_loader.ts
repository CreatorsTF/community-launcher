import fs from "fs";
import path from "path";
import https from "https";
import ElectronLog from "electron-log";
import RemoteLoader, { RemoteFile } from "./remote_file_loader";

/**
 * Responsible for providing the latest mod list avaliable.
 */
class ModListLoader extends RemoteLoader<ModList>{

    static instance = new ModListLoader();

    remoteUrls = [
        "https://raw.githubusercontent.com/CreatorsTF/Creators.TF-Community-Launcher/master/internal/mods.json",
        "https://fastdl.creators.tf/launcher/mods.json"
    ];
    localFileName = "mods.json";
    
    public InjectDevMods() {
        const devModsPath = path.join(__dirname, "../..", "internal", "devmods.json");
        this.localFile.mods = this.localFile.mods.concat(JSON.parse(fs.readFileSync(devModsPath, "utf-8")).mods);
    }

}

class ModList extends RemoteFile
{
    version: number;
    mods: Array<ModListEntry>;

    public GetMod(name : any) : ModListEntry{
        for(var entry of this.mods){
            if(entry.name == name){
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