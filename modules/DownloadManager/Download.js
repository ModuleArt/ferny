const EventEmitter = require("events");

const bytesToSize = require(__dirname + "/../bytesToSize.js");
const percent = require(__dirname + "/../percent.js");

class Download extends EventEmitter {
    id = null;
    name = null;
    url = null;
    time = null;
    path = null;
    node = null;

    constructor(id, name, url, time) {
        super();

        this.id = id;
        this.name = name;
        this.url = url;
        this.time = time;

        this.node = document.createElement("button");
        this.node.classList.add("download-item");
        this.node.name = id;
        this.node.id = "download-" + id;
        this.node.innerHTML = `
            <div class="download-body">
                <label class="download-label">Status:</label><label class="download-status">Started</label><br>
                <label class="download-label">File:</label><label class="download-name">${name}</label><br>
                <label class="download-label">URL:</label><label class="download-url">${url}</label><br>
                <label class="download-label">Path:</label><label class="download-path">Unknown</label>
            </div>
            <div class="download-buttons"></div>
        `;
    }

    getNode() {
        return this.node;
    }

    getId() {
        return this.id;
    }

    setStatusInterrupted() {
        this.node.getElementsByClassName("download-status")[0].innerHTML = "Interrupted";

        return null;
    }

    setStatusDone(path) {
        this.path = path;
        this.node.getElementsByClassName("download-status")[0].innerHTML = "Completed";
        this.node.getElementsByClassName("download-path")[0].innerHTML = path;

        this.node.getElementsByClassName("download-buttons")[0].innerHTML = `
            <div class="nav-btn" onclick="showItemInFolder('${path.replace(/\\/g, "/")}')">
                <img class="theme-icon" name="folder-16">
                <label>Folder</label>
            </div>
            <div class="nav-btn" onclick="openItem('${path.replace(/\\/g, "/")}')">
                <img class="theme-icon" name="file-16">
                <label>Open</label>
            </div>
            <div class="nav-btn" onclick="removeDownload(${this.id})">
                <img class="theme-icon" name="delete-16">
                <label>Remove</label>
            </div>
        `;

        this.emit("status-changed");
        return null;
    }

    setStatusFailed() {
        this.node.getElementsByClassName("download-status")[0].innerHTML = "Failed";

        return null;
    }

    setStatusPause(bytes, total) {
        this.node.getElementsByClassName("download-status")[0].innerHTML = `
            Paused - ${percent(bytes, total)}% (${bytesToSize(bytes)} / ${bytesToSize(total)})
        `;

        return null;
    }

    setProcess(bytes, total) {
        this.node.getElementsByClassName("download-status")[0].innerHTML = `
            Downloading - ${percent(bytes, total)}% (${bytesToSize(bytes)} / ${bytesToSize(total)})
        `;

        return null;
    }
}

module.exports = Download;