//Small script to fix names in newly build distributables.

const fs = require("fs");
const path = require("path");
const {Utilities} = require("./modules/utilities");

const buildPath = path.join(__dirname, "dist", Utilities.GetCurrentVersion().toString());

//Find setup files and fix their names.
var allFiles = fs.readdirSync(buildPath);
for(let file of allFiles) {
    if(file.includes("Setup")){
        var newName = file.replace(/ /g, "-");
        fs.renameSync(path.join(buildPath, file), path.join(buildPath, newName));
        console.log(`Renamed ${file} to ${newName}`);
    }
}

console.log("Done fixing file names");