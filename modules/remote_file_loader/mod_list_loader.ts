import fs from "fs";
import path from "path";
import https from "https";
import {Utilities} from "../utilities";
import ElectronLog from "electron-log";
import RemoteLoader, { RemoteFile } from "./remote_file_loader";

/**
 * Responsible for providing the latest mod list avaliable.
 */
class ModListLoader extends RemoteLoader<ModList>{

    static instance = new ModListLoader();

    remoteUrls = [
        "https://raw.githubusercontent.com/ampersoftware/Creators.TF-Community-Launcher/master/internal/mods.json",
        "https://fastdl.creators.tf/launcher/mods.json"
    ];
    localFileName = "mods.json";
    
}

class ModList extends RemoteFile
{
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

class ModListEntry
{
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
    serverlistproviders: Array<number>;
    modid: string;
    contenttext: string;
    install: {
        type: string;
        get_url: string;
        targetdirectory: string;
        version_property_name: string;
        install_url_property_name: string;
    };
}

export { ModListLoader, ModList, ModListEntry }