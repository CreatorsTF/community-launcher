import type { IpcRenderer } from "electron";

var ipcRenderer: IpcRenderer;
//@ts-ignore
ipcRenderer = window.renderer;

const types = document.getElementById("quickplay-type");
const region = document.getElementById("quickplay-region");
const mission = document.getElementById("quickplay-mission");
const maps = document.getElementById("quickplay-maps");

ipcRenderer.on("quickplay-setup", (quickplayConfig : any) => {
    
})