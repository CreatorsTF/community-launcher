import Main from "../main";
import fs from "fs";
import ProgressBar from 'electron-progressbar';
import jszip from "jszip";
import path from "path";
import log from "electron-log";
import { FILE } from "node:dns";

const loadingTextStyle = {
    color: "ghostwhite"
}

class FileWriter
{
    public static async ExtractZip(targetPath : string, data : Buffer, fileManagerObject : any) : Promise<boolean> {
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

        return new Promise(async (resolve, reject) => {
            progressBar.on('aborted', function() {
                active = false;
                reject("Extraction aborted by user. You will need to re start the installation process to install this mod.");
            });

            try{
            var zip = await jszip.loadAsync(data.buffer);
            progressBar.maxValue = zip.length;
            let filesWritten = 0;
            zip.forEach(
                async (relativePath: string, file: jszip.JSZipObject) => {
                    try{
                        if(!active) reject("Cancelled by the user.");

                        let fullPath = path.join(targetPath, relativePath);
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
                            if(!fileManagerObject.files.includes(fullPath))
                            fileManagerObject.files.push(fullPath);
                            
                            filesWritten++;
                            progressBar.value = filesWritten;
                        }
                        
                        if(filesWritten >= zip.length){
                            active = false;
                            progressBar.setCompleted();
                            progressBar.close();
                            resolve(true);
                        }
                    }
                    catch(innerError){
                        reject(innerError.toString());
                    }
                }
            );
            }
            catch(e){
                reject(e.toString());
            }
        });
    }
}

export default FileWriter