"use strict";

const EventEmitter = require("events");
const ppath = require("persist-path")("Ferny");
const readlPromise = require("readline-promise").default;
const prependFile = require("prepend-file");
const fs = require("fs");

const saveFileToJsonFolder = require("../saveFileToJsonFolder.js");
const checkFileExists = require("../checkFileExists.js");

const Download = require(__dirname + "/Download.js");

class DownloadManager extends EventEmitter {
    downloads = [];
    downloadContainer = null;
    downloadsLimiter = true;

    constructor(downloadContainer) {
        super();

        this.downloadContainer = downloadContainer;

        this.setLimiter(true);
    }

    appendDownload(begin, id, name, url, time) {
        let download = new Download(id, name, url, time);

        download.on("status-changed", () => {
            this.emit("download-status-changed");
        });

        this.downloads.push(download);

        if(begin) {
            this.downloadContainer.insertBefore(download.getNode(), this.downloadContainer.firstChild);

            let Data = {
                id: id,
                url: url, 
                time: time,
                name: name
            };
    
            try {
                prependFile(ppath + "/json/downloads/downloads.json", JSON.stringify(Data) + "\n", (err) => {
                    if(err) {
                        saveFileToJsonFolder("downloads", "downloads", JSON.stringify(Data)).then(() => {
                    
                        });
                    }
                });
            } catch (error) {
                saveFileToJsonFolder("downloads", "downloads", JSON.stringify(Data)).then(() => {
                    
                });
            }
        } else {
            this.downloadContainer.appendChild(download.getNode());
            download.setStatusStopped();
        }
    }

    getDownloadById(id) {
        for(let i = 0; i < this.downloads.length; i++) {
            if(this.downloads[i].getId() == id) {
                return this.downloads[i];
            }
        }
    }

    loadDownloads(count) {
        checkFileExists(ppath + "/json/downloads/downloads.json").then(() => {
            this.downloadContainer.innerHTML = "";

            let downloadsReadline = readlPromise.createInterface({
                terminal: false, 
                input: fs.createReadStream(ppath + "/json/downloads/downloads.json")
            });
            downloadsReadline.forEach((line, index) => {
                let obj = JSON.parse(line);
                if(count == null) {
                    this.appendDownload(false, obj.id, obj.name, obj.url, obj.time);
                } else {
                    if(index < count) {
                        this.appendDownload(false, obj.id, obj.name, obj.url, obj.time);
                    }
                }
            });
        });

        return null;
    }

    askClearDownloads() {
        if(this.downloads.length > 0) {
            this.emit("clear-downloads");
        } else {
            this.emit("downloads-already-cleared");
        }

        return null;
    }

    clearDownloads() {
        saveFileToJsonFolder("downloads", "downloads", "").then(() => {
            this.downloads = [];
            this.downloadContainer.innerHTML = "";
            this.emit("downloads-cleared");
        });

        return null;
    }

    setLimiter(bool) {
        this.downloadsLimiter = bool;
        if(bool) {
            document.getElementById("more-downloads-btn").style.display = "";
            document.getElementById("collapse-downloads-btn").style.display = "none";
            this.loadDownloads(12);
        } else {
            document.getElementById("more-downloads-btn").style.display = "none";
            document.getElementById("collapse-downloads-btn").style.display = "";
            this.loadDownloads();
        }
    }
}

module.exports = DownloadManager;