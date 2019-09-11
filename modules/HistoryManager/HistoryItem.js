const EventEmitter = require("events");

class HistoryItem extends EventEmitter {
    history = [];
    node = null;
    url = null;
    id = null;
    time = null;

    constructor(id, url, time) {
        super();

        this.id = id;
        this.url = url;
        this.time = time;

        this.node = document.createElement('button');
        this.node.classList.add('history-item');
        this.node.name = id;
        this.id = "history-" + id;
        this.node.innerHTML = `
            <img class='history-icon' src="http://www.google.com/s2/favicons?domain=` + url + `">
            <label class='history-url'>` + url + `</label>
        `;
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
}

module.exports = HistoryItem;