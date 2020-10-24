class ChecksumWorkerData {
    public filePath : string;
    public md5Hash : string;

    private computed : boolean;
    private ismatch : boolean;

    constructor(fPath : string, md5 : string){
        this.filePath = fPath;
        this.md5Hash = md5;
        this.computed = false;
        this.ismatch = false;
    }

    public SetIsMatch(value : boolean){
        this.ismatch = value;
        this.computed = true;
    }

    public GetIsComputed() : boolean{
        return this.computed;
    }

    public GetIsMatch() : boolean{
        return this.ismatch;
    }
}

export default ChecksumWorkerData;