import Main from "../main";
import fs from "fs";
import ProgressBar from 'electron-progressbar';
import jszip from "jszip";
import path from "path";
import log from "electron-log";
import filemanager from "./file_manager";

const loadingTextStyle = {
    color: "ghostwhite"
}

class FileWriter
{
    public static async ExtractZip(targetPath : string, data : Buffer, currentModName : string) : Promise<boolean> {
        let fileListObject = await filemanager.GetFileList(currentModName);

        let active = true;
        var progressBar = new ProgressBar({
            indeterminate: false,
            text: 'Extracting data',
            detail: 'Starting data extraction...',
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
            }
        });

        progressBar.on('completed', function() {
            progressBar.detail = 'Extraction completed. Exiting...';
        });

        //Create the target directory if it doesnt exist somehow.
        if(!fs.existsSync(targetPath)){
            fs.mkdirSync(targetPath, {recursive: true});
        }

        progressBar.on('aborted', function() {
            active = false;
            throw new Error("Extraction aborted by user. You will need to re start the installation process to install this mod.");
        });

        var zip = await jszip.loadAsync(data.buffer);
        let allFiles = Object.values(zip.files);
        progressBar.maxValue = allFiles.length;
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
                fs.writeFileSync(fullPath, data);
                progressBar.detail = `Wrote ${file.name}. Total Files Written: ${filesWritten}.`;
                log.log("ExtractZip: Wrote file: " + fullPath);
                
                    //Add file that we wrote to the file list
                if(!fileListObject.files.includes(fullPath))
                fileListObject.files.push(fullPath);
                
                filesWritten++;
                progressBar.value = filesWritten;
            }
        }
        active = false;
        progressBar.setCompleted();
        progressBar.close();
        filemanager.SaveFileList(fileListObject, currentModName);
        return true;
    }
}

export default FileWriter