const EventEmitter = require("events");
const prependFile = require('prepend-file');
const ppath = require('persist-path')('Ferny');
const readlPromise = require('readline-promise').default;
const fs = require("fs");

const saveFileToJsonFolder = require("../saveFileToJsonFolder.js");
const loadFileFromJsonFolder = require("../loadFileFromJsonFolder.js");
const checkFileExists = require("../checkFileExists.js");

const HistoryItem = require(__dirname + '/HistoryItem.js');

class HistoryManager extends EventEmitter {
    history = [];
    historyContainer = null;
    historyCounter = 0;

    constructor(historyContainer) {
        super();

        this.historyContainer = historyContainer;

        this.loadHistory();
    }

    appendHistoryItem(id, url, time, title) {
        let historyItem = new HistoryItem(id, url, time, title);
        this.history.push(historyItem);
        this.historyContainer.appendChild(historyItem.getNode());
    }

    insertBeforeHistoryItem(url) {
        let Data = {
            id: this.historyCounter++,
            url: url, 
            time: Math.floor(Date.now() / 1000),
            title: url
        };

        let historyItem = new HistoryItem(Data.id, Data.url, Data.time, Data.title);
        this.history.push(historyItem);
        this.historyContainer.insertBefore(historyItem.getNode(), this.historyContainer.children[0]);

        historyItem.on("title-updated", (title) => {
            Data.title = title;
            
            try {
                prependFile(ppath + "/json/history/history.json", JSON.stringify(Data) + "\n", (err) => {
                    saveFileToJsonFolder("history", 'history-counter', this.historyCounter);
                });
            } catch (error) {
                saveFileToJsonFolder("history", 'history', JSON.stringify(Data)).then(() => {
                    saveFileToJsonFolder("history", 'history-counter', this.historyCounter);
                });
            }
        });
    }

    loadHistory() {
        loadFileFromJsonFolder("history", "history-counter").then((historyCounter) => {
            this.historyCounter = historyCounter;
        });

        checkFileExists(ppath + "/json/history/history.json").then(() => {
            let historyReadline = readlPromise.createInterface({
                terminal: false, 
                input: fs.createReadStream(ppath + "/json/history/history.json")
            });
            historyReadline.forEach((line, index) => {
                let obj = JSON.parse(line);
                this.appendHistoryItem(obj.id, obj.url, obj.time, obj.title);
            });
        });
    }
}

module.exports = HistoryManager;