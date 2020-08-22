// var launcherversionBox = document.getElementById("launcherversion");
// const config = require("./package.json");
// const currentClientVersion = config.version;
//
// let request = new XMLHttpRequest();
// request.open("GET", "https://api.github.com/repos/ampersoftware/Creators.TF-Community-Launcher/releases/latest");
// request.send();
// request.onload = () => {
//     if (request.status === 200) {
//         var answer = JSON.parse(request.response);
//         var version = answer.name;
//         if (currentClientVersion === version) {
//             launcherversionBox.remove();
//         } else {
//             launcherversionBox.innerText = "A new update is available but it seems you don't have\nauto-update working.\nCheck the website to download the new version.";
//         }
//     } else {
//         console.log("Status: " + `${request.status}` + "\nMessage: " + `${request.statusText}`);
//     }
// }
