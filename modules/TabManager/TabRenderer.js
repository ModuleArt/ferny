"use strict";

const EventEmitter = require("events");
const { ipcRenderer } = require("electron");
const GetAvColor = require("color.js");
const parseUrl = require("parse-url");

const rgbToRgbaString = require("../rgbToRgbaString.js");

class TabRenderer extends EventEmitter {
    tabContainer = null;
    backButton = null;
    forwardButton = null;
    reloadButton = null;
    stopButton = null;
    addressBar = null;
    targetURL = null;
    tabDrag = null;
    bookmarkButton = null;
    bookmarkedButton = null;

    constructor() {
        super();

        this.tabContainer = document.getElementById("tabman-tabs");
        this.backButton = document.getElementById("back-btn");
        this.forwardButton = document.getElementById("forward-btn");
        this.reloadButton = document.getElementById("reload-btn");
        this.stopButton = document.getElementById("stop-btn");
        this.addressBar = document.getElementById("search-input");
        this.targetURL = document.getElementById("target-url");
        this.bookmarkButton = document.getElementById("bookmark-btn");
        this.bookmarkedButton = document.getElementById("bookmarked-btn");

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
        // tab.title = title + "\n" + url;
        tab.innerHTML = `
            <img class='tabman-tab-icon' src='../imgs/icon16.png'>
            <label class='tabman-tab-title'>` + title + `</label>
            <div class='tabman-tab-buttons'></div>
        `;
        tab.onclick = () => {
            tab.focus();
            ipcRenderer.send("tabManager-activateTab", id);
        };
        tab.onauxclick = (event) => {
            event.preventDefault();
            if(event.which === 2) {
                ipcRenderer.send("tabManager-closeTab", id);
            }
        };
        tab.ondragenter = (event) => {
            event.preventDefault();
            ipcRenderer.send("tabManager-activateTab", id);
        };
        tab.ondragover = (event) => {
            event.preventDefault();
        };
        tab.ondrop = (event) => {
            event.preventDefault();
            var textData = event.dataTransfer.getData("Text");
            if (textData) {
                ipcRenderer.send("tabManager-navigate", "file://" + textData);
            } else if(event.dataTransfer.files.length > 0) {
                ipcRenderer.send("tabManager-navigate", "file://" + event.dataTransfer.files[0].path);
            }
        };
        tab.onmouseenter = (event) => {
            ipcRenderer.send("tabManager-requestTabPreview", id);
        };
        tab.onmouseleave = (event) => {
            document.getElementById("tab-preview").classList.remove("show");
        };
        tab.oncontextmenu = (event) => {
            ipcRenderer.send("tabManager-showTabMenu", id);
        };

        let closeButton = document.createElement('button');
        closeButton.title = "Close tab";
        closeButton.onclick = (event) => {
            event.stopPropagation();
            ipcRenderer.send("tabManager-closeTab", id);
        };
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
            this.updateTabColor(tabs[i]);
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
            this.updateTabColor(tabs[i]);
        }

        return null;
    }

    closeTab(id) {
        this.tabContainer.removeChild(this.getTabById(id));
        this.hideTabPreview();

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

        return null;
    }

    setTabIcon(id, icon) {
        let tab = this.getTabById(id);
        let img = tab.getElementsByClassName("tabman-tab-icon")[0];
        img.src = icon;

        this.updateTabColor(tab);

        return null;
    }

    updateTabColor(tab) {
        if(tab.classList.contains("active")) {
            tab.style.backgroundColor = "";
        } else {
            let img = tab.getElementsByClassName("tabman-tab-icon")[0];

            let color = new GetAvColor(img);
            color.mostUsed(result => {
                tab.style.backgroundColor = rgbToRgbaString(result[0]);
            });
        }

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
        if(url) {
            this.addressBar.value = url;
            if(parseUrl(url).protocol == "https") {
                document.getElementById("secure-icon").style.display = "";
                document.getElementById("not-secure-icon").style.display = "none";
            } else {
                document.getElementById("secure-icon").style.display = "none";
                document.getElementById("not-secure-icon").style.display = "";
            }
        }
    }

    updateBookmarkedButton(exists, id) {
        if(exists) {
            this.bookmarkedButton.onclick = () => {
                ipcRenderer.send("overlay-showBookmarkOptions", id);
            };
            this.bookmarkedButton.style.display = "";
            this.bookmarkButton.style.display = "none";
        } else {
            this.bookmarkedButton.style.display = "none";
            this.bookmarkButton.style.display = "";
        }
    }

    getTabContainer() {
        return this.tabContainer;
    }

    hideTabPreview() {
        document.getElementById("tab-preview").classList.remove("show");
    }

    scrollLeft() {
        this.tabContainer.scrollLeft -= 16;
    }

    scrollRight() {
        this.tabContainer.scrollLeft += 16;
    }

    updateTabsPositions() {
        let tabs = this.tabContainer.getElementsByClassName("tabman-tab");
        let arr = [];
        for(let i = 0; i < tabs.length; i++) {
            if(!tabs[i].classList.contains("invisible")) {
                arr.push(tabs[i].name);
            }
        }
        if(arr.length > 0) {
            ipcRenderer.send("tabManager-updateTabsPositions", arr);
        }
    }

    showTabList() {
        let tabs = this.tabContainer.childNodes;
        let arr = [];
        tabs.forEach((item, index) => {
            if(!item.classList.contains("invisible")) {
                arr.push({ 
                    id: item.name, 
                    title: item.getElementsByClassName("tabman-tab-title")[0].innerHTML, 
                    active: item.classList.contains("active")
                });
            }
        });
        ipcRenderer.send("tabManager-showTabList", arr);
    }

    updateTargetURL(url) {
        if(url.length > 0) {
            this.targetURL.innerHTML = url;
            this.targetURL.classList.add("show");
            this.addressBar.classList.add("show-target");
        } else {
            this.targetURL.classList.remove("show");
            this.addressBar.classList.remove("show-target");
        }
    }

    moveTabBefore(id, beforeId) {
        let tab = document.getElementById("tab-" + id);
        let beforeTab = document.getElementById("tab-" + beforeId);

        this.tabContainer.insertBefore(tab, beforeTab);

        this.updateTabsPositions();

        return null;
    }

    moveTabToEnd(id) {
        this.tabContainer.appendChild(document.getElementById("tab-" + id));

        this.updateTabsPositions();

        return null;
    }

    setTabVisibility(id, bool) {
        let tab = this.getTabById(id);
        if(bool) {
            tab.classList.remove("invisible");
        } else {
            tab.classList.add("invisible");
        }
    }

    showTabPreview(id, title, url) {
        let tab = this.getTabById(id);
        
        document.getElementById("tab-preview").classList.add("show");
        document.getElementById("tab-preview").style.left = tab.offsetLeft - this.tabContainer.scrollLeft + 4 + "px";

        document.getElementById("tab-preview-title").innerHTML = title;
        document.getElementById("tab-preview-url").innerHTML = url;
    }
}

module.exports = TabRenderer;