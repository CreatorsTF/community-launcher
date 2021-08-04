import marked from "marked";

marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: false,
    baseUrl: "https://creators.tf/",
    smartypants: true,
    sanitize: false
});

window.addEventListener("DOMContentLoaded", () => {
    fetch("https://raw.githubusercontent.com/ampersoftware/Creators.TF-Community-Launcher/master/changelog.md").then((res) => {
        if (res.status === 200) {
            res.text().then((data) => {
                document.getElementById("patchnotes").innerHTML = marked(data);
            });
        } else {
            document.getElementById("patchnotes").innerHTML = marked("## If you are reading this, there are two options:\n- Github is down (You can check their status page at `githubstatus.com`)\n- Your internet is down");
        }
    }).catch((err) => {
        console.log("Error fetching the latest changelog! Error: " + err);
    });
});
