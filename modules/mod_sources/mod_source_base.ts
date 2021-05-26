import {Install, ModListEntry} from '../mod_list_loader'


abstract class ModInstallSource {
    data: Install[];
    fileType = "UNKNOWN";

    constructor(install_data : Install[]){
        this.data = install_data;
    }
    abstract GetLatestVersionNumber() : Promise<number>;
    abstract GetDisplayVersionNumber(): Promise<string>;
    abstract GetFileURL(asset_index? : number) : Promise<string>;
}
export default ModInstallSource