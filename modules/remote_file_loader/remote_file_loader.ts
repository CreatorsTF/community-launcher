import axios from "axios";
import fs from "fs";
import Utilities from "../utilities";
import path from "path";
import ElectronLog from "electron-log";

abstract class RemoteLoader <T extends RemoteFile>
{
    private lastDownloaded : T;
    protected localFile : T;
    abstract localFileName: string;
    abstract remoteUrls : Array<string>;

    public LoadLocalFile(): void{
        this.localFile = this.GetLocalFile();
    }

    /**
     * Load the most current version of this file type
     */
    public GetFile() : T {
        return this.localFile;
    }

    /**
     * Update the local mod list file on disk to contain the latest data we found.
     */
    public UpdateLocalFile() : boolean {
        if(this.lastDownloaded != null && this.localFile.version < this.lastDownloaded.version){
            const configPath = path.join(Utilities.GetDataFolder(), this.localFileName);
            fs.writeFileSync(configPath, JSON.stringify(this.lastDownloaded));
            return true;
        }
        return false;
    }

    // Check if there is a newer mod list online.
    // Also checks if the internal version is newer than the local, written version.
    public async CheckForUpdates() : Promise<boolean> {
        ElectronLog.log(`Checking for remote file updates for : ${this.localFileName}`);

        try{
            for(let i = 0; i < this.remoteUrls.length; i++){
                const url = this.remoteUrls[i];
                //Soo ts shuts up about the method returning any, which it must do otherwise it gets mad.
                //Seems its not very good with async hidden promises...
                let remoteFile;
                try{
                    remoteFile = await <T><unknown>this.TryGetRemoteFile(url);
                }
                catch {
                    continue;
                }

                //Break if we have a valid mod list. If we have null, try again.
                if (remoteFile != null && remoteFile != undefined){
                    this.lastDownloaded = remoteFile;
                    break;
                } 
            }

            if(this.lastDownloaded != null && this.lastDownloaded.version != null){
                ElectronLog.log(`Local mod list version: ${this.localFile.version}, Remote mod list version: ${this.lastDownloaded.version}.`);
                return this.localFile.version < this.lastDownloaded.version;
            }
        }
        catch (error) {
            console.error("Failed to check for updates. " + error.toString());
            return false;
        }
        ElectronLog.log("No mod list updates found.");
        return false;
    }

    private async TryGetRemoteFile(url : string) : Promise<T> {
        ElectronLog.log("Trying to get file from: " + url);
        try{
            const resp = await axios.get(url);
            if(resp.data.hasOwnProperty("version")){
                return <T>resp.data;
            }
            const parsed = JSON.parse(resp.data);
            return <T>parsed;
        }
        catch (error){
            //Json parsing failed soo reject.
            ElectronLog.error(`Failed to get remote file at ${url}, error: ${error.toString()}`);
            throw error;
        }
    }

    public GetLocalFile() : T {
        //Try to load file from our local data, if that doesn't exist, write the internal mod list and return that.
        const internalFileJSON = fs.readFileSync(path.resolve(__dirname, "..", "..", "internal", this.localFileName), {encoding: "utf-8"});
        const internalFile = <T>JSON.parse(internalFileJSON);
        const configPath = path.join(Utilities.GetDataFolder(), this.localFileName);

        if(fs.existsSync(configPath)){
            const localWrittenFile = <T>JSON.parse(fs.readFileSync(configPath, {encoding: "utf-8"}));
            if(localWrittenFile.version > internalFile.version){
                return localWrittenFile;
            }
        }

        //Write the internal mod list then return that too.
        //We also want to re write the internal mod list if its a higher version.
        fs.writeFileSync(configPath, internalFileJSON);
        return <T>JSON.parse(internalFileJSON);
    }

    public DeleteLocalFile() : boolean {
        const configPath = path.join(Utilities.GetDataFolder(), this.localFileName);
        if(fs.existsSync(configPath)){
            fs.unlinkSync(configPath);
            return true;
        }
        return false;
    }
}

class RemoteFile
{
    version: number;
}

export default RemoteLoader
export {RemoteFile}