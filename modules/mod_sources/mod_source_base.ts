abstract class ModInstallSource {
    data: any;
    fileType = "UNKNOWN";

    constructor(install_data){
        this.data = install_data;
    }
    abstract GetLatestVersionNumber() : Promise<number>;
    abstract GetFileURL() : Promise<string>;
}
export default ModInstallSource