const EventEmitter = require("events");
const { BrowserView } = require('electron');

class Overlay extends EventEmitter {
    window = null;
    view = null;
    top = 33;

    constructor(window) {
        super();

        this.window = window;
        
        this.view = new BrowserView({
            webPreferences: {
                nodeIntegration: true
            }
        });
        this.view.setAutoResize({
            width: true,
            height: true
        });
        this.openBookmarks();
    }

    refreshBounds() {
        let size = this.window.getSize();
        this.view.setBounds({ x: 0, y: this.top, width: size[0], height: size[0] });
    }

    show() {
        this.window.setBrowserView(this.view);
        this.refreshBounds();
        this.window.webContents.send("overlay-toggleButton", true);
        this.emit("show");
        return null;
    }

    openBookmarks() {
        this.view.webContents.loadFile(__dirname + "/../../html/bookmarks.html");
    }

    openHistory() {
        this.view.webContents.loadFile(__dirname + "/../../html/history.html");
    }

    openDownloads() {
        this.view.webContents.loadFile(__dirname + "/../../html/downloads.html");
    }

    openSettings() {
        this.view.webContents.loadFile(__dirname + "/../../html/settings.html");
    }

    openAbout() {
        this.view.webContents.loadFile(__dirname + "/../../html/about.html");
    }

    openCertificate() {
        this.view.webContents.loadFile(__dirname + "/../../html/certificate.html");
    }
}

module.exports = Overlay;