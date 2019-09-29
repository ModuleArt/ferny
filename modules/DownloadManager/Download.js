const EventEmitter = require("events");
const fileExtension = require("file-extension");
const GetAvColor = require("color.js");

const extToImagePath = require(__dirname + "/../extToImagePath.js");
const bytesToSize = require(__dirname + "/../bytesToSize.js");
const percent = require(__dirname + "/../percent.js");
const epochToDate = require(__dirname + "/../epochToDate.js");
const epochToTime = require(__dirname + "/../epochToTime.js");
const rgbToRgbaString = require(__dirname + "/../rgbToRgbaString.js");

class Download extends EventEmitter {
    id = null;
    name = null;
    url = null;
    time = null;
    path = null;
    status = "started";
    node = null;
    constructor(id, name, url, time) {
        super();

        this.id = id;
        this.name = name;
        this.url = url;
        this.time = time;

        this.node = document.createElement("div");
        this.node.classList.add("download-item");
        this.node.name = id;
        this.node.id = "download-" + id;
        this.node.innerHTML = `
            <div class="download-body">
                <img class="download-icon" src="${extToImagePath(fileExtension(name))}">
                </label><label class="download-name">${name}</label><br>
                <label class="download-url">${url}</label><br>
                <hr>
                <label class="download-status">Started</label>
                <label class="download-time">${epochToDate(time)} / ${epochToTime(time)}</label>
            </div>
            <div class="download-buttons"></div>
        `;

        let color = new GetAvColor(this.node.getElementsByClassName("download-icon")[0]);
        color.mostUsed(result => {
            this.node.style.backgroundColor = rgbToRgbaString(result[0]);
        });
    }

    getNode() {
        return this.node;
    }

    getId() {
        return this.id;
    }

    setStatusInterrupted() {
        this.status = "interrupted";
        this.node.getElementsByClassName("download-status")[0].innerHTML = "Interrupted";

        this.node.getElementsByClassName("download-buttons")[0].innerHTML = `
            <div class="nav-btn" onclick="resumeDownload('${this.id}')" title="Resume download">
                <img class="theme-icon" name="download-16">
                <label>Resume</label>
            </div>
            <div class="nav-btn" onclick="cancelDownload('${this.id}')" title="Cancel download">
                <img class="theme-icon" name="cancel-16">
            </div>
        `;

        this.emit("status-changed");
        return null;
    }

    setStatusDone(path) {
        this.status = "done";
        this.path = path;
        this.node.getElementsByClassName("download-status")[0].innerHTML = "Completed";

        this.node.getElementsByClassName("download-buttons")[0].innerHTML = `
            <div class="nav-btn" onclick="showItemInFolder('${path.replace(/\\/g, "/")}')" title="Show file in folder">
                <img class="theme-icon" name="folder-16">
                <label>Folder</label>
            </div>
            <div class="nav-btn" onclick="openItem('${path.replace(/\\/g, "/")}')" title="Open file">
                <img class="theme-icon" name="file-16">
                <label>Open</label>
            </div>
        `;

        this.emit("status-changed");
        return null;
    }

    setStatusFailed() {
        this.status = "failed";
        this.node.getElementsByClassName("download-status")[0].innerHTML = "Failed";

        this.node.getElementsByClassName("download-buttons")[0].innerHTML = `
            <div class="nav-btn" onclick="retryDownload('${this.url}')" title="Retry download">
                <img class="theme-icon" name="reload-16">
                <label>Retry</label>
            </div>
        `;

        this.emit("status-changed");
        return null;
    }

    setStatusStopped(path) {
        this.status = "stopped";
        this.node.getElementsByClassName("download-status")[0].innerHTML = "Done";

        this.node.getElementsByClassName("download-buttons")[0].innerHTML = "";

        this.emit("status-changed");
        return null;
    }

    setStatusPause(bytes, total) {
        this.status = "pause";
        this.node.getElementsByClassName("download-status")[0].innerHTML = `
            Paused - ${percent(bytes, total)}%<br>(${bytesToSize(bytes)} / ${bytesToSize(total)})
        `;

        this.node.getElementsByClassName("download-buttons")[0].innerHTML = `
            <div class="nav-btn" onclick="resumeDownload('${this.id}')" title="Resume download">
                <img class="theme-icon" name="download-16">
                <label>Resume</label>
            </div>
            <div class="nav-btn" onclick="cancelDownload('${this.id}')" title="Cancel download">
                <img class="theme-icon" name="cancel-16">
            </div>
        `;

        this.emit("status-changed");
        return null;
    }

    setProcess(bytes, total) {
        this.node.getElementsByClassName("download-status")[0].innerHTML = `
            Downloading - ${percent(bytes, total)}%<br>(${bytesToSize(bytes)} / ${bytesToSize(total)})
        `;

        if(this.status !== "processing") {
            this.status = "processing";

            this.node.getElementsByClassName("download-buttons")[0].innerHTML = `
                <div class="nav-btn" onclick="pauseDownload('${this.id}')" title="Pause download">
                    <img class="theme-icon" name="pause-16">
                    <label>Pause</label>
                </div>
                <div class="nav-btn" onclick="cancelDownload('${this.id}')" title="Cancel download">
                    <img class="theme-icon" name="cancel-16">
                </div>
            `;
        }

        this.emit("status-changed");
        return null;
    }
}

module.exports = Download;