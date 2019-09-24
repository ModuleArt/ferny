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
        let size = this.window.getBounds();
        this.view.setBounds({ x: 0, y: this.top, width: size.width, height: size.height - this.top });
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
        this.view.webContents.send("overlay-scrollToId", id);
    }

    showButtonMenu() {
        let buttonMenu = Menu.buildFromTemplate([{ 
            label: "Show overlay", icon: this.appPath + "/imgs/icons16/details.png", click: () => { 
                this.show(); 
            } }, { type: "separator" }, { 
            label: "Bookmarks", icon: this.appPath + "/imgs/icons16/bookmarks.png", accelerator: "CmdOrCtrl+B", click: () => { 
                this.scrollToId("bookmarks-title"); 
            } }, { 
            label: "History", icon: this.appPath + "/imgs/icons16/history.png", accelerator: "CmdOrCtrl+H", click: () => { 
                this.scrollToId("history-title"); 
            } }, { 
            label: "Downloads", icon: this.appPath + "/imgs/icons16/downloads.png", accelerator: "CmdOrCtrl+D", click: () => { 
                this.scrollToId("downloads-title"); 
            } }
          ]);
        buttonMenu.popup(this.window);
    }

    openDevTools() {
        this.view.webContents.openDevTools();
    }

    goToSearch(text, cursorPos) {
        this.scrollToId("search-title"); 
        this.view.webContents.send("searchManager-goToSearch", text, cursorPos);
    }

    performSearch(text) {
        this.view.webContents.send("searchManager-performSearch", text);
    }

    addBookmark(name, url) {
        this.view.webContents.send("bookmarkManager-addBookmark", name, url);
    }

    addHistoryItem(url) {
        this.view.webContents.send("historyManager-insertBeforeHistoryItem", url);
    }

    clearHistory() {
        this.view.webContents.send("historyManager-clearHistory");
    }

    changeTheme(theme) {
        this.view.webContents.send("action-change-theme", theme);
    }

    removeFolder(id) {
        this.view.webContents.send("bookmarkManager-removeFolder", id);
    }
}

module.exports = Overlay;