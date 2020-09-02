const marked = require("marked");
marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: false
});

window.addEventListener("DOMContentLoaded", () => {
    var request = new XMLHttpRequest();
    request.open("GET", "https://raw.githubusercontent.com/ampersoftware/Creators.TF-Community-Launcher/master/changelog.md");
    request.send();
    request.onload = () => {
        if (request.status === 200) {
            document.getElementById("patchnotes").innerHTML = marked(request.responseText);
        } else {
            document.getElementById("patchnotes").innerHTML = marked("## If you are reading this, there are two options:\n- Github is down (You can check their status page at `githubstatus.com`)\n- Your internet is down");
        }
    }
});
