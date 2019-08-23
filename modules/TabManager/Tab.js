const EventEmitter = require("events");
const { BrowserView } = require('electron');

class Tab extends EventEmitter {
    id = null;
    view = null;
    window = null;

    constructor(window, id, bounds) {
        super();

        this.id = id;
        this.window = window;

        this.view = new BrowserView();
        this.view.setBounds(bounds);
        // this.view.setAutoResize({
        //     width: true,
        //     height: true
        // });

        this.view.webContents.on("page-title-updated", (event, title, explicitSet) => {
            this.window.webContents.send("tabRenderer-setTabTitle", { id: this.id, title: title });
        });

        this.view.webContents.on("page-favicon-updated", (event, favicons) => {
            this.window.webContents.send("tabRenderer-setTabIcon", { id: this.id, icon: favicons[0] });
        });

        this.activate();
    }

    getId() {
        return this.id;
    }

    setBounds(x, y, width, height) {
        this.view.setBounds({ x: x, y: y, width: width, height: height });
    }

    navigate(url) {
        this.view.webContents.loadURL(url);
    }

    close() {
        this.view.destroy();
        this.window.webContents.send("tabRenderer-closeTab", this.id);

        this.emit("close", this);
        return null;
    }

    activate() {
        this.window.setBrowserView(this.view);
        this.window.webContents.send("tabRenderer-activateTab", this.id);

        return null;
    }

    isActive() {
        let active = false;
        if(this.window.getBrowserView() == this.view) {
            active = true;
        }
        return active;
    }
}

module.exports = Tab;