import fs from "fs";
import path from "path";
import {Utilities} from "../utilities";

class ChecksumCache {

    private cachePath : string;
    private name : string;

    constructor (name : string){
        this.name = name;
        this.cachePath = path.join(Utilities.GetDataFolder(), "depot_checksum_cache");
    }

    public GetFileChecksum(filePath : string) : string {
        return "";
    }



}

export default ChecksumCache;