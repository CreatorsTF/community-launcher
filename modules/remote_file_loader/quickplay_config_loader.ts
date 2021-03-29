import RemoteLoader, { RemoteFile } from "./remote_file_loader";

class QuickPlayConfigLoader extends RemoteLoader<QuickPlayConfig>
{
    static instance = new QuickPlayConfigLoader();

    localFileName = "quickplay.json";
    remoteUrls = [
        "https://localhost"
    ];
    
}

class QuickPlayConfig extends RemoteFile
{
    regions: string[];
    region_names: any;
    maps: string[];
    missions: string[];
}

export default QuickPlayConfigLoader;
export {QuickPlayConfig};