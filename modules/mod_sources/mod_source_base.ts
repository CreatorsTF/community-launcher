abstract class ModInstallSource {
    data: any;
    fileType = "UNKNOWN";

    constructor(install_data) {
        this.data = install_data;
    }
    abstract GetLatestVersionNumber(): Promise<number>;
    abstract GetDisplayVersionNumber(): Promise<string>;
    abstract GetFileURL(): Promise<string>;
}
export default ModInstallSource