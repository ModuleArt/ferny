const EventEmitter = require("events");

const Tab = require(__dirname + '/Tab.js');

class TabManager extends EventEmitter {
    left = 0; 
    right = 0; 
    top = 0; 
    bottom = 0;

    tabs = [];
    tabCounter = 0;
    window = null;

    newTabPage = "https://google.com"

    constructor(window) {
        super();

        this.window = window;

        this.left = 0; 
        this.right = 0; 
        this.top = 74; 
        this.bottom = 0;

        this.newTab();
    }

    newTab() {
        this.addTab(this.newTabPage, true);

        return null;
    }

    addTab(url, active) {
        let id = this.tabCounter++;

        let tab = new Tab(this.window, id);

        tab.on("close", (closedTab) => {
            this.destroyTabById(id);
            if(closedTab.isActive()) {
                if(this.tabs.length > 0) {
                    this.tabs[0].activate();
                }
            }

            if(this.tabs.length == 0) {
                this.emit("last-tab-closed");
            }
        });

        tab.on("activate", (activatedTab) => {
            activatedTab.setBounds(this.left, this.top, this.getWidth(), this.getHeight());
        });

        tab.on("add-tab", (url, active) => {
            this.addTab(url, active);
        });

        tab.on("add-status-notif", (text, type) => {
            this.emit("add-status-notif", text, type);
        });

        tab.on("fullscreen", (bool) => {
            if(bool) {
                this.top = 0;
            } else {
                this.top = 74;
            }
            this.getActiveTab().activate();
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

    setNewTabPage(url) {
        this.newTabPage = url;

        return null;
    }

    getNewTabPage() {
        return this.newTabPage;
    }
}

module.exports = TabManager;