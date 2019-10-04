const EventEmitter = require("events");
const { Menu, MenuItem } = require('electron');

const loadTabClosed = require("../loadTabClosed.js");

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

    constructor(window, appPath) {
        super();

        this.window = window;
        this.appPath = appPath;

        this.left = 0; 
        this.right = 0; 
        this.top = 74; 
        this.bottom = 0;

        loadTabClosed().then((tabClosed) => {
            this.setTabClosedAction(tabClosed.toString());
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

        let tab = new Tab(this.window, id, this.appPath);

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
                activatedTab.setBounds(this.left, this.top, this.getWidth(), this.getHeight());
            }, 100);
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
            for(let i = 0; i < this.tabs.length; i++) {
                if(this.tabs[i].getPosition() > position) {
                    this.tabs[i].close();
                    i--;
                }
            }
        });

        tab.on("close-others", (id) => {
            for(let i = 0; i < this.tabs.length; i++) {
                if(this.tabs[i].getId() != id) {
                    this.tabs[i].close();
                    i--;
                }
            }
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

        this.tabs.push(tab);

        tab.navigate(url);

        this.window.webContents.send("tabRenderer-addTab", { 
            id: id,
            url: url,
            active: active
        });

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
            this.top = 74;
        }
        if(this.hasActiveTab()) {
            this.getActiveTab().activate();
        }
    }

    getWidth() {
        return this.window.getSize()[0] - this.left - this.right;
    }

    getHeight() {
        return this.window.getSize()[1] - this.top - this.bottom;
    }

    setLeft(left) {
        this.left = left;
    }

    setRight(right) {
        this.right = right;
    }

    setTop(top) {
        this.top = top;
    }

    setBottom(bottom) {
        this.bottom = bottom;
    }

    hasTabs() {
        if(this.tabs.length > 0) {
            return true;
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
    }

    getTabById(id) {
        for(let i = 0; i < this.tabs.length; i++) {
            if(this.tabs[i].getId() == id) {
                return this.tabs[i];
            }
        }
    }

    getTabByPosition(pos) {
        for(let i = 0; i < this.tabs.length; i++) {
            if(this.tabs[i].getPosition() === pos) {
                return this.tabs[i];
            }
        }
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
        this.window.send("tabRenderer-unactivateAllTabs");

        return null;
    }

    showTabList(arr) {
        let m = new Menu();

        if(arr.length > 0) {
            arr.forEach((item, index) => {
                let num = index + 1;
                if (index < 9) {
                    let mi = new MenuItem({
                        type: 'checkbox',
                        label: item.title,
                        checked: item.active,
                        accelerator: "CmdOrCtrl+" + num,
                        click: () => { this.getTabById(item.id).activate(); }
                    });
                    m.append(mi);
                } else {
                    let mi = new MenuItem({
                        type: 'checkbox',
                        label: item.title + " [" + num + "]",
                        checked: item.active,
                        click: () => { this.getTabById(item.id).activate(); }
                    });
                    m.append(mi);
                }
            });
        } else {
            let createItem = new MenuItem({ 
                label: 'New Tab', 
                icon: this.appPath + '/imgs/icons16/create.png', 
                accelerator: 'CmdOrCtrl+T', 
                click: () => { this.newTab(); } 
            });
            m.append(createItem);
        }  
        
        let sep = new MenuItem({ type: 'separator' });
        m.append(sep);
        let nextItem = new MenuItem({ 
            label: 'Next tab', 
            icon: this.appPath + '/imgs/icons16/next.png', 
            accelerator: 'CmdOrCtrl+Tab', 
            enabled: this.hasActiveTab(),
            click: () => { 
                this.getActiveTab().nextTab(); 
            } 
        });
        m.append(nextItem);
        let prevItem = new MenuItem({ 
            label: 'Previous tab', 
            icon: this.appPath + '/imgs/icons16/prev.png', 
            accelerator: 'CmdOrCtrl+Shift+Tab', 
            enabled: this.hasActiveTab(),
            click: () => { 
                this.getActiveTab().prevTab(); 
            } 
        });
        m.append(prevItem);

        m.popup(this.window);

        return null;
    }

    updateTabsPositions(arr) {
        for(let i = 0; i < this.tabs.length; i++) {
            let tab = this.getTabById(arr[i]);
            if(tab == null) {
                i--;
            } else {
                tab.setPosition(i);
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
}

module.exports = TabManager;