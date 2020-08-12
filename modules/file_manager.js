require('../typedefs.js')
const fsPromises = require("fs").promises;

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

async SaveFileList(filelist, modName){
    let path = fileListPath + modName + "_files.json";
    await fsPromises.writeFile(path, JSON.stringify(filelist), "utf8");
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
},

/**
 * moves a file to a new location
 * returns if oldPath is not a file
 * creates directories if needed
 * @param {string} oldPath origin path
 * @param {string} newPath destination path
 */
async Move(oldPath, newPath) {
    if (!await FileExists(oldPath))
        return;

    let newDirectory = global.path.dirname(newPath);
    if (!await PathExists(newDirectory))
        await fsPromises.mkdir(newDirectory, { recursive: true });

    await fsPromises.rename(oldPath, newPath);
}

};

/**
 * checks if a file exists
 * (and is a file)
 * @param {string} path path to check
 * @returns {boolean} true if file exists (and is a file), otherwise false
 */
async function FileExists(path) {
    return await Exists(async () => {
        const stats = await fsPromises.stat(path);
        return stats && stats.isFile();
    });
}

/**
 * checks if a path exists
 * @param {string} path path to check
 * @returns {boolean} true if path exists, otherwise false
 */
async function PathExists(path) {
    return await Exists(async () => { await fsPromises.stat(path); return true; });
}
/**
 * catches NotFound-errors 
 * 
 * used to check files/pathes and handle NotFound-errors as 'does not exist'
 * @param {BoolAction} func function to execute
 * @returns {boolean} false if NotFound-error occoured, otherwise result from func will be returned
 */
async function Exists(func) {
    try {
        return await func();
    } catch (e) {
        if (!IsNotFoundError(e))
            throw e;
        return false;
    }
}

function IsNotFoundError(e) {
    return e.code === "ENOENT";
}