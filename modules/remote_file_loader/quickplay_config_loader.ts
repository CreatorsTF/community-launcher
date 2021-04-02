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
    quickplayTypes: QuickPlayGameType[];
}

class QuickPlayGameType {
    type: string;
    regions: string[];
    region_names: any;
    map_categories: QuickPlayMapCategory[];
    missions: QuickPlayMissionCategory[];
}

class QuickPlayMapCategory {
    name: string;
    map_icon: string;
    maps: string[];
}

class QuickPlayMissionCategory {
    campaign: string;
    missions: QuickPlayMission[];
}

class QuickPlayMission {
    map: string;
    name: string;
}

export default QuickPlayConfigLoader;
export {QuickPlayConfig, QuickPlayGameType, QuickPlayMapCategory, QuickPlayMissionCategory, QuickPlayMission};