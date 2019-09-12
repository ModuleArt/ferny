const EventEmitter = require("events");
const jquery = require("jquery");
const getAvColor = require('color.js');

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
            <img class='history-icon' src="http://www.google.com/s2/favicons?domain=` + url + `">
            <label class='history-title'>` + title + `</label>
            <input type="checkbox" class='history-checkbox'>
            <label class='history-url'>` + url + `</label>
        `;
        
        let color = new getAvColor(this.node.getElementsByTagName('img')[0]);
        color.mostUsed(result => {
            this.node.style.backgroundColor = rgbToRgbaString(result[0]);
        });

        jquery.ajax({
            url: "http://textance.herokuapp.com/title/" + url,
            complete: (data) => {
                this.title = data.responseText;
                this.node.getElementsByClassName("history-title")[0].innerHTML = data.responseText;
                this.emit("title-updated", data.responseText);
            }
        });
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
}

module.exports = HistoryItem;