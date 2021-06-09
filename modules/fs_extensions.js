const fsPromises = require("fs").promises;
const log = require("electron-log");

"use strict";

const extensions = function() {
    /**
     * catches NotFound-errors 
     * 
     * used to check files/pathes and handle NotFound-errors as 'does not exist'
     * @param {BoolAction} func function to execute
     * @returns {Promise<boolean>} false if NotFound-error occoured, otherwise result from func will be returned
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


    return {
        /**
         * moves a file to a new location
         * returns if oldPath is not a file
         * creates directories if needed
         * @param {string} oldPath origin path
         * @param {string} newPath destination path
         */
        async move(oldPath, newPath) {
            if (!await this.fileExists(oldPath))
                return;
        
            let newDirectory = global.path.dirname(newPath);
            await this.ensureDirectoryExists(newDirectory);
        
            await fsPromises.rename(oldPath, newPath);
        },

        /**
         * creates directory, if it does not exist
         * does nothing otherwise
         * @param {string} directory directory to check
         * @returns {Promise<boolean>} true if directory was created, otherwise false
         */
        async ensureDirectoryExists(directory) {
            if(!await this.pathExists(directory)){
                await fsPromises.mkdir(directory, {recursive: true});
                log.log("Made the directory: " + directory);
                return true;
            }

            return false;
        },

        /**
         * checks if a file exists
         * (and is a file)
         * @param {string} path path to check
         * @returns {Promise<boolean>} true if file exists (and is a file), otherwise false
         */
        async fileExists(path) {
            return await Exists(async () => {
                const stats = await fsPromises.stat(path);
                return stats && stats.isFile();
            });
        },
        
        /**
         * checks if a path exists
         * @param {string} path path to check
         * @returns {Promise<boolean>} true if path exists, otherwise false
         */
        async pathExists(path) {
            return await Exists(async () => { await fsPromises.stat(path); return true; });
        }
    };
}();

module.exports = Object.assign(fsPromises, extensions); 