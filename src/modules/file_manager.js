var fileListPath;
var fs = global.fs;
var process = global.process;

"use strict";

module.exports =
{

Init(){
    fileListPath = this.GetPath();
}, 

GetFileList(modName){
    return new Promise((resolve, reject) => {
        let path = fileListPath + modName + "_files.json";
        if(fs.existsSync(path)){
            resolve(JSON.parse(fs.readFileSync(path, "utf8")));
        }
        else{
            //Make new object and return it.
            resolve( {
                files: []
            });
        }
    });
},

GetFileListSync(modName){
    let path = fileListPath + modName + "_files.json";
    if(fs.existsSync(path)){
        return (JSON.parse(fs.readFileSync(path, "utf8")));
    }
    else{
        //Make new object and return it.
        return ( {
            files: []
        });
    }
},

SaveFileList(filelist, modName){
    return new Promise((resolve, reject) => {
        let path = fileListPath + modName + "_files.json";
        fs.writeFileSync(path, filelist, "utf8");
        resolve();
    });
},

SaveFileListSync(filelist, modName){
    let path = fileListPath + modName + "_files.json";
    fs.writeFileSync(path, JSON.stringify(filelist), 'utf8');
},

RemoveFileList(modName){
    let path = fileListPath + modName + "_files.json";
    if(fs.existsSync(path)) fs.unlinkSync(path);
},

GetPath(){
    let path = (process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")) + "/creators-tf-launcher";
    
    if(!fs.existsSync(path)) fs.mkdirSync(path);

    let fullpath = path + "/";
    return fullpath;
}

};