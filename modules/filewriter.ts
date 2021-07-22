import Main from "../main";
import fs from "fs";
import ProgressBar from "electron-progressbar";
import jszip from "jszip";
import path from "path";
import log from "electron-log";
import filemanager from "./file_manager";

const loadingTextStyle = {
    color: "ghostwhite"
}

class FileWriter
{
    /**
     * Extract a ZIP file to the target directory.
     * @param targetPath Path to write all contents
     * @param data ZIP file as a buffer
     * @param currentModName Current mod name for this operation.
     * @returns If this was succcessful.
     */
    public static async ExtractZip(targetPath: string, data: Buffer, currentModName: string): Promise<boolean> {
        let fileListObject = await filemanager.GetFileList(currentModName);

        let active = true;
        let progressBar = new ProgressBar({
            indeterminate: false,
            text: "Extracting data",
            detail: "Starting data extraction...",
            abortOnError: true,
            closeOnComplete: false,
            browserWindow: {
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false
                },
                parent: Main.mainWindow,
                modal: true,
                title: "Extracting files...",
                backgroundColor: "#2b2826",
                closable: true
            },
            style: {
                text: loadingTextStyle,
                detail: loadingTextStyle,
                value: loadingTextStyle
            },
            maxValue: 1
        });

        progressBar.on("completed", () => {
            progressBar.detail = "Extraction completed. Exiting...";
        });

        //Create the target directory if it doesnt exist somehow.
        if(!fs.existsSync(targetPath)){
            fs.mkdirSync(targetPath, {recursive: true});
        }

        progressBar.on("aborted", () => {
            active = false;
            throw new Error("Extraction aborted by the user. You will need to restart the installation process to install this mod.");
        });

        var zip = await jszip.loadAsync(data.buffer);
        let allFiles = Object.values(zip.files);
        let filesWritten = 0;
        for(let i = 0; i < allFiles.length; i++){
            if(!active) return false;
            let file = allFiles[i];
            let fullPath = path.join(targetPath, file.name);
            if(file.dir){
                //Make missing directories syncronously as they MUST exist before we write.
                fs.mkdirSync(fullPath, {recursive: true});
                log.log("ExtractZip: Wrote directory: " + fullPath);
            }
            else {
                let data = await zip.file(file.name).async("uint8array");

                //Check and make missing folder paths anyway as we cannot guarantee the order of the elements given from JSZip.
                //Check for the directory and write the file synchronously, otherwise missing path errors can happen. Do NOT change.
                let folderPathOnly = path.dirname(fullPath);
                if(!fs.existsSync(folderPathOnly)){
                    fs.mkdirSync(folderPathOnly, {recursive: true});
                }
                fs.writeFileSync(fullPath, data);

                //Add file that we wrote to the file list
                if (!fileListObject.files.includes(fullPath)) {
                    fileListObject.files.push(fullPath);
                }
                filesWritten++;
                log.log(`ExtractZip: Wrote file: ${fullPath} (${i}/${allFiles.length})`);
                try {
                    progressBar.detail = `Wrote ${file.name}. Total Files Written: ${filesWritten}.`;
                    progressBar.value = i / allFiles.length;
                }
                catch(e){
                    log.error("Error when trying to set progressbar data: " + e.toString());
                }
            }
        }
        active = false;
        progressBar.setCompleted();
        progressBar.close();
        filemanager.SaveFileList(fileListObject, currentModName);
        log.log("Update mod file list successfully.");
        return true;
    }
}

export default FileWriter