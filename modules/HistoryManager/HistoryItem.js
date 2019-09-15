const EventEmitter = require("events");
const jquery = require("jquery");
const getAvColor = require('color.js');
const { ipcRenderer, clipboard } = require("electron");

const rgbToRgbaString = require("../rgbToRgbaString.js");

class HistoryItem extends EventEmitter {
    history = [];
    node = null;
    url = null;
    id = null;
    time = null;
    title = null;

    constructor(id, url, time, title) {
        super();

        this.id = id;
        this.url = url;
        this.time = time;
        this.title = title;

        this.node = document.createElement('button');
        this.node.classList.add('history-item');
        this.node.name = id;
        this.node.id = "history-" + id;
        this.node.innerHTML = `
            <img class='history-icon' src='http://www.google.com/s2/favicons?domain=` + url + `'>
            <label class='history-title'>` + title + `</label>
            <label class='history-url'>` + url + `</label>
        `;        
        this.node.onclick = () => {
            this.open();
        }
        this.node.onauxclick = (event) => {
            event.preventDefault();
            if(event.which == 2) {
                ipcRenderer.send("tabManager-addTab", url, false);
            }
        }
        this.node.onkeyup = (event) => {
            event.preventDefault();
        }

        let checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.classList.add('history-checkbox');
        checkbox.onclick = (event) => {
            event.stopPropagation();
        }
        this.node.appendChild(checkbox);

        let copyBtn = document.createElement('button');
        copyBtn.classList.add('history-copy');
        copyBtn.title = "Copy URL";
        copyBtn.innerHTML = `<img name="copy-12" class="theme-icon">`;
        copyBtn.onclick = (event) => {
            event.stopPropagation();
            this.copyURL();
        }
        this.node.appendChild(copyBtn);

        let color = new getAvColor(this.node.getElementsByClassName('history-icon')[0]);
        color.mostUsed(result => {
            this.node.style.backgroundColor = rgbToRgbaString(result[0]);
        });

        this.loadTitle().then((text) => {
            this.title = text;
            this.node.getElementsByClassName("history-title")[0].innerHTML = text;
            this.emit("title-updated", text);
        });
    }

    loadTitle() {
        return new Promise((resolve, reject) => {
            jquery.ajax({
                url: "http://textance.herokuapp.com/title/" + this.url,
                async: true,
                complete: (data) => {
                    resolve(data.responseText);
                }
            });
        });
    }

    open() {
        ipcRenderer.send("tabManager-addTab", this.url, true);
        return null;
    }

    getNode() {
        return this.node;
    }

    getId() {
        return this.id;
    }
    
    getURL() {
        return this.url;
    }

    getTime() {
        return this.time;
    }

    getTitle() {
        return this.title;
    }

    isSelected() {
        return this.node.getElementsByClassName('history-checkbox')[0].checked;
    }

    copyURL() {
        clipboard.writeText(this.url);
        return null;
    }
}

module.exports = HistoryItem;