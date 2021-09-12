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
    fetch("https://raw.githubusercontent.com/CreatorsTF/Creators.TF-Community-Launcher/master/changelog.md").then(async (res) => {
        if (res.status === 200) {
            res.text().then((data) => {
                document.getElementById("patchnotes").innerHTML = marked(data);
            });
        } else {
            const fallbackChangelogLocalFile = fetch("../changelog.md").then((res) => res.text());
            document.getElementById("patchnotes").innerHTML = marked(await fallbackChangelogLocalFile);
        }
    }).catch((err) => {
        console.log("Error fetching the latest changelog! Error: " + err);
    });
});
