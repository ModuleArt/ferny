const EventEmitter = require("events");
const { BrowserView, Menu, clipboard } = require('electron');
const fileExtension = require('file-extension');
const parsePath = require("parse-path");

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

        this.view = new BrowserView();
        this.view.setAutoResize({
            width: true,
            height: true
        });

        this.view.webContents.on("page-title-updated", (event, title, explicitSet) => {
            this.window.webContents.send("tabRenderer-setTabTitle", { id: this.id, title: title });
        });

        this.view.webContents.on("page-favicon-updated", (event, favicons) => {
            this.window.webContents.send("tabRenderer-setTabIcon", { id: this.id, icon: favicons[0] });
        });
        
        this.view.webContents.on("new-window", (event, url, frameName, disposition, options, additionalFeatures, reffer) => {
            if(disposition == "background-tab") {
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

            this.emit("add-history-item");
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

            let url = this.getURL();
            if(parsePath(url).protocol == 'file') {
                this.window.webContents.send("tabRenderer-setTabTitle", { id: this.id, title: url });
                this.window.webContents.send("tabRenderer-setTabIcon", { id: this.id, icon: extToImagePath(fileExtension(url)) });
            }
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
        this.view.setBackgroundColor("#FFFFFF");
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
        if(this.window.getBrowserView() == this.view) {
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

    reload() {
        this.view.webContents.reload();
    }

    stop() {
        this.view.webContents.stop();
    }

    getURL() {
        return this.view.webContents.getURL();
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
        let tabMenu = Menu.buildFromTemplate([
            { label: 'Back', icon: this.appPath + '/imgs/icons16/back.png', accelerator: 'Alt+Left', click: () => { this.goBack(); } },
            { label: 'Forward', icon: this.appPath + '/imgs/icons16/forward.png', accelerator: 'Alt+Right', click: () => { this.goForward(); } },
            { label: 'Reload', icon: this.appPath + '/imgs/icons16/reload.png', accelerator: 'F5', click: () => { this.reload(); } },
            { type: 'separator' },
            { label: 'Duplicate', icon: this.appPath + '/imgs/icons16/copy.png', accelerator: 'CmdOrCtrl+Shift+D', click: () => { this.duplicate(); } },
            { label: 'Copy URL', icon: this.appPath + '/imgs/icons16/copy-link.png', accelerator: 'CmdOrCtrl+Shift+C', click: () => { this.copyURL(); } },
            { label: 'Go home', icon: this.appPath + '/imgs/icons16/home.png', accelerator: 'CmdOrCtrl+Shift+H', click: () => { this.goHome(); } },
            { type: 'separator' },
            { label: 'Reload ignoring cache', accelerator: 'CmdOrCtrl+F5', click: () => { this.reloadIgnoringCache(); } },
            { type: 'separator' },
            { label: 'Close to the right', icon: this.appPath + '/imgs/icons16/swipe-right.png', click: () => { this.closeToTheRight(); } },
            { label: 'Close others', accelerator: 'CmdOrCtrl+Shift+W', click: () => { this.closeOthers(); } },
            { label: 'Close tab', icon: this.appPath + '/imgs/icons16/close.png', accelerator: 'CmdOrCtrl+W', click: () => { this.close(); } }
        ]);
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
        }
    }

    zoomOut() {
        let zoomFactor = this.view.webContents.getZoomFactor();
        if(zoomFactor > 0.3) {
          this.view.webContents.setZoomFactor(zoomFactor - 0.1);
        }
    }

    zoomToActualSize() {
        let zoomFactor = this.view.webContents.getZoomFactor();
        if(zoomFactor != 1) {
            this.view.webContents.setZoomFactor(1);
        }
    }
}

module.exports = Tab;