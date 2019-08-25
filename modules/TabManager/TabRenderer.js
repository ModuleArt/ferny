if (!document) {
    throw Error("TabRenderer module must be called in renderer process");
}

const EventEmitter = require("events");
const { ipcRenderer } = require("electron");
const getAvColor = require('color.js');

const rgbToRgbaString = require("../rgbToRgbaString.js");

class TabRenderer extends EventEmitter {
    tabContainer = null;
    backButton = null;
    forwardButton = null;
    reloadButton = null;
    stopButton = null;
    addressBar = null;

    constructor() {
        super();

        this.tabContainer = document.getElementsByClassName("tabman-tabs")[0];
        this.backButton = document.getElementById("back-btn");
        this.forwardButton = document.getElementById("forward-btn");
        this.reloadButton = document.getElementById("reload-btn");
        this.stopButton = document.getElementById("stop-btn");
        this.addressBar = document.getElementById("search-input");
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
        tab.onauxclick = (event) => {
            event.preventDefault();
            if(event.which == 2) {
                ipcRenderer.send("tabManager-closeTab", id);
            }
        }
        tab.ondragenter = (event) => {
            event.preventDefault();
            ipcRenderer.send("tabManager-activateTab", id);
        }
        tab.ondragover = (event) => {
            event.preventDefault();
        }
        tab.ondrop = (event) => {
            event.preventDefault();
            var textData = event.dataTransfer.getData("Text");
            if (textData) {
                ipcRenderer.send("tabManager-navigate", textData);
            } else if(event.dataTransfer.files.length > 0) {
                ipcRenderer.send("tabManager-navigate", event.dataTransfer.files[0].path);
            }
        }

        let closeButton = document.createElement('button');
        closeButton.title = "Close tab";
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
        let tab = this.getTabById(id);
        tab.getElementsByClassName("tabman-tab-title")[0].innerHTML = title;
        tab.title = title;

        return null;
    }

    setTabIcon(id, icon) {
        let img = this.getTabById(id).getElementsByClassName("tabman-tab-icon")[0];
        img.src = icon;

        var color = new getAvColor(img);
        color.mostUsed(result => {
            if(document.body.classList.contains('color-tabs')) {
                img.parentNode.style.backgroundColor = rgbToRgbaString(result[0]);
            }
        });

        return null;
    }

    updateNavigationButtons(canGoBack, canGoForward, isLoading) {
        this.backButton.disabled = !canGoBack;
        this.forwardButton.disabled = !canGoForward;
        if(isLoading) {
            this.reloadButton.style.display = "none";
            this.stopButton.style.display = "";
        } else {
            this.reloadButton.style.display = "";
            this.stopButton.style.display = "none";
        }
    }

    updateAddressBar(url) {
        this.addressBar.value = url;
    }

    getTabContainer() {
        return this.tabContainer;
    }
}

module.exports = TabRenderer;