import fs from "fs";
import path from "path";
import https from "https";
import {Utilities} from "./utilities";
import ElectronLog from "electron-log";
import { remote } from "electron";

//URLs to try to get mod lists from.
//More than one allows fallbacks.
const modListURLs = [
    "https://fastdl.creators.tf/launcher/mods.json",
    "https://raw.githubusercontent.com/ampersoftware/Creators.TF-Community-Launcher/master/internal/mods.json"
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

    /**
     * Update the local mod list file on disk to contain the latest data we found.
     */
    public static UpdateLocalModList() : Boolean {
        if(this.lastDownloaded != null && this.localModList.version < this.lastDownloaded.version){
            let configPath = path.join(Utilities.GetDataFolder(), localModListName);
            fs.writeFileSync(configPath, JSON.stringify(this.lastDownloaded));
            return true;
        }
        return false;
    }

    /**Check if there is a newer mod list online.
     * Also checks if the internal version is newer than the local, written version.
     */
    public static async CheckForUpdates() : Promise<boolean> {
        ElectronLog.log("Checking for modlist updates");
        var data = new Array<any>();

        try{
            for(let i = 0; i < modListURLs.length; i++){
                var url = modListURLs[i];
                //Soo ts shuts up about the method returning any, which it must do otherwise it gets mad.
                //Seems its not very good with async hidden promises...
                var remoteModList;
                try{
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
                ElectronLog.log(`Local mod list version: ${this.localModList.version}, Remote mod list version: ${this.lastDownloaded.version}.`);
                return this.localModList.version < this.lastDownloaded.version;
            }
        }
        catch (error) {
            console.error("Failed to check for updates. " + error.toString());
            return false;
        }
        ElectronLog.log("No mod list updates found.");
        return false;
    }

    private static async TryGetModList(url : string) : Promise<ModList> {
        return new Promise((resolve, reject) => {
        ElectronLog.log("Trying to get mod list from: " + url);
        var data = new Array<any>();
        let req = https.get(url, res => {
            console.log(`statusCode: ${res.statusCode}`);

            res.on('data', d => {
                if(res.statusCode != 200){
                    resolve(null);
                }
                
                data.push(d);
            });

            res.on("end",  () => {
                try{
                    var buf = Buffer.concat(data);
                    let parsed = JSON.parse(buf.toString());
                    resolve(parsed);
                }
                catch (error){
                    //Json parsing failed soo reject.
                    ElectronLog.error(`Failed to parse json in TryGetModList request for ${url}, error: ${error.toString()}`);
                    resolve(null);
                }
            });
        });
        
        req.on('error', (error: string | undefined) => {
            ElectronLog.error("General request error in a TryGetModList request, error: " + error.toString());
            resolve(null);
        });
        
        req.end();
        });
    }

    public static GetLocalModList() : ModList {
        //Try to load file from our local data, if that doesn't exist, write the internal mod list and return that.
        var internalModListJSON = fs.readFileSync(path.resolve(__dirname, "..", "internal", "mods.json"), {encoding:"utf-8"});
        var internalModList = <ModList>JSON.parse(internalModListJSON);
        let configPath = path.join(Utilities.GetDataFolder(), localModListName);

        if(fs.existsSync(configPath)){
            var localConfig = <ModList>JSON.parse(fs.readFileSync(configPath, {encoding:"utf-8"}));
            if(localConfig.version > internalModList.version){
                return localConfig;
            }
        }

        //Write the internal mod list then return that too.
        //We also want to re write the internal mod list if its a higher version.
        fs.writeFileSync(configPath, internalModListJSON);
        return <ModList>JSON.parse(internalModListJSON);
    }

    public static DeleteLocalModList() : Boolean {
        let configPath = path.join(Utilities.GetDataFolder(), localModListName);
        if(fs.existsSync(configPath)){
            fs.unlinkSync(configPath);
            return true;
        }
        return false;
    }
}

class ModList
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
    version_property_name: string;
    install_url_property_name: string;
    asset_index: number
    itemname: string
    owner?: string
    name?: string
	displayname?: string
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
    serverlist: string;
    serverlistproviders: Array<number>;
    modid: string;
    contenttext: string;
    install: Install
    items: Install[]
}

export { ModListLoader, ModList, ModListEntry, Install }