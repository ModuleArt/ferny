const EventEmitter = require("events");

const Tab = require(__dirname + '/Tab.js');

class TabManager extends EventEmitter {
    x = 0; y = 74;
    width = 0; height = 0;
    tabs = [];
    tabCounter = 0;
    window = null;
    newTabPage = "https://google.com"

    constructor(window) {
        super();

        this.window = window;
        this.setBounds(this.x, this.y, window.getSize()[0], window.getSize()[1]);
    }

    newTab() {
        this.addTab(this.newTabPage, true);

        return null;
    }

    addTab(url, active) {
        let id = this.tabCounter++;

        let tab = new Tab(this.window, id, {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        });
        tab.on("close", (closedTab) => {
            this.destroyTabById(id);
            if(closedTab.isActive()) {
                if(this.tabs.length > 0) {
                    this.tabs[0].activate();
                }
            }
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

        }

        return null;
    }

    setBounds(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        for(let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].setBounds(x, y, width, height);
        }

        return null;
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