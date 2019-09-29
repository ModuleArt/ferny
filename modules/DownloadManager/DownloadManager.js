if (!document) {
    throw Error("DownloadManager module must be called in renderer process");
}

const EventEmitter = require("events");

const Download = require(__dirname + "/Download.js");

class DownloadManager extends EventEmitter {
    downloads = [];
    downloadContainer = null;

    constructor(downloadContainer) {
        super();

        this.downloadContainer = downloadContainer;
    }

    appendDownload(begin, id, name, url, time) {
        let download = new Download(id, name, url, time);

        download.on("status-changed", () => {
            this.emit("download-status-changed");
        });

        this.downloads.push(download);

        if(begin) {
            this.downloadContainer.insertBefore(download.getNode(), this.downloadContainer.firstChild);
        } else {
            this.downloadContainer.appendChild(download.getNode());
        }
    }

    getDownloadById(id) {
        for(let i = 0; i < this.downloads.length; i++) {
            if(this.downloads[i].getId() == id) {
                return this.downloads[i];
            }
        }
    }
}

module.exports = DownloadManager;