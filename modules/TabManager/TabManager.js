"use strict";

const EventEmitter = require("events");
const { Menu, MenuItem } = require("electron");

const loadTabClosedModule = require("../loadTabClosed.js");

const Tab = require(__dirname + "/Tab.js");

class TabManager extends EventEmitter {
    left = 0; 
    right = 0; 
    top = 0; 
    bottom = 0;

    tabs = [];
    tabCounter = 0;
    window = null;
    appPath = null;

    homePage = "https://google.com";
    tabClosedAction = "overlay";

    tabGroup = 0;

    constructor(window, appPath) {
        super();

        this.window = window;
        this.appPath = appPath;

        this.left = 0; 
        this.right = 0; 
        this.top = 75; 
        this.bottom = 0;

        loadTabClosedModule().then((tabClosed) => {
            this.setTabClosedAction(tabClosed);
        });
    }

    newTab() {
        this.addTab(this.homePage, true);

        return null;
    }

    newBackgroundTab() {
        this.addTab(this.homePage, false);

        return null;
    }

    addTab(url, active) {
        let id = this.tabCounter++;

        let tab = new Tab(this.window, id, this.appPath, this.tabGroup);

        tab.on("close", (closedTab) => {
            let pos = closedTab.getPosition();
            this.destroyTabById(id);

            if(closedTab.isActive()) {
                this.emit("active-tab-closed", this.tabClosedAction, pos);
            }

            if(this.tabs.length === 0) {
                this.emit("last-tab-closed");
            }
        });

        tab.on("activate", (activatedTab) => {
            setTimeout(() => {
                if(this.window.isMaximized() && process.platform == "win32") {
                    activatedTab.setBounds(this.left - 16, this.top, this.getWidth(), this.getHeight() - 16);
                } else {
                    activatedTab.setBounds(this.left, this.top, this.getWidth(), this.getHeight());
                }
            }, 150);
            this.emit("tab-activated");
        });

        tab.on("add-tab", (url, active) => {
            this.addTab(url, active);
        });

        tab.on("add-status-notif", (text, type) => {
            this.emit("add-status-notif", text, type);
        });

        tab.on("refresh-zoom-notif", (zoomFactor) => {
            this.emit("refresh-zoom-notif", zoomFactor);
        });

        tab.on("fullscreen", (bool) => {
            this.setFullscreen(bool);
        });

        tab.on("go-home", (tab) => {
            tab.navigate(this.homePage);
        });

        tab.on("close-to-the-right", (position) => {
            let closableTabs = [];
            for(let i = this.tabs.length - 1; i >= 0; i--) {
                if(this.tabs[i].getGroup() == this.tabGroup && this.tabs[i].getPosition() > position) {
                    closableTabs.push(this.tabs[i]);
                }
            }
            this.closeMultipleTabs(closableTabs);
        });

        tab.on("close-others", (id) => {
            let closableTabs = [];
            for(let i = this.tabs.length - 1; i >= 0; i--) {
                if(this.tabs[i].getGroup() == this.tabGroup && this.tabs[i].getId() != id) {
                    closableTabs.push(this.tabs[i]);
                }
            }
            this.closeMultipleTabs(closableTabs);
        });

        tab.on("next-tab", (position) => {
            this.tabs.forEach((item, index) => {
                if(item.getPosition() == position + 1) {
                    item.activate();
                }
            });
        });

        tab.on("prev-tab", (position) => {
            this.tabs.forEach((item, index) => {
                if(item.getPosition() == position - 1) {
                    item.activate();
                }
            });
        });

        tab.on("move-left", (id, position) => {
            this.tabs.forEach((item, index) => {
                if(item.getPosition() == position - 1) {
                    this.window.webContents.send("tabRenderer-moveTabBefore", id, item.getId());
                }
            });
        });

        tab.on("move-right", (id, position) => {
            let rightTab = null;

            this.tabs.forEach((item, index) => {
                if(item.getPosition() == position + 2) {
                    rightTab = item;
                }
            });

            if(rightTab != null) {
                this.window.webContents.send("tabRenderer-moveTabBefore", id, rightTab.getId());
            } else {
                this.window.webContents.send("tabRenderer-moveTabToEnd", id);
            }
        });

        tab.on("move-to-start", (id, position) => {
            this.tabs.forEach((item, index) => {
                if(item.getPosition() == 0 && position != 0) {
                    this.window.webContents.send("tabRenderer-moveTabBefore", id, item.getId());
                }
            });
        });

        tab.on("add-history-item", (url) => {
            this.emit("add-history-item", url);
        });

        tab.on("bookmark-tab", (title, url) => {
            this.emit("bookmark-tab", title, url);
        });

        tab.on("search-for", (text) => {
            this.emit("search-for", text);
        });

        tab.on("open-history", () => {
            this.emit("open-history");
        });

        tab.on("group-changed", () => {
            this.updateTabGroups();
        });

        this.tabs.push(tab);

        tab.navigate(url);

        this.window.webContents.send("tabRenderer-addTab", { id, url, active });

        if(active) {
            tab.activate();
            tab.setBounds(this.left, this.top, this.getWidth(), this.getHeight());
        }

        return null;
    }

    setFullscreen(bool) {
        if(bool) {
            this.top = 0;
        } else {
            this.top = 75;
        }
        if(this.hasActiveTab()) {
            this.getActiveTab().activate();
        }

        return null;
    }

    getWidth() {
        return this.window.getSize()[0] - this.left - this.right;
    }

    getHeight() {
        return this.window.getSize()[1] - this.top - this.bottom;
    }

    setLeft(left) {
        this.left = left;

        return null;
    }

    setRight(right) {
        this.right = right;

        return null;
    }

    setTop(top) {
        this.top = top;

        return null;
    }

    setBottom(bottom) {
        this.bottom = bottom;

        return null;
    }

    hasTabs() {
        if(this.tabs.length > 0) {
            let groupHasTabs = false;
            for(let i = 0; i < this.tabs.length; i++) {
                if(this.tabs[i].getGroup() == this.tabGroup) {
                    groupHasTabs = true;
                    break;
                }
            }
            return groupHasTabs;
        } else {
            return false;
        }
    }

    hasActiveTab() {
        let bool = false;
        for(let i = 0; i < this.tabs.length; i++) {
            if(this.tabs[i].isActive()) {
                bool = true;
                break;
            }
        }
        return bool;
    }

    getActiveTab() {
        for(let i = 0; i < this.tabs.length; i++) {
            if(this.tabs[i].isActive()) {
                return this.tabs[i];
            }
        }

        return null;
    }

    getTabById(id) {
        for(let i = 0; i < this.tabs.length; i++) {
            if(this.tabs[i].getId() == id) {
                return this.tabs[i];
            }
        }

        return null;
    }

    getTabByPosition(pos) {
        for(let i = 0; i < this.tabs.length; i++) {
            if(this.tabs[i].getPosition() === pos) {
                return this.tabs[i];
            }
        }

        return null;
    }

    destroyTabById(id) {
        for(let i = 0; i < this.tabs.length; i++) {
            if(this.tabs[i].getId() == id) {
                this.tabs.splice(i, 1);
            }
        }

        return null;
    }

    getTabs() {
        return this.tabs;
    }

    setHomePage(homePage) {
        this.homePage = homePage.url;
        this.window.webContents.send("tabRenderer-setHomePage", homePage);

        return null;
    }

    getHomePage() {
        return this.homePage;
    }

    setTabClosedAction(tabClosed) {
        this.tabClosedAction = tabClosed;

        return null;
    }

    unactivateAllTabs() {
        this.window.webContents.send("tabRenderer-unactivateAllTabs");

        return null;
    }

    showTabList(arr) {
        let m = new Menu();

        if(arr.length > 0) {
            arr.forEach((item, index) => {
                let num = index + 1;
                let text = item.title;
                if(text.length > 30) {
                    text = text.substring(0, 30) + "...";
                }
                if (index < 9) {
                    let mi = new MenuItem({
                        type: "checkbox",
                        label: text,
                        checked: item.active,
                        accelerator: "CmdOrCtrl+" + num,
                        click: () => { this.getTabById(item.id).activate(); }
                    });
                    m.append(mi);
                } else {
                    let mi = new MenuItem({
                        type: "checkbox",
                        label: text + " [" + num + "]",
                        checked: item.active,
                        click: () => { this.getTabById(item.id).activate(); }
                    });
                    m.append(mi);
                }
            });
        } else {
            m.append(new MenuItem({ 
                label: "New Tab", 
                icon: this.appPath + "/imgs/icons16/create.png", 
                accelerator: "CmdOrCtrl+T", 
                click: () => { this.newTab(); } 
            }));
        }  
        
        m.append(new MenuItem({ type: "separator" }));
        m.append(new MenuItem({ 
            label: "Next tab", 
            icon: this.appPath + "/imgs/icons16/next.png", 
            accelerator: "CmdOrCtrl+Tab", 
            enabled: this.hasTabs(),
            click: () => { 
                if(this.hasActiveTab()) {
                    if(this.getActiveTab().getPosition() == this.getMaxPosition()) {
                        this.emit("show-overlay");
                    } else {
                        this.getActiveTab().nextTab(); 
                    }
                } else {
                    this.getTabByPosition(0).activate();
                }
            } 
        }));
        m.append(new MenuItem({ 
            label: "Previous tab", 
            icon: this.appPath + "/imgs/icons16/prev.png", 
            accelerator: "CmdOrCtrl+Shift+Tab", 
            enabled: this.hasTabs(),
            click: () => {
                if(this.hasActiveTab()) {
                    if(this.getActiveTab().getPosition() == 0) {
                        this.emit("show-overlay");
                    } else {
                        this.getActiveTab().prevTab(); 
                    }
                } else {
                    this.getTabByPosition(this.getMaxPosition()).activate();
                }
            } 
        }));
        m.append(new MenuItem({ type: "separator" }));
        m.append(new MenuItem({ 
            label: "Close all tabs", 
            accelerator: "CmdOrCtrl+Q",
            icon: this.appPath + "/imgs/icons16/close.png", 
            enabled: this.hasTabs(),
            click: () => { 
                this.closeAllTabs();
            } 
        }));

        m.popup(this.window);

        return null;
    }

    updateTabsPositions(arr) {
        for(let i = 0; i < arr.length; i++) {
            let tab = this.getTabById(arr[i]);
            if (tab) {
                this.getTabById(arr[i]).setPosition(i);
            }
        }

        return null;
    }

    switchTab(number) {
        this.tabs.forEach((item, index) => {
            if(item.getPosition() == number - 1) {
                item.activate();
            }
        });

        return null;
    }

    closeAllTabs() {
        let closableTabs = [];

        for(let i = this.tabs.length - 1; i >= 0; i--) {
            if(this.tabs[i].getGroup() == this.tabGroup) {
                closableTabs.push(this.tabs[i]);
            }
        }

        this.closeMultipleTabs(closableTabs);

        return null;
    }

    closeMultipleTabs(closableTabs) {
        for(let i = closableTabs.length - 1; i >= 0; i--) {
            closableTabs[i].close();
        }
    }

    updateTabGroups() {
        this.tabs.forEach((tab) => {
            tab.setVisibility(tab.getGroup() == this.tabGroup);
        });
        this.window.webContents.send("tabRenderer-updateTabsPositions");

        return null;
    }

    switchTabGroup(tabGroupId) {
        this.tabGroup = tabGroupId;
        this.updateTabGroups();

        this.emit("tab-group-switched", this.tabGroup);
        return null;
    }

    getMaxPosition() {
        let maxPosition = -1;
        for(let i = 0; i < this.tabs.length; i++) {
            if(this.tabs[i].getPosition() > maxPosition) {
                maxPosition = this.tabs[i].getPosition();
            }
        }
        return maxPosition;
    }
}

module.exports = TabManager;