var ipcRenderer;
var log;
ipcRenderer = window.ipcRenderer;
log = window.log;
var mapThumb = 'https://creators.tf/api/mapthumb?map=';
var notSelectedOpacity = "0.5";
var selectedOpacity = "1";
var quickplay = document.getElementById("quickplay");
var maps = document.getElementById("maps");
var mapsContent = maps.querySelector(".content");
var missions = document.getElementById("missions");
var missionsContent = missions.querySelector(".content");
var types = document.getElementById("quickplay-type");
var region = document.getElementById("quickplay-region");
var quickplayConfig;
var quickplayTypes;
var selectedMaps = new Array();
ipcRenderer.on("quickplay-setup", function (event, sentConfig) {
    log.log("Setting up Quickplay");
    quickplayConfig = sentConfig;
    quickplayTypes = new Map();
    for (var _i = 0, _a = quickplayConfig.quickplayTypes; _i < _a.length; _i++) {
        var type = _a[_i];
        quickplayTypes.set(type.type, type);
        types.appendChild(NewOption(type.type));
    }
    ShowOptionsForType(quickplayConfig.quickplayTypes[0]);
    SetupToggle(quickplay);
    quickplay.querySelectorAll(".quickplay-toggle").forEach(function (element) {
        SetupToggle(element);
    });
});
function SetupToggle(toggle) {
    var btn = toggle.querySelector(":scope > .trigger");
    var content = toggle.querySelector(":scope > .content");
    btn.addEventListener("click", function () {
        btn.setAttribute("aria-expanded", btn.getAttribute("aria-expanded") === "false" ? "true" : "false");
        toggle.setAttribute("data-drawer-showing", toggle.getAttribute("data-drawer-showing") === "true" ? "false" : "true");
        content.setAttribute("aria-hidden", content.getAttribute("aria-hidden") === "true" ? "false" : "true");
    });
}
function ShowOptionsForType(type) {
    region.innerHTML = "";
    PopulateOptions(region, type.regions);
    if (type.map_categories != null && type.map_categories.length > 0) {
        maps.style.display = "flex";
        missions.style.display = "none";
        for (var _i = 0, _a = type.map_categories; _i < _a.length; _i++) {
            var category = _a[_i];
            var maps_1 = new Array();
            for (var _b = 0, _c = category.maps; _b < _c.length; _b++) {
                var m = _c[_b];
                maps_1.push(CreateMapElement(m));
            }
            var toggle = CreateToggleSection(category.name, maps_1);
            mapsContent.appendChild(toggle);
        }
    }
    else if (type.missions != null && type.missions.length > 0) {
        maps.style.display = "none";
        missions.style.display = "flex";
        alert("Missions do not work in this version, please update!");
    }
    else {
    }
}
function CreateToggleSection(name, children) {
    var element = document.createElement("div");
    element.className = "quickplay-toggle";
    var trigger = document.createElement("div");
    trigger.className = "trigger";
    element.appendChild(trigger);
    trigger.innerHTML = "<h2>" + name + "</h2>";
    var content = document.createElement("div");
    content.className = "content";
    for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
        var c = children_1[_i];
        content.appendChild(c);
    }
    element.appendChild(content);
    SetupToggle(element);
    return element;
}
function CreateMapElement(map) {
    var element = document.createElement("div");
    element.className = "map";
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    element.addEventListener("click", function () {
        var index = selectedMaps.indexOf(map);
        if (index != -1) {
            selectedMaps.splice(index, 1);
            element.style.opacity = notSelectedOpacity;
            checkbox.checked = false;
        }
        else {
            selectedMaps.push(map);
            element.style.opacity = selectedOpacity;
            checkbox.checked = true;
        }
    });
    element.appendChild(checkbox);
    element.innerHTML += "<h3>" + map.toUpperCase() + "</h3>";
    element.style.backgroundImage = "url(" + mapThumb + map + ")";
    element.style.opacity = notSelectedOpacity;
    return element;
}
function PopulateOptions(select, options) {
    for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
        var option = options_1[_i];
        select.appendChild(NewOption(option));
    }
}
function NewOption(value) {
    var newOption = document.createElement("option");
    newOption.innerText = value;
    return newOption;
}
export {};
//# sourceMappingURL=quickplay-renderer.js.map