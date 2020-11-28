import fs from "fs";
import path from "path";
import https from "https";
import {Utilities} from "./utilities";

const modListURLs = [
    "https://fastdl.creators.tf/launcher/mods.json",
    "https://raw.githubusercontent.com/ampersoftware/Creators.TF-Community-Launcher/master/internal/mods.json"
];

const localModListName = "mods.json";

class ModListLoader {

    private static lastDownloaded : ModList;
    private static localModList : ModList;

    public static LoadLocalModList(){
        this.localModList = this.GetLocalModList();
    }

    public static GetModList() : ModList {
        return this.localModList;
    }

    public static UpdateLocalModList() : Boolean {
        if(this.lastDownloaded != null && this.localModList.version < this.lastDownloaded.version){
            let configPath = path.join(Utilities.GetDataFolder(), localModListName);
            fs.writeFileSync(configPath, JSON.stringify(this.lastDownloaded));
            return true;
        }
        return false;
    }

    public static async CheckForUpdates() : Promise<boolean> {
        var data = new Array<any>();

        try{
            for(let i = 0; i < modListURLs.length; i++){
                var url = modListURLs[i];
                //Soo ts shuts up about the method returning any, which it must do otherwise it gets mad.
                //Seems its not very good with async hidden promises...
                this.lastDownloaded = await <ModList><unknown>this.TryGetModList(url);
                break;
            }

            if(this.lastDownloaded != null && this.lastDownloaded.hasOwnProperty("version")){
                return this.localModList.version < this.lastDownloaded.version;
            }
        }
        catch (error) {
            console.error("Failed to check for updates. " + error.toString());
            return false;
        }
        
        return false;
    }

    private static async TryGetModList(url : string) : Promise<ModList | any> {
        var data = new Array<any>();
        let req = https.get(url, res => {
            console.log(`statusCode: ${res.statusCode}`);

            res.on('data', d => {
                if(res.statusCode != 200){
                    throw new Error(`Failed accessing ${url}: ` + res.statusCode);
                }
                
                data.push(d);
            });

            res.on("end",  () => {
                try{
                    var buf = Buffer.concat(data);
                    let parsed = JSON.parse(buf.toString());
                    return <ModList>parsed;
                }
                catch (error){
                    //Json parsing failed soo reject.
                    throw new Error(error.toString());
                }
            });
        });
        
        req.on('error', (error: string | undefined) => {
            throw new Error(error);
        });
        
        req.end();
    }

    public static GetLocalModList() : ModList {
        //Try to load file from our local data, if that doesn't exist, write the internal mod list and return that.
        let configPath = path.join(Utilities.GetDataFolder(), localModListName);
        if(fs.existsSync(configPath)){
            return JSON.parse(fs.readFileSync(configPath, {encoding:"utf-8"}));
        }
        else {
            //Write the internal mod list then return that too.
            var internalModListJSON = fs.readFileSync(path.resolve(__dirname, "..", "internal", "mods.json"), {encoding:"utf-8"});
            fs.writeFileSync(configPath, internalModListJSON);
            return <ModList>JSON.parse(internalModListJSON);
        }
    }
}

class ModList
{
    version: number;
    mods: Array<{
        name: string;
        blurb: string;
        icon: string;
        titleimage: string;
        backgroundimage: string;
        bordercolor: string;
        backgroundposX: string;
        backgroundposY: string;
        website: string;
        github: string;
        twitter: string;
        instagram: string;
        discord: string;
        serverlist: string;
        modid: string;
        contenttext: string;
        install: {
            type: string;
            get_url: string;
            targetdirectory: string;
            version_property_name: string;
            install_url_property_name: string;
        };
    }>;
}

export { ModListLoader, ModList }