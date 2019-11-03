const EventEmitter = require("events");
const { BrowserView, Menu, MenuItem, clipboard } = require("electron");
const fileExtension = require("file-extension");
const parsePath = require("parse-path");
const parseUrl = require("parse-url");

const extToImagePath = require(__dirname + "/../extToImagePath.js");

class Tab extends EventEmitter {
    id = null;
    view = null;
    window = null;
    previewTimeout = null;
    position = null;

    constructor(window, id, appPath) {
        super();

        this.id = id;
        this.window = window;
        this.appPath = appPath;

        this.view = new BrowserView({
            webPreferences: {
                preload: appPath + "/js/webview.js"
            }
        });
        this.view.setBackgroundColor("#FFFFFF");
        // this.view.setAutoResize({
        //     width: true,
        //     height: true
        // });

        this.view.webContents.on("page-title-updated", (event, title, explicitSet) => {
            this.window.webContents.send("tabRenderer-setTabTitle", { id: this.id, title });
        });

        this.view.webContents.on("page-favicon-updated", (event, favicons) => {
            this.window.webContents.send("tabRenderer-setTabIcon", { id: this.id, icon: favicons[0] });
        });
        
        this.view.webContents.on("new-window", (event, url, frameName, disposition, options, additionalFeatures, reffer) => {
            event.preventDefault();
            if(disposition === "background-tab") {
                this.emit("add-tab", url, false);
            } else {
                this.emit("add-tab", url, true);
            }
        });

        this.view.webContents.on("did-navigate", (event, url, httpResponseCode, httpStatusText) => {
            this.window.webContents.send("tabRenderer-setTabIcon", { id: this.id, icon: __dirname + "/../../imgs/gifs/page-loading.gif" });
            this.window.webContents.send("tabRenderer-updateNavigationButtons", {
                canGoBack: this.view.webContents.canGoBack(),
                canGoForward: this.view.webContents.canGoForward(),
                isLoading: this.view.webContents.isLoading()
            });
            this.window.webContents.send("tabRenderer-updateAddressBar", url);

            if(parsePath(url).protocol === "file") {
                // if(isDirectory(url)) {
                //     console.log(url);
                //     this.window.webContents.send("tabRenderer-setTabIcon", { id: this.id, icon: __dirname + "/imgs/icons16/folder.png" });
                // } else {
                //     console.log("else")
                    
                // }
                let fileName = url.replace(/^.*[\\\/]/, "");
                this.window.webContents.send("tabRenderer-setTabTitle", { id: this.id, title: fileName });
                this.window.webContents.send("tabRenderer-setTabIcon", { id: this.id, icon: extToImagePath(fileExtension(url)) });
            }

            this.emit("add-history-item", url);
        });

        this.view.webContents.on("did-navigate-in-page", (event, url, isMainFrame, frameProcessId, frameRoutingId) => {
            if(isMainFrame) {
                this.window.webContents.send("tabRenderer-updateNavigationButtons", {
                    canGoBack: this.view.webContents.canGoBack(),
                    canGoForward: this.view.webContents.canGoForward(),
                    isLoading: this.view.webContents.isLoading()
                });
                this.window.webContents.send("tabRenderer-updateAddressBar", url);
            }
        });

        this.view.webContents.on("did-fail-load", (event, errorCode, errorDescription, validatedURL, isMainFrame, frameProcessId, frameRoutingId) => {
            this.window.webContents.send("tabRenderer-updateNavigationButtons", {
                canGoBack: this.view.webContents.canGoBack(),
                canGoForward: this.view.webContents.canGoForward(),
                isLoading: this.view.webContents.isLoading()
            });

            this.emit("add-status-notif", "Connection failed: " + errorDescription + " (" + errorCode + ")", "error");
        });

        this.view.webContents.on("certificate-error", (event, url, error, certificate, callback) => {
            this.emit("add-status-notif", "Certificate error: " + url + " (" + error + ")", "warning");
        });

        this.view.webContents.on("dom-ready", (event) => {
            this.view.webContents.insertCSS(`
                html, body { background-color: white; }
            `);
        });

        this.view.webContents.on("did-start-loading", () => {
            this.window.webContents.send("tabRenderer-updateNavigationButtons", {
                canGoBack: this.view.webContents.canGoBack(),
                canGoForward: this.view.webContents.canGoForward(),
                isLoading: this.view.webContents.isLoading()
            });
        });

        this.view.webContents.on("did-stop-loading", () => {
            this.window.webContents.send("tabRenderer-updateNavigationButtons", {
                canGoBack: this.view.webContents.canGoBack(),
                canGoForward: this.view.webContents.canGoForward(),
                isLoading: this.view.webContents.isLoading()
            });
        });

        this.view.webContents.on("enter-html-full-screen", () => {
            this.emit("add-status-notif", "Press F11 to exit full screen", "info");
            this.emit("fullscreen", true);
        });

        this.view.webContents.on("leave-html-full-screen", () => {
            this.emit("fullscreen", false);
        });

        this.view.webContents.on("update-target-url", (event, url) => {
            this.window.webContents.send("tabRenderer-updateTargetURL", url);
        });

        this.view.webContents.on("context-menu", (event, params) => {
            let rmbMenuItems = [];

            if(params.isEditable) {
                let editableItems = [{
                    label: "Cut", icon: this.appPath + "/imgs/icons16/cut.png", accelerator: "CmdOrCtrl+X", enabled: params.editFlags.canCut, click: () => { 
                        this.cut();
                    } }, { 
                    label: "Copy", icon: this.appPath + "/imgs/icons16/copy.png", accelerator: "CmdOrCtrl+C", enabled: params.editFlags.canCopy, click: () => { 
                        this.copy();
                    } }, {
                    label: "Paste", icon: this.appPath + "/imgs/icons16/paste.png", accelerator: "CmdOrCtrl+V", enabled: params.editFlags.canPaste, click: () => { 
                        this.paste();
                    } }, { type: "separator" }, { 
                    label: "Paste as plain text", icon: this.appPath + "/imgs/icons16/paste-special.png", accelerator: "CmdOrCtrl+Shift+V", enabled: params.editFlags.canPaste, click: () => { 
                        this.pasteAndMatchStyle();
                    } }, { type: "separator" }, { 
                    label: "Undo", icon: this.appPath + "/imgs/icons16/undo.png", accelerator: "CmdOrCtrl+Z", enabled: params.editFlags.canUndo, click: () => { 
                        this.undo();
                    } }, { 
                    label: "Redo", icon: this.appPath + "/imgs/icons16/redo.png", accelerator: "CmdOrCtrl+Shift+Z", enabled: params.editFlags.canRedo, click: () => {
                        this.redo();
                    } }, { type: "separator" }, { 
                    label: "Select all", icon: this.appPath + "/imgs/icons16/select-all.png", accelerator: "CmdOrCtrl+A", enabled: params.editFlags.canSelectAll, click: () => { 
                        this.selectAll();
                    } }, { type: "separator" }, { 
                    label: "Delete", icon: this.appPath + "/imgs/icons16/delete.png", accelerator: "Backspace", enabled: params.editFlags.canDelete, click: () => { 
                        this.delete();
                    } }, { type: "separator" }
                ];
                rmbMenuItems = rmbMenuItems.concat(editableItems);
            } else {
                let pageBool = true;
                if(params.linkURL.length > 0) {
                    pageBool = false;
                    let text = params.linkText;
                    if(text.length > 30) {
                        text = text.substring(0, 30) + "...";
                    }
                    let linkItems = [{
                        label: "Open link in new tab", icon: this.appPath + "/imgs/icons16/tab.png", click: () => { 
                            this.emit("add-tab", params.linkURL, false);
                        } }, { type: "separator" }, { 
                        label: "Copy link text", icon: this.appPath + "/imgs/old-icons16/text.png", enabled: (params.linkText > 0), click: () => { 
                            clipboard.writeText(params.linkText); 
                        } }, { 
                        label: "Copy link address", icon: this.appPath + "/imgs/icons16/link.png", click: () => { 
                            clipboard.writeText(params.linkURL); 
                        } }, {
                        label: "Bookmark link", icon: this.appPath + "/imgs/icons16/add-bookmark.png", click: () => { 
                            this.emit("bookmark-tab", params.linkText, params.linkURL);
                        } }, {
                        label: `Search for "${text}"`, icon: this.appPath + "/imgs/icons16/zoom.png", enabled: (text.length > 0), click: () => { 
                            this.emit("search-for", params.linkText);
                        } }, { type: "separator" }
                    ];
                    rmbMenuItems = rmbMenuItems.concat(linkItems);
                }

                if(params.hasImageContents) {
                    pageBool = false;
                    let imageItems = [{
                        label: "Open image in new tab", icon: this.appPath + "/imgs/old-icons16/image.png", click: () => { 
                            this.emit("add-tab", params.srcURL, true);
                        } }, { type: "separator" }, { 
                        label: "Download image", icon: this.appPath + "/imgs/icons16/download.png", click: () => { 
                            this.view.webContents.downloadURL(params.srcURL);
                        } }, { 
                        label: "Copy image", icon: this.appPath + "/imgs/icons16/copy.png", click: () => { 
                            this.view.webContents.copyImageAt(params.x, params.y);
                        } }, { 
                        label: "Copy image address", icon: this.appPath + "/imgs/icons16/link.png", click: () => { 
                            clipboard.writeText(params.srcURL);
                        } }, { type: "separator" }
                    ];
                    rmbMenuItems = rmbMenuItems.concat(imageItems);
                }

                if(params.selectionText.length > 0) {
                    pageBool = false;
                    let text = params.selectionText;
                    if(text.length > 30) {
                        text = text.substring(0, 30) + "...";
                    }
                    let textItems = [{
                        label: "Copy", icon: this.appPath + "/imgs/icons16/copy.png", accelerator: "CmdOrCtrl+C", enabled: params.editFlags.canCopy, click: () => { 
                            this.copy();
                        } }, {
                        label: `Search for "${text}"`, icon: this.appPath + "/imgs/icons16/zoom.png", enabled: params.editFlags.canCopy, click: () => { 
                            this.emit("search-for", params.selectionText);
                        } }, { type: "separator" }
                    ];
                    rmbMenuItems = rmbMenuItems.concat(textItems);
                }

                if(pageBool) {
                    let pageItems = [{
                        label: "Back", icon: this.appPath + "/imgs/icons16/back.png", accelerator: "Alt+Left", enabled: this.view.webContents.canGoBack(), click: () => { 
                            this.goBack();
                        } }, { 
                        label: "Forward", icon: this.appPath + "/imgs/icons16/forward.png", accelerator: "Alt+Right", enabled: this.view.webContents.canGoForward(), click: () => { 
                            this.goForward();
                        } }, { 
                        label: "Reload", icon: this.appPath + "/imgs/icons16/reload.png", accelerator: "F5", click: () => { 
                            this.reload();
                        } }, { type: "separator" }, {
                        label: "Download page", icon: this.appPath + "/imgs/icons16/download.png", accelerator: "CmdOrCtrl+Shift+S", click: () => { 
                            this.downloadPage();
                        } }, {
                        label: "Bookmark page", icon: this.appPath + "/imgs/icons16/add-bookmark.png", click: () => { 
                            this.emit("bookmark-tab", this.getTitle(), this.getURL());
                        } }, { type: "separator" }, {
                        label: "Select all", icon: this.appPath + "/imgs/icons16/select-all.png", accelerator: "CmdOrCtrl+A", click: () => { 
                            this.selectAll();
                        } }, { type: "separator" }, {
                        label: "View page source", icon: this.appPath + "/imgs/icons16/code.png", click: () => {
                            this.viewPageSource();
                        } }
                    ];
                    rmbMenuItems = rmbMenuItems.concat(pageItems);
                }
            }

            rmbMenuItems.push({
                label: "Inspect element", icon: this.appPath + "/imgs/icons16/inspect.png", click: () => {
                    this.inspectElement(params.x, params.y);
                } }
            );

            let rmbMenu = Menu.buildFromTemplate(rmbMenuItems);
            rmbMenu.popup(this.window);
        });
    }

    getId() {
        return this.id;
    }

    setBounds(x, y, width, height) {
        this.view.setBounds({ x, y, width, height });
    }

    inspectElement(x, y) {
        this.view.webContents.inspectElement(x, y);
    }

    viewPageSource() {
        this.emit("add-tab", "view-source:" + this.getURL(), true);
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
        this.window.webContents.send("tabRenderer-updateNavigationButtons", {
            canGoBack: this.view.webContents.canGoBack(),
            canGoForward: this.view.webContents.canGoForward(),
            isLoading: this.view.webContents.isLoading()
        });
        this.window.webContents.send("tabRenderer-updateAddressBar", this.getURL());
        this.view.webContents.focus();

        this.emit("activate", this);

        return null;
    }

    isActive() {
        let active = false;
        if(this.window.getBrowserView() === this.view) {
            active = true;
        }
        return active;
    }

    goBack() {
        this.view.webContents.goBack();
    }

    goForward() {
        this.view.webContents.goForward();
    }

    canGoBack() {
        return this.view.webContents.canGoBack();
    }

    reload() {
        this.view.webContents.reload();
    }

    stop() {
        this.view.webContents.stop();
    }

    getURL() {
        return this.view.webContents.getURL();
    }

    getTitle() {
        return this.view.webContents.getTitle();
    }

    showPreview() {
        let image = this.view.webContents.capturePage();
        this.previewTimeout = setTimeout(() => {
            image.then((nativeImage) => {
                this.window.webContents.send("tabRenderer-showPreview", this.id, nativeImage.toDataURL());
            });
        }, 1000);
    }

    hidePreview() {
        clearTimeout(this.previewTimeout);
        this.window.webContents.send("tabRenderer-hidePreview", this.id);
    }

    closeOthers() {
        this.emit("close-others", this.id);
    }

    closeToTheRight() {
        this.emit("close-to-the-right", this.position);
    }

    reloadIgnoringCache() {
        this.view.webContents.reloadIgnoringCache();
    }

    goHome() {
        this.emit("go-home", this);
    }

    copyURL() {
        clipboard.writeText(this.getURL());
    }

    duplicate() {
        this.emit("add-tab", this.getURL(), true);
    }

    showMenu() {
        let tabMenu = Menu.buildFromTemplate([{ 
            label: "Back", icon: this.appPath + "/imgs/icons16/back.png", accelerator: "Alt+Left", enabled: this.view.webContents.canGoBack(), click: () => { 
                this.goBack(); 
            } }, { 
            label: "Forward", icon: this.appPath + "/imgs/icons16/forward.png", accelerator: "Alt+Right", enabled: this.view.webContents.canGoForward(), click: () => { 
                this.goForward(); 
            } }, { 
            label: "Reload", icon: this.appPath + "/imgs/icons16/reload.png", accelerator: "F5", click: () => { 
                this.reload(); 
            } }, {
            label: "Reload ignoring cache", icon: this.appPath + "/imgs/icons16/db-reload.png", accelerator: "CmdOrCtrl+Shift+F5", click: () => { 
                this.reloadIgnoringCache(); 
            } }, { type: "separator" }, { 
            label: "Duplicate", icon: this.appPath + "/imgs/icons16/copy.png", accelerator: "CmdOrCtrl+Shift+D", click: () => { 
                this.duplicate(); 
            } }, { 
            label: "Copy URL", icon: this.appPath + "/imgs/icons16/link.png", accelerator: "CmdOrCtrl+Shift+C", click: () => { 
                this.copyURL(); 
            } }, { 
            label: "Go home", icon: this.appPath + "/imgs/icons16/home.png", accelerator: "CmdOrCtrl+Shift+H", click: () => { 
                this.goHome(); 
            } }, { 
            label: "Bookmark tab", icon: this.appPath + "/imgs/icons16/add-bookmark.png", accelerator: "CmdOrCtrl+Shift+B", click: () => { 
                this.emit("bookmark-tab", this.getTitle(), this.getURL());
            } }, { type: "separator" }, { 
            label: "Move tab", icon: this.appPath + "/imgs/icons16/move-horizontal.png", submenu: [{
                label: "Move left", accelerator: "CmdOrCtrl+Shift+PageUp", icon: this.appPath + "/imgs/icons16/prev.png", click: () => {
                    this.moveLeft();
                } }, {
                label: "Move right", accelerator: "CmdOrCtrl+Shift+PageDown", icon: this.appPath + "/imgs/icons16/next.png", click: () => {
                    this.moveRight();
                } }, { type: "separator" }, {
                label: "Move to start", accelerator: "CmdOrCtrl+Shift+Home", icon: this.appPath + "/imgs/icons16/to-start.png", click: () => {
                    this.moveToStart();
                } }, {
                label: "Move to end", accelerator: "CmdOrCtrl+Shift+End", icon: this.appPath + "/imgs/icons16/to-end.png", click: () => {
                    this.moveToEnd();
                } } 
            ] }, { type: "separator" }, { 
            label: "Close to the right", icon: this.appPath + "/imgs/icons16/swipe-right.png", click: () => { 
                this.closeToTheRight(); 
            } }, { 
            label: "Close others", icon: this.appPath + "/imgs/icons16/swipe-both.png", accelerator: "CmdOrCtrl+Shift+W", click: () => { 
                this.closeOthers(); 
            } }, { 
            label: "Close tab", icon: this.appPath + "/imgs/icons16/close.png", accelerator: "CmdOrCtrl+W", click: () => { 
                this.close(); 
            } }
        ]);

        let history = new MenuItem({
            label: "Tab history",
            icon: this.appPath + "/imgs/icons16/history.png",
            submenu: []
        });

        this.view.webContents.history.forEach((value, index) => {
            let subtext = value;
            if(subtext.length > 30) {
                subtext = subtext.substring(0, 30) + "...";
            }

            let parsedUrl = parseUrl(value);
            let text = parsedUrl.resource + parsedUrl.pathname;
            if(text.length > 30) {
                text = text.substring(0, 30) + "...";
            }

            let historyItem = new MenuItem({
                label: text,
                sublabel: subtext,
                click: () => {
                    this.navigate(value);
                },
                icon: this.appPath + "/imgs/icons16/link.png"
            });
            history.submenu.append(historyItem);
        });

        tabMenu.insert(10, history);

        tabMenu.popup(this.window);
    }

    cut() {
        this.view.webContents.cut();
    }

    copy() {
        this.view.webContents.copy();
    }

    paste() {
        this.view.webContents.paste();
    }

    pasteAndMatchStyle() {
        this.view.webContents.pasteAndMatchStyle();
    }

    undo() {
        this.view.webContents.undo();
    }

    redo() {
        this.view.webContents.redo();
    }

    selectAll() {
        this.view.webContents.selectAll();
    }

    delete() {
        this.view.webContents.delete();
    }

    getPosition() {
        return this.position;
    }

    setPosition(position) {
        this.position = position;
    }

    nextTab() {
        this.emit("next-tab", this.position);
    }

    prevTab() {
        this.emit("prev-tab", this.position);
    }

    openDevTools() {
        this.view.webContents.openDevTools();
    }

    zoomIn() {
        let zoomFactor = this.view.webContents.getZoomFactor();
        if(zoomFactor < 2.5) {
          this.view.webContents.setZoomFactor(zoomFactor + 0.1);
          this.emit("refresh-zoom-notif", Math.round((zoomFactor + 0.1) * 100));
        }

        return null;
    }

    zoomOut() {
        let zoomFactor = this.view.webContents.getZoomFactor();
        if(zoomFactor > 0.3) {
          this.view.webContents.setZoomFactor(zoomFactor - 0.1);
          this.emit("refresh-zoom-notif", Math.round((zoomFactor - 0.1) * 100));
        }
        return null;
    }

    zoomToActualSize() {
        let zoomFactor = this.view.webContents.getZoomFactor();
        if(zoomFactor !== 1) {
            this.view.webContents.setZoomFactor(1);
            this.emit("refresh-zoom-notif", 100);
        }

        return null;
    }

    moveLeft() {
        this.emit("move-left", this.id, this.position);
    }

    moveRight() {
        this.emit("move-right", this.id, this.position);
    }

    moveToStart() {
        this.emit("move-to-start", this.id, this.position);
    }

    moveToEnd() {
        this.window.webContents.send("tabRenderer-moveTabToEnd", this.id);
    }

    popupTabHistory() {
        let tabHistory = Menu.buildFromTemplate([]);

        this.view.webContents.history.forEach((value, index) => {
            let subtext = value;
            if(subtext.length > 30) {
                subtext = subtext.substring(0, 30) + "...";
            }

            let parsedUrl = parseUrl(value);
            let text = parsedUrl.resource + parsedUrl.pathname;
            if(text.length > 30) {
                text = text.substring(0, 30) + "...";
            }

            let historyItem = new MenuItem({
                label: text,
                sublabel: subtext,
                click: () => {
                    this.navigate(value);
                },
                icon: this.appPath + "/imgs/icons16/link.png"
            });
            tabHistory.append(historyItem);
        });

        let sep = new MenuItem({ type: "separator" });
        tabHistory.append(sep);

        let showFullHistory = new MenuItem({
            label: "Show full history",
            accelerator: "CmdOrCtrl+H",
            click: () => {
                this.emit("open-history");
            },
            icon: this.appPath + "/imgs/icons16/history.png"
        });
        tabHistory.append(showFullHistory);

        tabHistory.popup(this.window);
    }

    downloadPage() {
        this.view.webContents.downloadURL(this.getURL());
    }
}

module.exports = Tab;