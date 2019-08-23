const EventEmitter = require("events");
const { ipcRencerer } = require("electron");

class TabRenderer extends EventEmitter {
    tabContainer = null;
    backButton = null;
    forwardButton = null;
    reloadButton = null;
    stopButton = null;

    constructor() {
        super();

        this.tabContainer = document.getElementsByClassName("tabman-tabs")[0];
        this.backButton = document.getElementById("back-btn");
        this.forwardButton = document.getElementById("forward-btn");
        this.reloadButton = document.getElementById("reload-btn");
        this.stopButton = document.getElementById("stop-btn");
    }

    addTab(id, url, active) {
        let title = null;
        if(active) {
            title = "New tab";
        } else {
            title = "New background tab";
        }

        let tab = document.createElement("button");
        tab.classList.add("tabman-tab");
        tab.id = "tab-" + id;
        tab.title = title + "\n" + url;
        tab.innerHTML = `
            <img class='tabman-tab-icon'>
            <label class='tabman-tab-title'>` + title + `</label>
            <div class='tabman-tab-buttons'></div>
        `;
        tab.onclick = () => {
            ipcRenderer.send("tabManager-activateTab", id);
        }

        let closeButton = document.createElement('button');
        tab.title = "Close tab";
        closeButton.onclick = (event) => {
            event.stopPropagation();
            ipcRenderer.send("tabManager-closeTab", id);
        }
        tab.getElementsByClassName("tabman-tab-buttons")[0].appendChild(closeButton);

        this.tabContainer.appendChild(tab);

        if(active) {
            this.activateTab(id);
        }

        return null;
    }

    activateTab(id) {
        let tabs = this.tabContainer.childNodes;
        for(let i = 0; i < tabs.length; i++) {
            if(tabs[i].id == "tab-" + id) {
                tabs[i].classList.add("active");
            } else {
                tabs[i].classList.remove("active");
            }
        }

        return null;
    }

    closeTab(id) {
        this.tabContainer.removeChild(this.getTabById(id));

        return null;
    }

    getTabById(id) {
        let tabs = this.tabContainer.childNodes;
        for(let i = 0; i < tabs.length; i++) {
            if(tabs[i].id == "tab-" + id) {
                return tabs[i];
            }
        }
    }

    setTabTitle(id, title) {
        this.getTabById(id).getElementsByClassName("tabman-tab-title")[0].innerHTML = title;

        return null;
    }

    setTabIcon(id, icon) {
        this.getTabById(id).getElementsByClassName("tabman-tab-icon")[0].src = icon;

        return null;
    }
}

module.exports = TabRenderer;