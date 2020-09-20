module.exports.ModInstallSource = class ModInstallSource {
    data = {};
    fileType = "UNKNOWN";
    submod = "";
    currentSubmod = null;
    constructor(mod_data, submod = ""){
        this.data = mod_data;
        this.submod = submod;
    }
    GetLatestVersionNumber(){};
    GetFileURL(){};
    /**
     * Returns the current install data for the currently selected submod if avaliable. Otherwise returns normal install data.
     * @returns Current Install data
     */
    GetInstallData(){
        if(this.data.hasOwnProperty("submods") && this.data.submods.length > 0){
            if(this.currentSubmod == null){
                const submods = this.data.submods;

                var useDefault = (submod == undefined || submod == null || submod == "" || submod == "default");

                for(var submod of submods){
                    //Look for the current submod.
                    if(useDefault){
                        if(submod.default){
                            this.currentSubmod = submod;
                            return submod.install;
                        }
                    }
                    else if(submod.name == this.submod){
                        this.currentSubmod = submod;
                        return submod.install;
                    }
                }
            }
            else return this.currentSubmod.install;

            return null;
        }
        //We dont have submods, just use the normal install data.
        else return this.data.install;
    }

    SetSubmod(submodName){
        this.submod = submodName;
    }
}