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

    insertBeforeDownload(id, name, url, time) {
        let download = new Download(id, name, url, time);
        this.downloads.push(download);
        this.downloadContainer.insertBefore(download.getNode(), this.downloadContainer.firstChild);
    }

    appendDownload(id, name, url, time) {
        let download = new Download(id, name, url, time);
        this.downloads.push(download);
        this.downloadContainer.appendChild(download.getNode());
    }

    getDownloadById(id) {
        console.log(id);
        for(let i = 0; i < this.downloads.length; i++) {
            if(this.downloads[i].getId() == id) {
                return this.downloads[i];
            }
        }
    }
}

module.exports = DownloadManager;