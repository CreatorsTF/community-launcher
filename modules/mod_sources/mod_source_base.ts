import ElectronLog from 'electron-log';
import Main from '../../main';
import path from 'path';
import fs from "fs"
import {Install, ModListEntry} from '../mod_list_loader'
import { Utilities } from '../utilities';
import electronIsDev from 'electron-is-dev';


abstract class ModInstallSource {
    data: Install[];
    fileType = "UNKNOWN";

    constructor(install_data : Install[]){
        this.data = install_data;
    }
    abstract GetLatestVersionNumber() : Promise<number>;
    abstract GetDisplayVersionNumber(): Promise<string>;
    abstract GetFileURL(asset_index? : number) : Promise<string>;

    async PostInstall(collection_version?: string)  {
        //Try to execute mod specific operations, like moving tf/cfg/class.cfg and tf/cfg/autoexec.cfg back to /tf/cfg/user/class.cfg
        //and /tf/cfg/user/autoexec.cfg respectively for mastercomfig

        let setup_func: string = "";
        if (!(typeof (this.data[Utilities.FindCollectionNumber(this.data, collection_version)].setupfunc) == "undefined")) {
            setup_func = this.data[Utilities.FindCollectionNumber(this.data, collection_version)].setupfunc;
        }

        switch (setup_func) {
            case "movecfgs":
                ElectronLog.log("Executing movecfgs install operation")
                let filesToMove = ["autoexec.cfg", "scout.cfg", "soldier.cfg", "pyro.cfg", "demoman.cfg", "heavyweapons.cfg",
                "engineer.cfg", "medic.cfg", "sniper.cfg", "spy.cfg"]
                //Move cfgs
                let cfgpath = path.join(Main.config.tf2_directory, "tf", "cfg");
                let usercfgpath = path.join(cfgpath, "user");
                ElectronLog.log("cfg path is: " + cfgpath);
                ElectronLog.log("user cfg path is: \"" + usercfgpath + "\"");
                if (!(fs.existsSync(usercfgpath))) {
                    //Create usercfgpath
                    ElectronLog.log("user cfg path does not exist, creating...");
                    fs.mkdirSync(usercfgpath, {recursive: true});
                }
                //Actually move them
                fs.readdir(cfgpath, (err, files) => {
                    if (err) {
                        if (electronIsDev) {
                            Utilities.ErrorDialog("There was an error while trying to read folder " + cfgpath + " to move cfg files. The error was " + err, "Error")    
                        }
                        else {
                            Utilities.ErrorDialog("There was an error while trying to read cfg folder", "Error")
                        }
                        ElectronLog.error("there was an error on mod_source_base.ts, line 55 when trying to read the cfg directory to move cfg files. Trying to read directory: " + cfgpath + " , the error was:" + err)
                    }
                    else {
                        files.forEach(file => {
                            ElectronLog.log("Checking if should move file: " + file)
                            if(filesToMove.indexOf(file) > -1) {
                                ElectronLog.log("Trying to move file " + path.join(cfgpath, file) + " to " + path.join(usercfgpath, path.basename(file)))
                                fs.rename(path.join(cfgpath ,file), path.join(usercfgpath, path.basename(file)), (err) => {
                                    if (err) {
                                        ElectronLog.error("There was an error trying to move file " + path.join(cfgpath, file) + " to " + path.join(usercfgpath, path.basename(file)))
                                    }
                                })
                            }
                        })
                    }
                })
                break;
            default:
                break;
        }
        
    }

    async PostUninstall() {
        let setup_func: string = "";
        if (typeof (this.data[0]) != "undefined") {
            if ((typeof (this.data[0].setupfunc)) != "undefined")
            setup_func = this.data[0].setupfunc;
        }

        switch (setup_func) {
            case "movecfgs":
                //Move them back
                ElectronLog.log("Executing movecfgs uninstall operation")
                let filesToMove = ["autoexec.cfg", "scout.cfg", "soldier.cfg", "pyro.cfg", "demoman.cfg", "heavyweapons.cfg",
                "engineer.cfg", "medic.cfg", "sniper.cfg", "spy.cfg"]
                //Move cfgs
                let cfgpath = path.join(Main.config.tf2_directory, "tf", "cfg");
                let usercfgpath = path.join(cfgpath, "user");
                ElectronLog.log("cfg path is: " + cfgpath);
                ElectronLog.log("user cfg path is: \"" + usercfgpath + "\"");
                //Actually move them
                fs.readdir(usercfgpath, (err, files) => {
                    if (err) {
                        if (electronIsDev) {
                            Utilities.ErrorDialog("There was an error while trying to read folder " + cfgpath + " to move cfg files. The error was " + err, "Error")    
                        }
                        else {
                            Utilities.ErrorDialog("There was an error while trying to read cfg folder", "Error")
                        }
                        ElectronLog.error("there was an error on mod_source_base.ts, line 55 when trying to read the cfg directory to move cfg files. Trying to read directory: " + cfgpath + " , the error was:" + err)
                    }
                    
                    else {
                        files.forEach(file => {
                            ElectronLog.log("Checking if should move file: " + file)
                            if(filesToMove.indexOf(file) > -1) {
                                ElectronLog.log("Trying to move file " + path.join(usercfgpath, file) + " to " + path.join(cfgpath, path.basename(file)))
                                fs.rename(path.join(usercfgpath ,file), path.join(cfgpath, path.basename(file)), (err) => {
                                    if (err) {
                                        ElectronLog.error("There was an error trying to move file " + path.join(usercfgpath, file) + " to " + path.join(cfgpath, path.basename(file)))
                                    }
                                })
                            }
                        })
                    }
                })
                break;                        
            default:
                break;
        }
    }
}
export default ModInstallSource