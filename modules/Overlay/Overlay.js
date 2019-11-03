const EventEmitter = require("events");
const { BrowserView, Menu, MenuItem, clipboard } = require('electron');

class Overlay extends EventEmitter {
    window = null;
    view = null;
    top = 34;
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
        // this.view.setAutoResize({
        //     width: true,
        //     height: true
        // });
        // this.view.setBackgroundColor("#66CD00");
        this.view.webContents.loadFile(this.appPath + "/html/overlay.html");

        this.view.webContents.on("context-menu", (event, params) => {
            // console.log(params);
            if(params.isEditable) {
                let editMenu = Menu.buildFromTemplate([{ 
                    label: "Cut", icon: this.appPath + "/imgs/old-icons16/cut.png", accelerator: "CmdOrCtrl+X", enabled: params.editFlags.canCut, click: () => { 
                        this.view.webContents.cut();
                    } }, { 
                    label: "Copy", icon: this.appPath + "/imgs/icons16/copy.png", accelerator: "CmdOrCtrl+C", enabled: params.editFlags.canCopy, click: () => { 
                        this.view.webContents.copy();
                    } }, { 
                    label: "Paste", icon: this.appPath + "/imgs/icons16/paste.png", accelerator: "CmdOrCtrl+V", enabled: params.editFlags.canPaste, click: () => { 
                        this.view.webContents.paste();
                    } }, { type: "separator" }, { 
                    label: "Undo", icon: this.appPath + "/imgs/icons16/undo.png", accelerator: "CmdOrCtrl+Z", enabled: params.editFlags.canUndo, click: () => { 
                        this.view.webContents.undo();
                    } }, { 
                    label: "Redo", icon: this.appPath + "/imgs/icons16/redo.png", accelerator: "CmdOrCtrl+Shift+Z", enabled: params.editFlags.canRedo, click: () => {
                        this.view.webContents.redo();
                    } }, { type: "separator" }, { 
                    label: "Select all", icon: this.appPath + "/imgs/old-icons16/select-all.png", accelerator: "CmdOrCtrl+A", enabled: params.editFlags.canSelectAll, click: () => { 
                        this.view.webContents.selectAll();
                    } }, { type: "separator" }, { 
                    label: "Delete", icon: this.appPath + "/imgs/icons16/delete.png", accelerator: "Backspace", enabled: params.editFlags.canDelete, click: () => { 
                        this.view.webContents.delete();
                    } }
                ]);

                if(params.y < 320) {
                    let mi = new MenuItem({
                        label: "Paste and search", 
                        icon: appPath + "/imgs/icons16/zoom.png", 
                        enabled: params.editFlags.canPaste, 
                        click: () => { 
                            this.performSearch(clipboard.readText()); }
                    });
                    let sep = new MenuItem({
                        type: "separator"
                    });
                    editMenu.insert(4, mi);
                    editMenu.insert(5, sep);
                }

                editMenu.popup(this.window);
            }
        });
    }

    refreshBounds() {
        let size = this.window.getSize();
        this.view.setBounds({ 
            x: 0,
            y: this.top, 
            width: size[0],
            height: size[1] - this.top 
        });
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
            label: "Show overlay", icon: this.appPath + "/imgs/icons16/overlay.png", accelerator: "F1", click: () => { 
                this.show(); 
            } }, { type: "separator" }, { 
            label: "Bookmarks", icon: this.appPath + "/imgs/icons16/bookmarks.png", accelerator: "CmdOrCtrl+B", click: () => { 
                this.scrollToId("bookmarks-title"); 
            } }, { 
            label: "History", icon: this.appPath + "/imgs/icons16/history.png", accelerator: "CmdOrCtrl+H", click: () => { 
                this.scrollToId("history-title"); 
            } }, { 
            label: "Downloads", icon: this.appPath + "/imgs/icons16/download.png", accelerator: "CmdOrCtrl+D", click: () => { 
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

    addFolderWithBookmarks(folderName, bookmarks) {
        this.view.webContents.send("bookmarkManager-addFolderWithBookmarks", folderName, bookmarks);
    }

    addHistoryItem(url) {
        this.view.webContents.send("historyManager-insertBeforeHistoryItem", url);
    }

    clearHistory() {
        this.view.webContents.send("historyManager-clearHistory");
    }

    clearDownloads() {
        this.view.webContents.send("downloadManager-clearDownloads");
    }

    updateTheme() {
        this.view.webContents.send("overlay-updateTheme");
    }

    removeFolder(id) {
        this.view.webContents.send("bookmarkManager-removeFolder", id);
    }

    createDownload(download) {
        this.view.webContents.send("downloadManager-createDownload", download);
    }

    setDownloadStatusInterrupted(download) {
        this.view.webContents.send("downloadManager-setDownloadStatusInterrupted", download);
    }

    setDownloadStatusPause(download) {
        this.view.webContents.send("downloadManager-setDownloadStatusPause", download);
    }

    setDownloadProcess(download) {
        this.view.webContents.send("downloadManager-setDownloadProcess", download);
    }

    setDownloadStatusDone(download) {
        this.view.webContents.send("downloadManager-setDownloadStatusDone", download);
    }

    setDownloadStatusFailed(download) {
        this.view.webContents.send("downloadManager-setDownloadStatusFailed", download);
    }

    setSearchEngine(engineName) {
        this.view.webContents.send("searchManager-setSearchEngine", engineName);
    }

    setFullscreen(bool) {
        if(bool) {
            this.top = 0;
        } else {
            this.top = 34;
        }
        this.refreshBounds();
    }

    checkIfBookmarked(url) {
        this.view.webContents.send("bookmarkManager-checkIfBookmarked", url);
    }

    showBookmarkOptions(id) {
        this.scrollToId("bookmarks-title");
        this.view.webContents.send("bookmarkManager-showBookmarkOptions", id);
    }
}

module.exports = Overlay;