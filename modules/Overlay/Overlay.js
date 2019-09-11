const EventEmitter = require("events");
const { BrowserView, Menu } = require('electron');

class Overlay extends EventEmitter {
    window = null;
    view = null;
    top = 33;
    appPath = null;

    constructor(window, appPath) {
        super();

        this.window = window;
        this.appPath = appPath;
        
        this.view = new BrowserView({
            webPreferences: {
                nodeIntegration: true
            }
        });
        this.view.setAutoResize({
            width: true,
            height: true
        });
        this.view.webContents.loadFile(this.appPath + "/html/overlay.html");

        this.show();
    }

    refreshBounds() {
        let size = this.window.getSize();
        this.view.setBounds({ x: 0, y: this.top, width: size[0], height: size[1] - this.top });
    }

    show() {
        this.window.setBrowserView(this.view);
        this.refreshBounds();
        this.window.webContents.send("overlay-toggleButton", true);
        this.view.webContents.focus();

        this.emit("show");
        return null;
    }

    scrollToId(id) {
        this.show();
    }

    openHistory() {
        this.show();
        this.view.webContents.loadFile(this.appPath + "/html/history.html");
    }

    openDownloads() {
        this.show();
        this.view.webContents.loadFile(this.appPath + "/html/downloads.html");
    }

    openSettings(shortcutId) {
        this.show();

        if(shortcutId == null) {
            this.view.webContents.loadFile(this.appPath + "/html/settings.html");
        } else {
            this.view.webContents.loadURL(this.appPath + "/html/settings.html#" + shortcutId);
        }
    }

    openAbout() {
        this.show();
        this.view.webContents.loadFile(this.appPath + "/html/about.html");
    }

    openCertificate() {
        this.show();
        this.view.webContents.loadFile(this.appPath + "/html/certificate.html");
    }

    showButtonMenu() {
        let buttonMenu = Menu.buildFromTemplate([{ 
            label: 'Show overlay', icon: this.appPath + '/imgs/icons16/details.png', click: () => { 
                this.show(); 
            } }, { type: 'separator' }, { 
            label: 'History', icon: this.appPath + '/imgs/icons16/history.png', accelerator: 'CmdOrCtrl+H', click: () => { 
                this.openHistory(); 
            } }, { 
            label: 'Downloads', icon: this.appPath + '/imgs/icons16/download.png', accelerator: 'CmdOrCtrl+H', click: () => { 
                this.openDownloads(); 
            } }, { type: 'separator' }, { 
            label: 'Certificate info', icon: this.appPath + '/imgs/icons16/certificate.png', accelerator: 'CmdOrCtrl+I', click: () => { 
                this.openCertificate(); 
            } }, { type: 'separator' }, { 
            label: 'Settings', icon: this.appPath + '/imgs/icons16/settings.png', accelerator: 'CmdOrCtrl+,', click: () => { 
                this.openSettings(); 
            } }, { 
            label: 'About', icon: this.appPath + '/imgs/icons16/about.png', accelerator: 'F2', click: () => { 
                this.openAbout(); 
            } },
          ]);
        buttonMenu.popup(this.window);
    }

    openDevTools() {
        this.view.webContents.openDevTools();
    }

    goToSearch(text) {
        this.show();
        this.view.webContents.send("searchManager-goToSearch", text);
    }

    addBookmark(name, url) {
        this.view.webContents.send("bookmarkManager-addBookmark", name, url);
    }

    addHistoryItem(url) {
        this.view.webContents.send("historyManager-insertBeforeHistoryItem", url);
    }
}

module.exports = Overlay;