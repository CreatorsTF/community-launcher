const fsPromises = require('./fs_extensions');
var fileListPath;
var process = global.process;

"use strict";

module.exports =
{

async Init(){
    fileListPath = await this.GetPath();
}, 

async GetFileList(modName){
    let path = fileListPath + modName + "_files.json";
    if(await fsPromises.fileExists(path)){
        return JSON.parse(await fsPromises.readFile(path, {encoding: "utf8"}));
    }
    else{
        //Make new object and return it.
        return {
            files: []
        };
    }
},

async SaveFileList(filelist, modName){
    let path = fileListPath + modName + "_files.json";
    await fsPromises.writeFile(path, filelist, "utf-8");
},

async RemoveFileList(modName){
    let path = fileListPath + modName + "_files.json";
    if(fsPromises.fileExists(path)) fsPromises.unlink(path);
},

async GetPath(){
    let path = (process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")) + "/creators-tf-launcher";
    
    await fsPromises.ensureDirectoryExists(path);

    let fullpath = path + "/";
    return fullpath;
}

};