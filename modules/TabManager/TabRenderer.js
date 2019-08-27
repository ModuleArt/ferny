if (!document) {
    throw Error("TabRenderer module must be called in renderer process");
}

const EventEmitter = require("events");
const { ipcRenderer, NativeImage } = require("electron");
const getAvColor = require('color.js');

const rgbToRgbaString = require("../rgbToRgbaString.js");

class TabRenderer extends EventEmitter {
    tabContainer = null;
    backButton = null;
    forwardButton = null;
    reloadButton = null;
    stopButton = null;
    addressBar = null;
    targetURL = null;

    constructor() {
        super();

        this.tabContainer = document.getElementById("tabman-tabs");
        this.backButton = document.getElementById("back-btn");
        this.forwardButton = document.getElementById("forward-btn");
        this.reloadButton = document.getElementById("reload-btn");
        this.stopButton = document.getElementById("stop-btn");
        this.addressBar = document.getElementById("search-input");
        this.targetURL = document.getElementById("target-url");

        ipcRenderer.send("tabManager-init");
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
        tab.name = id;
        tab.title = title + "\n" + url;
        tab.innerHTML = `
            <img class='tabman-tab-icon'>
            <label class='tabman-tab-title'>` + title + `</label>
            <div class='tabman-tab-buttons'></div>
        `;
        tab.onclick = () => {
            tab.focus();
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
        tab.onmouseenter = (event) => {
            ipcRenderer.send("tabManager-showPreview", id);
        }
        tab.onmouseleave = (event) => {
            ipcRenderer.send("tabManager-hidePreview", id);
        }
        tab.oncontextmenu = (event) => {
            ipcRenderer.send("tabManager-showTabMenu", id);
            ipcRenderer.send("tabManager-hidePreview", id);
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

        this.updateTabsPositions();

        return null;
    }

    unactivateAllTabs() {
        let tabs = this.tabContainer.childNodes;
        for(let i = 0; i < tabs.length; i++) {
            tabs[i].classList.remove("active");
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

        this.updateTabsPositions();

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

    showPreview(id, dataURL) {
        let tab = this.getTabById(id);
        if(tab != null) {
            let div = tab.getElementsByClassName('tabman-tab-preview')[0];
            if(div == null) {
                div = document.createElement('div');
                div.classList.add("tabman-tab-preview");
    
                let img = document.createElement('img');
                img.src = dataURL;
                div.appendChild(img);
            
                tab.appendChild(div);
            } else {
                let img = div.getElementsByTagName('img')[0];
                img.src = dataURL;
            }
        }
    }

    hidePreview(id) {
        let tab = this.getTabById(id);
        if(tab != null) {
            let div = tab.getElementsByClassName('tabman-tab-preview')[0];
            if(div != null) {
                tab.removeChild(div);
            }
        }
    }

    scrollLeft() {
        tabs.scrollLeft -= 40;
    }

    scrollRight() {
        tabs.scrollLeft += 40;
    }

    updateTabsPositions() {
        let tabs = this.tabContainer.getElementsByClassName('tabman-tab');
        let arr = [];
        for(let i = 0; i < tabs.length; i++) {
            arr.push(tabs[i].name);
        }
        ipcRenderer.send("tabManager-updateTabsPositions", arr);
    }

    showTabList() {
        let tabs = this.tabContainer.childNodes;
        let arr = [];
        tabs.forEach((item, index) => {
            arr.push({ 
                id: item.name, 
                title: item.getElementsByClassName('tabman-tab-title')[0].innerHTML, 
                active: item.classList.contains('active') 
            });
        });
        ipcRenderer.send('tabManager-showTabList', arr);
    }

    updateTargetURL(url) {
        if(url.length > 0) {
            this.targetURL.innerHTML = url;
            this.targetURL.classList.add('show');
            this.addressBar.classList.add('show-target');
        } else {
            this.targetURL.innerHTML = "";
            this.targetURL.classList.remove('show');
            this.addressBar.classList.remove('show-target');
        }
    }
}

module.exports = TabRenderer;