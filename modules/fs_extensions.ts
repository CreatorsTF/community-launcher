import { promises } from "fs";
import log from "electron-log";
import path from "path";

class FsExtensions {
    /**
     * catches NotFound-errors 
     * 
     * used to check files/pathes and handle NotFound-errors as 'does not exist'
     * @param {BoolAction} func function to execute
     * @returns {Promise<boolean>} false if NotFound-error occoured, otherwise result from func will be returned
     */
    public static async Exists(func: any): Promise<boolean> {
        try {
            return await func();
        }
        catch(e) {
            if (!FsExtensions.IsNotFoundError(e)) {
                throw e;
            }
            return false;
        }
    }

    public static IsNotFoundError(e) {
        return e.code === "ENOENT";
    }
    
    /**
     * moves a file to a new location
     * returns if oldPath is not a file
     * creates directories if needed
     * @param {string} oldPath origin path
     * @param {string} newPath destination path
     */
    public static async move(oldPath: string, newPath: string): Promise<string> {
        if (!await this.fileExists(oldPath)) {
            return;
        }
        const newDirectory = path.dirname(newPath);
        await this.ensureDirectoryExists(newDirectory);

        await promises.rename(oldPath, newPath);
    }

    /**
     * creates directory, if it does not exist
     * does nothing otherwise
     * @param {string} directory directory to check
     * @returns {Promise<boolean>} true if directory was created, otherwise false
     */
    public static async ensureDirectoryExists(directory: string): Promise<boolean> {
        if(!await this.pathExists(directory)){
            await promises.mkdir(directory, {recursive: true});
            log.log("Created the directory: " + directory);
            return true;
        }
        return false;
    }

    /**
     * checks if a file exists
     * (and is a file)
     * @param {string} path path to check
     * @returns {Promise<boolean>} true if file exists (and is a file), otherwise false
     */
    public static async fileExists(path: string): Promise<boolean> {
        return await FsExtensions.Exists(async() => {
            const stats = await promises.stat(path);
            return stats && stats.isFile();
        });
    }

    /**
     * checks if a path exists
     * @param {string} path path to check
     * @returns {Promise<boolean>} true if path exists, otherwise false
     */
    public static async pathExists(path: string): Promise<boolean> {
        return await FsExtensions.Exists(async() => {
            await promises.stat(path);
            return true;
        });
    }
}

export default FsExtensions;