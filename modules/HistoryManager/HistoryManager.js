const EventEmitter = require("events");
const prependFile = require("prepend-file");
const ppath = require("persist-path")("Ferny");
const readlPromise = require("readline-promise").default;
const fs = require("fs");

const saveFileToJsonFolder = require("../saveFileToJsonFolder.js");
const loadFileFromJsonFolder = require("../loadFileFromJsonFolder.js");
const checkFileExists = require("../checkFileExists.js");

const HistoryItem = require(__dirname + "/HistoryItem.js");

class HistoryManager extends EventEmitter {
    history = [];
    historyContainer = null;
    historyCounter = 0;
    historyLimiter = true;

    constructor(historyContainer) {
        super();

        this.historyContainer = historyContainer;

        this.setLimiter(true);
    }

    appendHistoryItem(id, url, time, title) {
        let historyItem = new HistoryItem(id, url, time, title);
        this.history.push(historyItem);
        this.historyContainer.appendChild(historyItem.getNode());

        this.emit("history-item-added");
        return null;
    }

    insertBeforeHistoryItem(url) {
        let Data = {
            id: this.historyCounter++,
            url: url, 
            time: Math.floor(Date.now() / 1000),
            title: url
        };

        let historyItem = new HistoryItem(Data.id, Data.url, Data.time, Data.title);
        this.history.unshift(historyItem);

        if(this.history.length <= 0) {
            this.historyContainer.appendChild(historyItem.getNode());
        } else {
            this.historyContainer.insertBefore(historyItem.getNode(), this.historyContainer.children[0]);
        }

        historyItem.on("title-updated", (title) => {
            Data.title = title;
            
            try {
                prependFile(ppath + "/json/history/history.json", JSON.stringify(Data) + "\n", (err) => {
                    saveFileToJsonFolder("history", "history-counter", this.historyCounter);
                });
            } catch (error) {
                saveFileToJsonFolder("history", "history", JSON.stringify(Data)).then(() => {
                    saveFileToJsonFolder("history", "history-counter", this.historyCounter);
                });
            }
        });

        if(this.historyLimiter && this.history.length > 16) {
            this.history.pop();
            this.historyContainer.removeChild(this.historyContainer.lastChild);
        }

        this.emit("history-item-added");
        return null;
    }

    loadHistory(count) {
        loadFileFromJsonFolder("history", "history-counter").then((historyCounter) => {
            this.historyCounter = historyCounter;
        });

        checkFileExists(ppath + "/json/history/history.json").then(() => {
            this.historyContainer.innerHTML = "";

            let historyReadline = readlPromise.createInterface({
                terminal: false, 
                input: fs.createReadStream(ppath + "/json/history/history.json")
            });
            historyReadline.forEach((line, index) => {
                let obj = JSON.parse(line);
                if(count == null) {
                    this.appendHistoryItem(obj.id, obj.url, obj.time, obj.title);
                } else {
                    if(index < count) {
                        this.appendHistoryItem(obj.id, obj.url, obj.time, obj.title);
                    }
                }
            });
        });

        return null;
    }

    askClearHistory() {
        if(this.history.length > 0) {
            this.emit("clear-history");
        } else {
            this.emit("history-already-cleared");
        }

        return null;
    }

    clearHistory() {
        saveFileToJsonFolder("history", "history-counter", 0).then(() => {
            this.historyCounter = 0;
            saveFileToJsonFolder("history", "history", "").then(() => {
                this.history = [];
                this.historyContainer.innerHTML = "";
                this.emit("history-cleared");
            });
        });

        return null;
    }

    deleteSelectedHistory() {
        let arr = [];

        for(let i = 0; i < this.history.length; i++) {
            if(this.history[i].isSelected()) {
                arr.push(this.history[i].getId());
                this.historyContainer.removeChild(this.history[i].getNode());
                this.history.splice(i, 1);
                i--;
            }
        }

        if(arr.length > 0) {
            checkFileExists(ppath + "/json/history/history.json").then(() => {
                fs.readFile(ppath + "/json/history/history.json", (err, data) => {
                    let text = data.toString();
                    let lines = text.split("\n");
                    saveFileToJsonFolder("history", "history", "").then(() => {
                        for(let i = 0; i < lines.length - 1; i++) {
                            let obj = JSON.parse(lines[i]);
                            if(arr.includes(obj.id)) {
                                continue;
                            }
                            fs.appendFile(ppath + "/json/history/history.json", lines[i] + "\n", (err) => {
    
                            });
                        }
                    });
                });
            });
        }

        return null;
    }

    setLimiter(bool) {
        this.historyLimiter = bool;
        if(bool) {
            document.getElementById("more-history-btn").style.display = "";
            document.getElementById("collapse-history-btn").style.display = "none";
            this.loadHistory(16);
        } else {
            document.getElementById("more-history-btn").style.display = "none";
            document.getElementById("collapse-history-btn").style.display = "";
            this.loadHistory();
        }
    }
}

module.exports = HistoryManager;