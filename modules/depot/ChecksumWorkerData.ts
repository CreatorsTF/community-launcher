class ChecksumWorkerData {
    public filePath : string;
    public localMd5Hash : string;
    public remoteMd5Hash : string;
    public remotePath : string;
    
    public computed : boolean;
    public ismatch : boolean;
    public fileExisted : boolean;

    constructor(fPath : string, md5 : string, remotePath : string){
        this.filePath = fPath;
        this.remoteMd5Hash = md5;
        this.localMd5Hash = "";
        this.computed = false;
        this.ismatch = false;
        this.fileExisted = false;
        this.remotePath = remotePath;
    }
}

export {ChecksumWorkerData};