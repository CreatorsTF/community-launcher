const fsp = require('fs/promises')

const process = global.process;
const fs = global.fs;
const os = global.os;
const path = global.path;

const pathStringRegex = new RegExp(/("(\S+[:]+[\S]+)")/, 'g'); //Home made regex to find a path. May not be perfect.

module.exports = {
    config: null,
    
    //Save the config given.
    SaveConfig (_config) {
        let filepathfull = this.GetConfigFullPath();

        fs.writeFileSync(filepathfull, JSON.stringify(_config), 'utf8');
        global.log.log("Config file was saved.");
    },

    //Get the config from disk.
    GetConfig: async function GetConfig() {
        //If config is null, load it.
        let filepathfull = this.GetConfigFullPath();

        //If the config file exists, read and parse it.
        if(fs.existsSync(filepathfull)){
            this.config = JSON.parse(fs.readFileSync(filepathfull, 'utf8'));
            global.log.log("Loaded pre existing config");
            return this.config;
        } else {
            global.log.log("User does not have a config file, creating one");
            //Create default config
            this.config = {
                steam_directory: "",
                tf2_directory: "",
                current_mod_versions: []
            }

            //Try to populate the default values of the steam directory and tf2 directory automatically.
            this.config.steam_directory = await GetSteamDirectory();

            global.log.log(`Auto locater for the users steam directory returned '${this.config.steam_directory}'`);

            if(this.config.steam_directory != "") {
                //Try to find the users tf2 directory automatically.
                try {
                    let result = await this.GetTF2Directory(this.config.steam_directory)

                    global.log.log("TF2 directory was found successfully at: " + result);
                    this.config.tf2_directory = result;
                } catch {
                    global.log.error("TF2 directory was not found automatically");
                }
            }
            //Return whether or not the TF2/Steam directory was found
            //User is told later anyway.
            this.SaveConfig(this.config);
            return this.config;
        }
    },

    //This attempts to find the users tf2 directory automatically.
    GetTF2Directory: async function GetTF2Directory(steamdir) {
        let tf2path = "steamapps/common/Team Fortress 2/";

        //Check if tf2 is installed in the steam installation steamapps.
        if (fs.existsSync(path.join(steamdir, tf2path))) {
            tf2path = path.join(steamdir, tf2path);
            return tf2path;
        } else {
            //Check the library folders file and check all those for the tf2 directory.
            let libraryfolders = `${steamdir}/steamapps/libraryfolders.vdf`;
            if (fs.existsSync(libraryfolders)) {
                //How this works:
                //Read the lines of the libraryfolders
                //If we find a match with the regular expression, we have a possible other library folder.
                //We check this library folder to see if it has a tf2 install folder.
                //If yes, we use this!
                //If no, we just fail.

                let data = fs.readFileSync(libraryfolders, 'utf8');
                let lines = data.split("\n");
                for (let i = 0; i < lines.length; i++) {
                    let result = pathStringRegex.exec(lines[i]);
                    if (result) {
                        if (result[2]) {
                            let potentialPath = path.join(result[2], "/", tf2path);
                            if(fs.existsSync(potentialPath)){
                                return potentialPath;
                            }
                        }
                    }
                }
                throw new Error("No other tf2 libraries had TF2");
            } else {
                throw new Error("TF2 not found in base install location, no other libraries found.");
            }
        }
    },

    GetConfigFullPath(){
        let _path = (process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")) + "/creators-tf-launcher";
        
        if(!fs.existsSync(_path)) fs.mkdirSync(_path);
    
        let fullpath = path.join(_path, configname);
        return fullpath;
    }
};

var configname = "config.json";

//Attempts to locate the steam directory automatically.
//This aids in finding the tf2 dir later.
async function GetSteamDirectory() {
    const paths = [
      path.join("C:", "Program Files (x86)", "Steam"),
      path.join("C:", "Program Files", "Steam"),
      path.join(process.env.HOME, ".steam", "steam"),
      path.join(process.env.HOME, ".local", "share", "Steam"),
    ];

    for (const path of paths) {
      if (await fsp.exists(path)) {
        return path;
      }
    }

    return "";
}
