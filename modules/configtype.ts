class ConfigType {
    steam_directory: string;
    tf2_directory: string;
    current_mod_versions: modVersion[]
}

class modVersion {
    name: string;
    version: any;
    collectionversion?: string;
}

export default ConfigType