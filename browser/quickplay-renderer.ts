import type { IpcRenderer } from "electron";
import { create, ElectronLog } from "electron-log";
import type { QuickPlayConfig, QuickPlayGameType } from "../modules/remote_file_loader/quickplay_config_loader";
import type { CreateMatchCommandParams } from "../modules/api/quickplay/CreateMatchCommand";
import type { MatchStatusResponse, MatchmakingStatusServer } from "../modules/api/quickplay/MatchStatusCommand";

var ipcRenderer: IpcRenderer;
var log: ElectronLog;
//@ts-ignore
ipcRenderer = window.ipcRenderer; log = window.log;

const mapThumb = 'https://creators.tf/api/mapthumb?map=';
const notSelectedOpacity = "0.5";
const selectedOpacity = "1";

const quickplay = document.getElementById("quickplay");
const maps = document.getElementById("maps");
const mapsContent = maps.querySelector(".content");
const missions = document.getElementById("missions");
const missionsContent = missions.querySelector(".content");
const types = <HTMLSelectElement>document.getElementById("quickplay-type");
const region = <HTMLSelectElement>document.getElementById("quickplay-region");
const searchButton = <HTMLButtonElement>document.getElementById("quickplay-search");
const quickplayResult = document.getElementById("quickplay-result");
var quickplayConfig: QuickPlayConfig;
var quickplayTypes: Map<string, QuickPlayGameType>;
var selectedMaps = new Array<string>();

ipcRenderer.on("quickplay-setup", (event : any, sentConfig : any) => {
    log.log("Setting up Quickplay");
    quickplayConfig = <QuickPlayConfig>sentConfig;
    quickplayTypes = new Map<string, QuickPlayGameType>();

    for(let type of quickplayConfig.quickplayTypes){
        quickplayTypes.set(type.type, type);

        types.appendChild(NewOption(type.type));
    }

    SetupToggle(quickplay);
    quickplay.querySelectorAll(".quickplay-toggle").forEach((element) => {
        SetupToggle(element);
    });

    //Setup initally with the first element
    ShowOptionsForType(quickplayConfig.quickplayTypes[0]);
    searchButton.addEventListener("click", Search);
});

ipcRenderer.on("quickplay-search-reply", (event, arg) => {
    searchButton.innerText = "Searching...";
    searchButton.disabled = true;
});

ipcRenderer.on("quickplay-search-success", (event, arg) => {
    searchButton.innerText = "Search";
    searchButton.disabled = false;
    let results = <MatchStatusResponse>arg;
    //Display server with best result
    ShowSerchResults(results.servers);
});

ipcRenderer.on("quickplay-search-fail", (event, arg) => {
    searchButton.innerText = "Search";
    searchButton.disabled = false;

    log.error("Got search failed result back");
});

function Search(){
    if(selectedMaps.length > 0) {
        let createMatchArgs = <CreateMatchCommandParams>{};
        createMatchArgs.maps = selectedMaps;
        createMatchArgs.region = region.value;
        createMatchArgs.missions = [];
        createMatchArgs.region_locked = false;

        ipcRenderer.send("quickplay-search", createMatchArgs);
    }
}

function ShowSerchResults(servers : MatchmakingStatusServer[]){

}

function SetupToggle(toggle: Element) {
    // Get each trigger element
    let btn = toggle.children[0];//toggle.querySelector(":scope > .trigger");
    // Get content
    let content = toggle.children[1];//toggle.querySelector(":scope > .content");
    btn.addEventListener("click", () => {
        btn.setAttribute("aria-expanded", btn.getAttribute("aria-expanded") === "false" ? "true" : "false");
        toggle.setAttribute(
            "data-drawer-showing",
            toggle.getAttribute("data-drawer-showing") === "true" ? "false" : "true"
        );
        content.setAttribute(
            "aria-hidden",
            content.getAttribute("aria-hidden") === "true" ? "false" : "true"
        );
    });
}

function ShowOptionsForType(type: QuickPlayGameType){
    region.innerHTML = "";
    PopulateOptions(region, type.regions);
    
    if(type.map_categories != null && type.map_categories.length > 0){
        maps.style.display = "flex";
        missions.style.display = "none";

        for(let category of type.map_categories){
            let maps = new Array<Element>();
            for(let m of category.maps){
                maps.push(CreateMapElement(m));
            }

            let toggle = CreateToggleSection(category.name, maps);
            mapsContent.appendChild(toggle);
        }
    }
    else if(type.missions != null && type.missions.length > 0){
        maps.style.display = "none";
        missions.style.display = "flex";

        alert("Missions do not work in this version, please update!");
        //Not implemented yet
    }
    else{
        //??
    }
}

function CreateToggleSection(name: string, children: Element[]){
    let element = document.createElement("div");
    element.className = "quickplay-toggle";
    let trigger = document.createElement("div");
    trigger.className = "trigger";
    element.appendChild(trigger);
    trigger.innerHTML = `<h2>${name}</h2>`;
    let content = document.createElement("div");
    content.className = "content";
    for(let c of children){
        content.appendChild(c);
    }
    element.appendChild(content);
    SetupToggle(element);
    return element;
}

function CreateMapElement(map: string): Element{
    let element = document.createElement("div");
    element.className = "map";
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    element.addEventListener("click", () => {
        let index = selectedMaps.indexOf(map);
        if(index != -1) {
            //De select map
            selectedMaps.splice(index, 1);
            element.style.opacity = notSelectedOpacity;
            checkbox.checked = false;
        }
        else {
            //Select map
            selectedMaps.push(map);
            element.style.opacity = selectedOpacity;
            checkbox.checked = true;
        }
    });

    element.appendChild(checkbox);
    element.innerHTML += `<h3>${map.toUpperCase()}</h3>`;
    element.style.backgroundImage = `url(${mapThumb}${map})`;
    element.style.opacity = notSelectedOpacity;
    return element;
}

function PopulateOptions(select: HTMLSelectElement, options: string[]){
    for(let option of options){
        select.appendChild(NewOption(option));
    }
}

function NewOption(value: string): HTMLOptionElement {
    let newOption = <HTMLOptionElement>document.createElement("option");
    newOption.innerText = value;
    newOption.value = value;
    return newOption;
}