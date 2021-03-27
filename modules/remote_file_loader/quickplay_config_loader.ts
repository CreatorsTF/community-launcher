import RemoteLoader, { RemoteFile } from "./remote_file_loader";

class QuickPlayConfigLoader extends RemoteLoader<QuickPlayConfig>
{
    localFileName = "quickplay.json";
    remoteUrls = [
        "https://localhost"
    ];
    
}

class QuickPlayConfig extends RemoteFile
{
    regions: string[];
    maps: string[];
    missions: string[];
}