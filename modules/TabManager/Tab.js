const EventEmitter = require("events");
const { BrowserView } = require('electron');
const fileExtension = require('file-extension');
const parsePath = require("parse-path");

const extToImagePath = require(__dirname + "/../extToImagePath.js");

class Tab extends EventEmitter {
    id = null;
    view = null;
    window = null;

    constructor(window, id) {
        super();

        this.id = id;
        this.window = window;

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
}

module.exports = Tab;