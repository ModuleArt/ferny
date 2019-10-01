/*
.##.....##....###....####.##....##
.###...###...##.##....##..###...##
.####.####..##...##...##..####..##
.##.###.##.##.....##..##..##.##.##
.##.....##.#########..##..##..####
.##.....##.##.....##..##..##...###
.##.....##.##.....##.####.##....##
*/

const { ipcMain, app, Menu, MenuItem, BrowserWindow, dialog, clipboard, session } = require("electron");
const { autoUpdater } = require("electron-updater");
const os = require("os");
const fs = require("fs");
const ppath = require("persist-path")("Ferny");

/*
.##.....##..#######..########..##.....##.##.......########..######.
.###...###.##.....##.##.....##.##.....##.##.......##.......##....##
.####.####.##.....##.##.....##.##.....##.##.......##.......##......
.##.###.##.##.....##.##.....##.##.....##.##.......######....######.
.##.....##.##.....##.##.....##.##.....##.##.......##.............##
.##.....##.##.....##.##.....##.##.....##.##.......##.......##....##
.##.....##..#######..########...#######..########.########..######.
*/

const saveFileToJsonFolder = require(app.getAppPath() + "/modules/saveFileToJsonFolder.js");
const loadTheme = require(app.getAppPath() + "/modules/loadTheme.js");
const loadLastTab = require(app.getAppPath() + "/modules/loadLastTab.js");
const loadStartup = require(app.getAppPath() + "/modules/loadStartup.js");
const loadHomePage = require(app.getAppPath() + "/modules/loadHomePage.js");
const loadBounds = require(app.getAppPath() + "/modules/loadBounds.js");

const TabManager = require(app.getAppPath() + "/modules/TabManager/TabManager.js");
const Overlay = require(app.getAppPath() + "/modules/Overlay/Overlay.js");

/*
..######..####.##....##..######...##.......########....####.##....##..######..########....###....##....##..######..########
.##....##..##..###...##.##....##..##.......##...........##..###...##.##....##....##......##.##...###...##.##....##.##......
.##........##..####..##.##........##.......##...........##..####..##.##..........##.....##...##..####..##.##.......##......
..######...##..##.##.##.##...####.##.......######.......##..##.##.##..######.....##....##.....##.##.##.##.##.......######..
.......##..##..##..####.##....##..##.......##...........##..##..####.......##....##....#########.##..####.##.......##......
.##....##..##..##...###.##....##..##.......##...........##..##...###.##....##....##....##.....##.##...###.##....##.##......
..######..####.##....##..######...########.########....####.##....##..######.....##....##.....##.##....##..######..########
*/

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}

/*
.##.....##....###....########..####....###....########..##.......########..######.
.##.....##...##.##...##.....##..##....##.##...##.....##.##.......##.......##....##
.##.....##..##...##..##.....##..##...##...##..##.....##.##.......##.......##......
.##.....##.##.....##.########...##..##.....##.########..##.......######....######.
..##...##..#########.##...##....##..#########.##.....##.##.......##.............##
...##.##...##.....##.##....##...##..##.....##.##.....##.##.......##.......##....##
....###....##.....##.##.....##.####.##.....##.########..########.########..######.
*/

let sideMenu = null;

let mainWindow = null;
let welcomeWindow = null;
let aboutWindow = null;
let settingsWindow = null;

let downloads = [];
let downloadCounter = 0;

let updateCancellationToken = null;

let tabManager = null;
let overlay = null;

/*
....###....########..########.
...##.##...##.....##.##.....##
..##...##..##.....##.##.....##
.##.....##.########..########.
.#########.##........##.......
.##.....##.##........##.......
.##.....##.##........##.......
*/

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("ready", function() {
  autoUpdater.logger = require("electron-log");
  autoUpdater.logger.transports.file.level = "info";

  autoUpdater.on("checking-for-update", () => {
    mainWindow.webContents.send("action-add-status-notif", { type: "info", text: "Checking for updates..." });
  });

  autoUpdater.on("error", (error) => {
    mainWindow.webContents.send("action-add-status-notif", { type: "error", text: "Update error: " + error });
  });

  autoUpdater.on("update-not-available", () => {
    mainWindow.webContents.send("action-add-status-notif", { type: "success", text: "App is up to date!" });
  });

  autoUpdater.on("update-available", (info) => {
    mainWindow.webContents.send("action-add-status-notif", { type: "success", text: `Update is available: ${info.releaseName}. Download started...` });
  });

  autoUpdater.on("update-downloaded", () => {
    mainWindow.webContents.send("action-add-quest-notif", { text: "Update is downloaded!", ops: [{ 
      text: "Install now", 
      icon: "check-16", 
      click: "installUpdate();" 
    }] });
  });

  autoUpdater.on("download-progress", (progress) => {
    if(progress != null) {
      let perc = Math.round(progress.percent);
      if(perc % 25 == 0 && perc != 100) {
        mainWindow.webContents.send("action-add-quest-notif", { text: `Update is being downloaded: ${perc}%`, ops: [{ 
          text: "Cancel", 
          icon: "cancel-16", 
          click: "cancelUpdate();" 
        }] });
      }
    }
  });

  session.defaultSession.on("will-download", (event, item, webContents) => {
    let index = downloadCounter++;

    downloads.push({ id: index, item });
    overlay.createDownload({
      id: index,
      url: item.getURL(),
      name: item.getFilename(),
      time: item.getStartTime(),
      downloadItem: item
    });
    mainWindow.webContents.send('action-add-status-notif', { type: "info", text: `Download started: "${item.getFilename()}"` });

    item.on("updated", (event, state) => {
      if (state === "interrupted") {
        overlay.setDownloadStatusInterrupted({
          id: index,
          name: item.getFilename()
        });
        mainWindow.webContents.send('action-add-status-notif', { type: "error", text: `Download interrupted: "${item.getFilename()}"` });
      } else if (state === "progressing") {
        if (item.isPaused()) {
          overlay.setDownloadStatusPause({
            id: index,
            bytes: item.getReceivedBytes(),
            total: item.getTotalBytes()
          });
        } else {
          overlay.setDownloadProcess({
            id: index,
            bytes: item.getReceivedBytes(),
            total: item.getTotalBytes()
          });
        }
      }
    });

    item.once("done", (event, state) => {
      if (state === "completed") {
        overlay.setDownloadStatusDone({
          id: index,
          path: item.getSavePath(),
          name: item.getFilename()
        });
        mainWindow.webContents.send('action-add-status-notif', { type: "success", text: `Download completed: "${item.getFilename()}"` });
      } else {
        overlay.setDownloadStatusFailed({
          id: index,
          name: item.getFilename()
        });
        mainWindow.webContents.send('action-add-status-notif', { type: "error", text: `Download failed: "${item.getFilename()}"` });
      }
    });
  });

  showMainWindow();
  // loadWelcome();
});

/*
.####.########...######.....##.....##....###....####.##....##
..##..##.....##.##....##....###...###...##.##....##..###...##
..##..##.....##.##..........####.####..##...##...##..####..##
..##..########..##..........##.###.##.##.....##..##..##.##.##
..##..##........##..........##.....##.#########..##..##..####
..##..##........##....##....##.....##.##.....##..##..##...###
.####.##.........######.....##.....##.##.....##.####.##....##
*/

ipcMain.on('request-cancel-update', (event, arg) => {
  cancelUpdate();
});

ipcMain.on('request-clear-browsing-data', (event, arg) => {
  const ses = mainWindow.webContents.session;

  if(arg.cache) {
    ses.clearCache().then(function() {
      mainWindow.webContents.send('action-add-status-notif', { text: "Cache cleared", type: "success" });
    });

    ses.getCacheSize().then(function(value) {
      let Data = {
        cacheSize: value
      };
    
      event.sender.send('action-set-cache-size', Data);
    });
  }

  if(arg.storage) {
    ses.clearStorageData().then(function() {
      mainWindow.webContents.send('action-add-status-notif', { text: "Storage cleared", type: "success" });
    });
  }
});

ipcMain.on('request-set-cache-size', (event, arg) => {
  const ses = mainWindow.webContents.session;

  ses.getCacheSize().then(function(value) {
    let Data = {
      cacheSize: value
    };
  
    event.sender.send('action-set-cache-size', Data);
  });
});

ipcMain.on('request-info-contextmenu', (event, arg) => {
  let infoMenu = Menu.buildFromTemplate([
    { label: 'Certificate info', accelerator: 'CmdOrCtrl+I', icon: app.getAppPath() + '/imgs/icons16/certificate.png', click: () => { mainWindow.webContents.send('action-page-certificate'); } }
  ]);
  infoMenu.popup(mainWindow);
});

ipcMain.on('request-install-update', (event, arg) => {
  autoUpdater.quitAndInstall();
});

ipcMain.on('action-show-welcome-screen', (event, arg) => {
  showWelcomeWindow();
});

ipcMain.on('request-add-status-notif', (event, arg) => {
  mainWindow.webContents.send('action-add-status-notif', arg);
});

ipcMain.on('request-add-quest-notif', (event, arg) => {
  mainWindow.webContents.send('action-add-quest-notif', arg);
});

ipcMain.on('request-set-about', (event, arg) => {
  let Data = {
    version: app.getVersion(),
    arch: os.arch(),
    platform: process.platform
  };

  event.sender.send('action-set-about', Data);
});

ipcMain.on('request-check-for-updates', (event, arg) => {
  checkForUpdates();
});

ipcMain.on('request-side-menu', (event, arg) => {
  sideMenu.popup(mainWindow);
});

ipcMain.on('request-quit-app', (event, arg) => {
  app.quit();
});

ipcMain.on('request-exit-app-anyway', (event, arg) => {
  saveBounds();
  if(updateCancellationToken != null) {
    updateCancellationToken.cancel();
  }
  app.exit();
});

ipcMain.on('request-minimize-window', (event, arg) => {
  mainWindow.minimize();
});

ipcMain.on('request-maximize-window', (event, arg) => {
  mainWindow.maximize();
});

ipcMain.on('request-unmaximize-window', (event, arg) => {
  mainWindow.unmaximize();
});

ipcMain.on('request-change-theme', (event, theme) => {
  mainWindow.webContents.send('action-change-theme', theme);
  overlay.changeTheme(theme);
});

ipcMain.on('request-toggle-fullscreen', (event, arg) => {
  toggleFullscreen();
});

/*
 # #####   ####              #####   ####  #    # #    # #       ####    ##   #####   ####
 # #    # #    #             #    # #    # #    # ##   # #      #    #  #  #  #    # #
 # #    # #         #####    #    # #    # #    # # #  # #      #    # #    # #    #  ####
 # #####  #                  #    # #    # # ## # #  # # #      #    # ###### #    #      #
 # #      #    #             #    # #    # ##  ## #   ## #      #    # #    # #    # #    #
 # #       ####              #####   ####  #    # #    # ######  ####  #    # #####   ####
*/

ipcMain.on("downloadManager-resumeDownload", (event, id) => {
  for(let i = 0; i < downloads.length; i++) {
    if(downloads[i].id == id) {
      downloads[i].item.resume();
      break;
    }
  }
});

ipcMain.on("downloadManager-pauseDownload", (event, id) => {
  for(let i = 0; i < downloads.length; i++) {
    if(downloads[i].id == id) {
      downloads[i].item.pause();
      break;
    }
  }
});

ipcMain.on("downloadManager-cancelDownload", (event, id) => {
  for(let i = 0; i < downloads.length; i++) {
    if(downloads[i].id == id) {
      downloads[i].item.cancel();
      break;
    }
  }
});

/*
 # #####   ####               ####  ###### ##### ##### # #    #  ####   ####
 # #    # #    #             #      #        #     #   # ##   # #    # #
 # #    # #         #####     ####  #####    #     #   # # #  # #       ####
 # #####  #                       # #        #     #   # #  # # #  ###      #
 # #      #    #             #    # #        #     #   # #   ## #    # #    #
 # #       ####               ####  ######   #     #   # #    #  ####   ####
*/

ipcMain.on("action-open-settings", (event) => {
  showSettingsWindow();
});

ipcMain.on("settings-closeWindow", (event) => {
  settingsWindow.close();
});

/*
 # #####   ####                ##   #####   ####  #    # #####
 # #    # #    #              #  #  #    # #    # #    #   #
 # #    # #         #####    #    # #####  #    # #    #   #
 # #####  #                  ###### #    # #    # #    #   #
 # #      #    #             #    # #    # #    # #    #   #
 # #       ####              #    # #####   ####   ####    #
*/

ipcMain.on("about-closeWindow", (event) => {
  aboutWindow.close();
});

/*
 # #####   ####               ####  #    # ###### #####  #        ##   #   #
 # #    # #    #             #    # #    # #      #    # #       #  #   # #
 # #    # #         #####    #    # #    # #####  #    # #      #    #   #
 # #####  #                  #    # #    # #      #####  #      ######   #
 # #      #    #             #    #  #  #  #      #   #  #      #    #   #
 # #       ####               ####    ##   ###### #    # ###### #    #   #
*/

ipcMain.on("overlay-show", (event) => {
  overlay.show();
});

ipcMain.on("overlay-showButtonMenu", (event) => {
  overlay.showButtonMenu();
});

ipcMain.on("overlay-goToSearch", (event, text, cursorPos) => {
  overlay.goToSearch(text, cursorPos);
});

ipcMain.on("overlay-clearHistory", (event) => {
  overlay.clearHistory();
});

ipcMain.on("overlay-clearDownloads", (event) => {
  overlay.clearDownloads();
});

ipcMain.on("overlay-removeFolder", (event, id) => {
  overlay.removeFolder(id);
});

ipcMain.on("overlay-bookmarkThisPage", (event) => {
  if(tabManager.hasActiveTab()) {
    let at = tabManager.getActiveTab();
    overlay.addBookmark(at.getTitle(), at.getURL());
    overlay.scrollToId("bookmarks-title"); 
  }
});

/*
 # #####   ####              #####   ##   #####     #    #   ##   #    #   ##    ####  ###### #####
 # #    # #    #               #    #  #  #    #    ##  ##  #  #  ##   #  #  #  #    # #      #    #
 # #    # #         #####      #   #    # #####     # ## # #    # # #  # #    # #      #####  #    #
 # #####  #                    #   ###### #    #    #    # ###### #  # # ###### #  ### #      #####
 # #      #    #               #   #    # #    #    #    # #    # #   ## #    # #    # #      #   #
 # #       ####                #   #    # #####     #    # #    # #    # #    #  ####  ###### #    #
*/

ipcMain.on("tabManager-newTab", (event) => {
  tabManager.newTab();
});

ipcMain.on("tabManager-newBackgroundTab", (event) => {
  tabManager.newBackgroundTab();
});


ipcMain.on("tabManager-addTab", (event, url, active) => {
  tabManager.addTab(url, active);
});

ipcMain.on("tabManager-activateTab", (event, id) => {
  tabManager.getTabById(id).activate();
});

ipcMain.on("tabManager-closeTab", (event, id) => {
  tabManager.getTabById(id).close();
});

ipcMain.on("tabManager-goBack", (event) => {
  if(tabManager.hasActiveTab()) {
    tabManager.getActiveTab().goBack();
  }
});

ipcMain.on("tabManager-goForward", (event) => {
  if(tabManager.hasActiveTab()) {
    tabManager.getActiveTab().goForward();
  }
});

ipcMain.on("tabManager-reload", (event) => {
  if(tabManager.hasActiveTab()) {
    tabManager.getActiveTab().reload();
  }
});

ipcMain.on("tabManager-stop", (event) => {
  if(tabManager.hasActiveTab()) {
    tabManager.getActiveTab().stop();
  }
});

ipcMain.on("tabManager-navigate", (event, url) => {
  if(tabManager.hasActiveTab()) {
    tabManager.getActiveTab().navigate(url);
  }
});

ipcMain.on("tabManager-showPreview", (event, id) => {
  tabManager.getTabById(id).showPreview();
});

ipcMain.on("tabManager-hidePreview", (event, id) => {
  tabManager.getTabById(id).hidePreview();
});

ipcMain.on("tabManager-showTabList", (event, arr) => {
  tabManager.showTabList(arr);
});

ipcMain.on("tabManager-showTabMenu", (event, id) => {
  tabManager.getTabById(id).showMenu();
});

ipcMain.on("tabManager-updateTabsPositions", (event, arr) => {
  tabManager.updateTabsPositions(arr);
});

ipcMain.on("tabManager-goHome", (event) => {
  if(tabManager.hasActiveTab()) {
    tabManager.getActiveTab().goHome();
  }
});

ipcMain.on("tabManager-setHomePage", (event, homePage) => {
  tabManager.setHomePage(homePage);
});

ipcMain.on("tabManager-setTabClosedAction", (event, tabClosed) => {
  tabManager.setTabClosedAction(tabClosed);
});

ipcMain.on("tabManager-zoomOut", (event) => {
  if(tabManager.hasActiveTab()) {
    tabManager.getActiveTab().zoomOut();
  }
});

ipcMain.on("tabManager-zoomIn", (event) => {
  if(tabManager.hasActiveTab()) {
    tabManager.getActiveTab().zoomIn();
  }
});

ipcMain.on("tabManager-zoomToActualSize", (event) => {
  if(tabManager.hasActiveTab()) {
    tabManager.getActiveTab().zoomToActualSize();
  }
});

/*
 ###### #    # #    #  ####               ####  #    # ###### #####  #        ##   #   #
 #      #    # ##   # #    #             #    # #    # #      #    # #       #  #   # #
 #####  #    # # #  # #         #####    #    # #    # #####  #    # #      #    #   #
 #      #    # #  # # #                  #    # #    # #      #####  #      ######   #
 #      #    # #   ## #    #             #    #  #  #  #      #   #  #      #    #   #
 #       ####  #    #  ####               ####    ##   ###### #    # ###### #    #   #
*/

function initOverlay() {
  overlay = new Overlay(mainWindow, app.getAppPath());

  overlay.on("show", () => {
    tabManager.unactivateAllTabs();
  });
}

/*
 ###### #    # #    #  ####              #####   ##   #####     #    #   ##   #    #   ##    ####  ###### #####
 #      #    # ##   # #    #               #    #  #  #    #    ##  ##  #  #  ##   #  #  #  #    # #      #    #
 #####  #    # # #  # #         #####      #   #    # #####     # ## # #    # # #  # #    # #      #####  #    #
 #      #    # #  # # #                    #   ###### #    #    #    # ###### #  # # ###### #  ### #      #####
 #      #    # #   ## #    #               #   #    # #    #    #    # #    # #   ## #    # #    # #      #   #
 #       ####  #    #  ####                #   #    # #####     #    # #    # #    # #    #  ####  ###### #    #
*/

function initTabManager() {
  tabManager = new TabManager(mainWindow, app.getAppPath());

  tabManager.on("active-tab-closed", (tabClosed, pos) => {
    if(tabClosed === "overlay") {
      overlay.show();
    } else if(tabClosed === "next-tab") {
      let nextTab = tabManager.getTabByPosition(pos + 1);
      if(nextTab != null) {
        nextTab.activate();
      } else {
        let prevTab = tabManager.getTabByPosition(pos - 1);
        if(prevTab != null) {
          prevTab.activate();
        }
      }
    } else if(tabClosed === "prev-tab") {
      let prevTab = tabManager.getTabByPosition(pos - 1);
      if(prevTab != null) {
        prevTab.activate();
      } else {
        let nextTab = tabManager.getTabByPosition(pos + 1);
        if(nextTab != null) {
          nextTab.activate();
        }
      }
    }
  });

  tabManager.on("tab-activated", () => {
    mainWindow.webContents.send("overlay-toggleButton", false);
  });

  tabManager.on("last-tab-closed", () => {
    loadLastTab().then((lastTab) => {
      if(lastTab == "new-tab") {
        tabManager.newTab();
      } else if(lastTab == "quit") {
        app.quit();
      } else if(lastTab == "overlay") {
        overlay.show();
      } else if(lastTab == "new-tab-overlay") {
        tabManager.newTab();
        overlay.show();
      }
    });
  });

  tabManager.on("add-status-notif", (text, type) => {
    mainWindow.webContents.send("action-add-status-notif", { text: text, type: type });
  });

  tabManager.on("refresh-zoom-notif", (zoomFactor) => {
    mainWindow.webContents.send("action-refresh-zoom-notif", zoomFactor);
  });

  tabManager.on("add-history-item", (url) => {
    overlay.addHistoryItem(url);
  });
}

/*
.########.##.....##.##....##..######..########.####..#######..##....##..######.
.##.......##.....##.###...##.##....##....##.....##..##.....##.###...##.##....##
.##.......##.....##.####..##.##..........##.....##..##.....##.####..##.##......
.######...##.....##.##.##.##.##..........##.....##..##.....##.##.##.##..######.
.##.......##.....##.##..####.##..........##.....##..##.....##.##..####.......##
.##.......##.....##.##...###.##....##....##.....##..##.....##.##...###.##....##
.##........#######..##....##..######.....##....####..#######..##....##..######.
*/

function saveBounds() {
  let Data = {
    x: mainWindow.getBounds().x,
    y: mainWindow.getBounds().y,
    width: mainWindow.getBounds().width,
    height: mainWindow.getBounds().height,
    maximize: mainWindow.isMaximized()
  }
  saveFileToJsonFolder(null, 'bounds', JSON.stringify(Data));
}

function showAboutWindow() {
  if(aboutWindow === null || aboutWindow.isDestroyed()) {
    loadTheme().then((theme) => {
      aboutWindow = new BrowserWindow({
        title: "About Ferny",
        modal: true,
        parent: mainWindow,
        width: 480, height: 350,
        resizable: false,
        show: false,
        frame: false,
        icon: app.getAppPath() + "/imgs/icon.ico",
        webPreferences: {
          nodeIntegration: true
        },
        backgroundColor: theme.colorBack
      });
  
      aboutWindow.loadFile(app.getAppPath() + "/html/about.html");

      aboutWindow.on("focus", () => {
        aboutWindow.webContents.send("window-focus");
      });
    
      aboutWindow.on("blur", () => {
        aboutWindow.webContents.send("window-blur");
      });

      aboutWindow.once("ready-to-show", () => {
        aboutWindow.show();
      });
    });
  }
}

function showSettingsWindow() {
  if(settingsWindow === null || settingsWindow.isDestroyed()) {
    loadTheme().then((theme) => {
      settingsWindow = new BrowserWindow({
        title: "Settings",
        modal: true,
        frame: false,
        parent: mainWindow,
        width: 640, height: 480,
        resizable: false,
        show: false,
        icon: app.getAppPath() + "/imgs/icon.ico",
        webPreferences: {
          nodeIntegration: true
        },
        backgroundColor: theme.colorBack
      });
  
      settingsWindow.loadFile(app.getAppPath() + "/html/settings.html");

      settingsWindow.on("focus", () => {
        settingsWindow.webContents.send("window-focus");
      });
    
      settingsWindow.on("blur", () => {
        settingsWindow.webContents.send("window-blur");
      });

      settingsWindow.once("ready-to-show", () => {
        settingsWindow.show();
        // settingsWindow.webContents.openDevTools();
      });
    });
  }
}

function showMainWindow() {
  loadBounds().then((Data) => {
    if(Data.maximize) {
      Data.x = null;
      Data.y = null;
      Data.width = 1000;
      Data.height = 600;
    }
  
    loadTheme().then(function(theme) {
      mainWindow = new BrowserWindow({
        x: Data.x, y: Data.y,
        width: Data.width, height: Data.height,
        minWidth: 520, minHeight: 300,
        frame: false,
        show: false,
        icon: app.getAppPath() + "/imgs/icon.ico",
        webPreferences: {
          nodeIntegration: true
        },
        backgroundColor: theme.colorBack
      });
    
      mainWindow.loadFile(app.getAppPath() + "/html/browser.html");
    
      mainWindow.webContents.on("context-menu", (event, params) => {
        if(params.isEditable) {
          let searchMenu = Menu.buildFromTemplate([
            { label: "Cut", icon: app.getAppPath() + "/imgs/icons16/cut.png", accelerator: "CmdOrCtrl+X", enabled: params.editFlags.canCut, click: () => { 
              mainWindow.webContents.cut(); } },
            { label: "Copy", icon: app.getAppPath() + "/imgs/icons16/copy.png", accelerator: "CmdOrCtrl+C", enabled: params.editFlags.canCopy, click: () => { 
              mainWindow.webContents.copy(); } },
            { label: "Paste", icon: app.getAppPath() + "/imgs/icons16/paste.png", accelerator: "CmdOrCtrl+V", enabled: params.editFlags.canPaste, click: () => { 
              mainWindow.webContents.paste(); } },
            { type: "separator" },
            { label: "Paste and search", icon: app.getAppPath() + "/imgs/icons16/zoom.png", enabled: params.editFlags.canPaste, click: () => { 
              overlay.performSearch(clipboard.readText()); } },
            { type: "separator" },
            { label: "Undo", icon: app.getAppPath() + "/imgs/icons16/undo.png", accelerator: "CmdOrCtrl+Z", enabled: params.editFlags.canUndo, click: () => { 
              mainWindow.webContents.undo(); } },
            { label: "Redo", icon: app.getAppPath() + "/imgs/icons16/redo.png", accelerator: "CmdOrCtrl+Shift+Z", enabled: params.editFlags.canRedo, click: () => {
              mainWindow.webContents.redo(); } },
            { type: "separator" },
            { label: "Select all", icon: app.getAppPath() + "/imgs/icons16/select-all.png", accelerator: "CmdOrCtrl+A", enabled: params.editFlags.canSelectAll, click: () => { 
              mainWindow.webContents.selectAll(); } },
            { type: "separator" },
            { label: "Delete", icon: app.getAppPath() + "/imgs/icons16/delete.png", accelerator: "Backspace", enabled: params.editFlags.canDelete, click: () => { 
              mainWindow.webContents.delete(); } }
          ]);
          searchMenu.popup(mainWindow);
        }
      });
    
      mainWindow.on("focus", () => {
        mainWindow.webContents.send("window-focus");
      });
    
      mainWindow.on("blur", () => {
        mainWindow.webContents.send("window-blur");
      });

      mainWindow.on("resize", () => {
        setTimeout(() => {
          overlay.refreshBounds();
        }, 150);
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().activate();
        }
      });
    
      mainWindow.on("maximize", () => {
        mainWindow.webContents.send("window-maximize");
        // if(tabManager.hasActiveTab()) {
        //   tabManager.getActiveTab().activate();
        // }
        // setTimeout(() => {
        //   overlay.refreshBounds();
        // }, 150);
        // overlay.refreshBounds();
      });
    
      mainWindow.on("unmaximize", () => {
        mainWindow.webContents.send("window-unmaximize");
        // if(tabManager.hasActiveTab()) {
        //   tabManager.getActiveTab().activate();
        // }
        // overlay.refreshBounds();
      });
    
      mainWindow.once("ready-to-show", () => {
        initOverlay();
        initTabManager();
        initMenu();
  
        loadHomePage().then((homePage) => {
          tabManager.setHomePage(homePage);
        });
  
        mainWindow.show();
        if(Data.maximize) {
          mainWindow.maximize();
        }

        if(process.argv.length >= 2 && process.argv[1] !== ".") {
          let openFilePath = process.argv[1];
          tabManager.addTab("file://" + openFilePath, true);
        } else {
          loadStartup().then((startup) => {
            if(startup == "overlay") {
              overlay.show();
            } else if(startup == "new-tab") {
              tabManager.newTab();
            }
          });
        }
      });
    
      mainWindow.on("maximize", () => {
        mainWindow.webContents.send("action-maximize-window");
      });
    
      mainWindow.on("unmaximize", () => {
        mainWindow.webContents.send("action-unmaximize-window");
      });
  
      mainWindow.on("app-command", (event, command) => {
        if(command == "browser-backward") {
          if(tabManager.hasActiveTab()) {
            tabManager.getActiveTab().goBack();
          }
        } else if(command == "browser-forward") {
          if(tabManager.hasActiveTab()) {
            tabManager.getActiveTab().goForward();
          }
        } else if(command == "browser-favorites") {
          overlay.openBookmarks();
        } else if(command == "browser-home") {
          if(tabManager.hasActiveTab()) {
            tabManager.getActiveTab().goHome();
          }
        } else if(command == "browser-refresh") {
          if(tabManager.hasActiveTab()) {
            tabManager.getActiveTab().reload();
          }
        } else if(command == "browser-stop") {
          if(tabManager.hasActiveTab()) {
            tabManager.getActiveTab().stop();
          }
        } else if(command == "browser-search") {
          overlay.show();
        } 
      });
    
      mainWindow.on("close", function(event) {
        event.preventDefault();
    
        let download = false;
    
        for (let i = 0; i < downloads.length; i++) {
          try {
            if(downloads[i].item.getState() == "progressing") {
              download = true;
              break;
            }
          } catch (e) {
    
          }
        }
    
        let update = false;
        
        if(updateCancellationToken != null) {
          update = true;
        }
    
        if(update) {
          mainWindow.webContents.send('action-add-quest-notif', { text: "App update is in progress! Exit anyway?", ops: [{ text:'Exit', icon:'exit-16', click:'exitAppAnyway()' }] });
        } else {
          if(download) {
            mainWindow.webContents.send('action-add-quest-notif', { text: "Download is in progress! Exit anyway?", ops: [{ text:'Exit', icon:'exit-16', click:'exitAppAnyway()' }] });
          } else {
            saveBounds();
            app.exit();
          }
        }
      });
    });
  });
}

function initMenu() {
  sideMenu = Menu.buildFromTemplate([{ 
    label: "New tab", icon: app.getAppPath() + "/imgs/icons16/create.png", accelerator: "CmdOrCtrl+T", click: () => { 
      tabManager.newTab(); 
    } }, { 
    label: "Active tab", icon: app.getAppPath() + "/imgs/icons16/tab.png", submenu: [{ 
      label: "Back", accelerator: "Alt+Left", icon: app.getAppPath() + "/imgs/icons16/back.png", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().goBack(); 
        } 
      } }, { 
      label: "Forward", accelerator: "Alt+Right", icon: app.getAppPath() + "/imgs/icons16/forward.png", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().goForward(); 
        } 
      } }, { 
      label: "Reload", icon: app.getAppPath() + "/imgs/icons16/reload.png", accelerator: "F5", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().reload(); 
        } 
      } }, { type: "separator" }, { 
      label: "Duplicate", icon: app.getAppPath() + "/imgs/icons16/copy.png", accelerator: "CmdOrCtrl+Shift+D", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().duplicate(); 
        } 
      } }, { 
      label: "Copy URL", icon: app.getAppPath() + "/imgs/icons16/copy-link.png", accelerator: "CmdOrCtrl+Shift+C", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().copyURL(); 
        }
      } }, { 
      label: "Go home", icon: app.getAppPath() + "/imgs/icons16/home.png", accelerator: "CmdOrCtrl+Shift+H", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().goHome(); 
        }
      } }, { type: "separator" }, { 
      label: "Reload ignoring cache", accelerator: "CmdOrCtrl+F5", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().reloadIgnoringCache();
        }
      } }, { type: "separator" }, { 
      label: "Close to the right", icon: app.getAppPath() + "/imgs/icons16/swipe-right.png", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().closeToTheRight(); 
        }
      } }, { 
      label: "Close others", accelerator: "CmdOrCtrl+Shift+W", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().closeOthers(); 
        }
      } }, { 
      label: "Close tab", icon: app.getAppPath() + "/imgs/icons16/close.png", accelerator: "CmdOrCtrl+W", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().close(); 
        }
      } }
    ] }, { type: "separator" }, { 
    label: "Bookmarks", icon: app.getAppPath() + "/imgs/icons16/bookmarks.png", submenu: [{ 
      label: "Bookmark manager", icon: app.getAppPath() + "/imgs/icons16/bookmarks.png", accelerator: "CmdOrCtrl+B", click: () => { 
        overlay.scrollToId("bookmarks-title"); 
      } }, { type: "separator" }, { 
      label: "Bookmark this page", icon: app.getAppPath() + "/imgs/icons16/star.png", accelerator: "CmdOrCtrl+Shift+B", click: () => { 
        if(tabManager.hasActiveTab()) {
          let at = tabManager.getActiveTab();
          overlay.addBookmark(at.getTitle(), at.getURL());
          overlay.scrollToId("bookmarks-title"); 
        }
      } }, { 
      enabled: false, label: "Bookmark all tabs", click: () => { 
        // mainWindow.webContents.send('action-add-quest-notif', { 
        //   text: "Are you sure to bookmark all tabs?", 
        //   ops: [{ text:'Bookmark', icon:'add-bookmark-16', click:'bookmarkAllTabs()' }] 
        // }); 
      } }
    ] }, { 
    label: "History", accelerator: "CmdOrCtrl+H", icon: app.getAppPath() + "/imgs/icons16/history.png", click: () => { 
      overlay.scrollToId("history-title");
    } }, { 
    label: "Downloads", accelerator: "CmdOrCtrl+D", icon: app.getAppPath() + "/imgs/icons16/download.png", click: () => { 
      overlay.scrollToId("downloads-title"); 
    } }, { type: "separator" }, { 
    label: "Zoom", icon: app.getAppPath() + "/imgs/icons16/zoom.png", submenu: [{ 
      label: "Zoom in", icon: app.getAppPath() + "/imgs/icons16/zoom-in.png", accelerator: "CmdOrCtrl+=", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().zoomIn(); 
        }
      } }, { 
      label: "Zoom out", icon: app.getAppPath() + "/imgs/icons16/zoom-out.png", accelerator: "CmdOrCtrl+-", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().zoomOut(); 
        }
      } }, { type: "separator" }, {
      label: "Actual size", icon: app.getAppPath() + "/imgs/icons16/actual-size.png", accelerator: "CmdOrCtrl+0", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().zoomToActualSize(); 
        }
      } }, { type: "separator" }, { 
      label: "Fullscreen", icon: app.getAppPath() + "/imgs/icons16/fullscreen.png", accelerator: "F11", click: () => { 
        toggleFullscreen(); 
      } },
    ] }, { 
    label: "Edit", icon: app.getAppPath() + "/imgs/icons16/edit.png", submenu: [{ 
      label: "Cut", icon: app.getAppPath() + "/imgs/icons16/cut.png", accelerator: "CmdOrCtrl+X", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().cut(); 
        }
      } }, { 
      label: "Copy", icon: app.getAppPath() + "/imgs/icons16/copy.png", accelerator: "CmdOrCtrl+C", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().copy(); 
        }
      } }, { 
      label: "Paste", icon: app.getAppPath() + "/imgs/icons16/paste.png", accelerator: "CmdOrCtrl+V", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().paste(); 
        }
      } }, { type: "separator" }, { 
      label: "Paste and match style", icon: app.getAppPath() + "/imgs/icons16/paste-special.png", accelerator: "CmdOrCtrl+Shift+V", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().pasteAndMatchStyle(); 
        }
      } }, { type: "separator" }, { 
      label: "Undo", icon: app.getAppPath() + "/imgs/icons16/undo.png", accelerator: "CmdOrCtrl+Z", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().undo();
        } 
      } }, { 
      label: "Redo", icon: app.getAppPath() + "/imgs/icons16/redo.png", accelerator: "CmdOrCtrl+Shift+Z", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().redo(); 
        }
      } }, { type: "separator" }, { 
      label: "Select all", icon: app.getAppPath() + "/imgs/icons16/select-all.png", accelerator: "CmdOrCtrl+A", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().selectAll();
        } 
      } }, { type: "separator" }, { 
      label: "Delete", icon: app.getAppPath() + "/imgs/icons16/delete.png", accelerator: "Backspace", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().delete();
        } 
      } },
    ] },
    { label: "Page", icon: app.getAppPath() + "/imgs/icons16/page.png", submenu: [{ 
      enabled: false, label: "Find in page", icon: app.getAppPath() + "/imgs/icons16/find-in-page.png", accelerator: "CmdOrCtrl+F", click: () => { 
        // mainWindow.webContents.send('action-page-findinpage'); 
      } }, { type: "separator" }, { 
      enabled: false, label: "Certificate info", icon: app.getAppPath() + "/imgs/icons16/certificate.png", accelerator: "CmdOrCtrl+I", click: () => { 
        // mainWindow.webContents.send('action-page-certificate'); 
      } }, { type: "separator" }, { 
      label: "Open file", icon: app.getAppPath() + "/imgs/icons16/open.png", accelerator: "CmdOrCtrl+O", click: () => { 
        openFileDialog(); 
      } }, { type: "separator" }, { 
      label: "View page source", icon: app.getAppPath() + "/imgs/icons16/code.png", accelerator: "CmdOrCtrl+U", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().viewPageSource();
        }
      } }, { 
      label: "Developer tools", icon: app.getAppPath() + "/imgs/icons16/tools.png", accelerator: "F12", click: () => { 
        if(tabManager.hasActiveTab()) {
          tabManager.getActiveTab().openDevTools();
        }
      } }
    ] }, { type: "separator" }, { 
    label: "Settings", icon: app.getAppPath() + "/imgs/icons16/settings.png", accelerator: "CmdOrCtrl+,", click: () => { 
      showSettingsWindow();
    } }, { 
    label: "Help", icon: app.getAppPath() + "/imgs/icons16/help.png", submenu: [{ 
      label: "Check for updates", icon: app.getAppPath() + "/imgs/icons16/reload.png", accelerator: "CmdOrCtrl+Shift+U", click: () => { 
        checkForUpdates(); 
      } }, { type: "separator" }, { 
      label: "About", icon: app.getAppPath() + "/imgs/icons16/about.png", accelerator: "F2", click: () => { 
        showAboutWindow();
      } }, { 
      enabled: false, label: "Welcome", icon: app.getAppPath() + "/imgs/icons16/startup.png", accelerator: "F7", click: () => { 
        // showWelcomeWindow(); 
      } }, { type: "separator" }, { 
      label: "Report an issue", icon: app.getAppPath() + "/imgs/icons16/bug.png", accelerator: "CmdOrCtrl+Shift+I", click: () => { 
        tabManager.addTab("https://github.com/ModuleArt/ferny/issues", true);
      } }
    ] }, { 
    label: "More", icon: app.getAppPath() + "/imgs/icons16/more.png", submenu: [{ 
      enabled: false, label: "Clear browsing data", icon: app.getAppPath() + "/imgs/icons16/broom.png", accelerator: "CmdOrCtrl+Shift+Delete", click: () => { 
        // overlay.openSettings('clear-browsing-data'); 
      } }, { type: "separator" }, { 
      label: "Show overlay", icon: app.getAppPath() + "/imgs/icons16/details.png", accelerator: "F3", click: () => { 
        overlay.show(); 
      } }, { 
      label: "Open search", icon: app.getAppPath() + "/imgs/icons16/zoom.png", accelerator: "F6", click: () => { 
        if(tabManager.hasActiveTab()) {
          overlay.goToSearch(tabManager.getActiveTab().getURL());
        } else {
          overlay.goToSearch();
        }
      } }, { 
      label: "Switch tab", icon: app.getAppPath() + "/imgs/icons16/numerical.png", submenu: [{ 
        label: "Next tab", icon: app.getAppPath() + "/imgs/icons16/next.png", accelerator: "CmdOrCtrl+Tab", click: () => { 
          if(tabManager.hasActiveTab()) {
            tabManager.getActiveTab().nextTab(); 
          }
        } }, { 
        label: "Previous tab", icon: app.getAppPath() + "/imgs/icons16/prev.png", accelerator: "CmdOrCtrl+Shift+Tab", click: () => { 
          if(tabManager.hasActiveTab()) {
            tabManager.getActiveTab().prevTab(); 
          }
        } }, { type: "separator" }, { 
        label: "Tab 1", accelerator: "CmdOrCtrl+1", click: () => { 
          tabManager.switchTab(1); 
        } }, { 
        label: "Tab 2", accelerator: "CmdOrCtrl+2", click: () => { 
          tabManager.switchTab(2); 
        } }, { 
        label: "Tab 3", accelerator: "CmdOrCtrl+3", click: () => { 
          tabManager.switchTab(3); 
        } }, { 
        label: "Tab 4", accelerator: "CmdOrCtrl+4", click: () => { 
          tabManager.switchTab(4); 
        } }, { 
        label: "Tab 5", accelerator: "CmdOrCtrl+5", click: () => { 
          tabManager.switchTab(5); 
        } }, { 
        label: "Tab 6", accelerator: "CmdOrCtrl+6", click: () => { 
          tabManager.switchTab(6); 
        } }, { 
        label: "Tab 7", accelerator: "CmdOrCtrl+7", click: () => { 
          tabManager.switchTab(7); 
        } }, { 
        label: "Tab 8", accelerator: "CmdOrCtrl+8", click: () => { 
          tabManager.switchTab(8); 
        } }, { 
        label: "Tab 9", accelerator: "CmdOrCtrl+9", click: () => { 
          tabManager.switchTab(9); 
        } }
      ] }, { type: "separator" }, { 
      label: "Developer [Danger]", icon: app.getAppPath() + "/imgs/icons16/developer.png", submenu: [{ 
        label: "Developer mode (Main window)", icon: app.getAppPath() + "/imgs/icons16/web.png", accelerator: "CmdOrCtrl+Shift+F12", click: () => { 
          mainWindow.webContents.openDevTools(); 
        } }, { 
        label: "Developer mode (Overlay)", icon: app.getAppPath() + "/imgs/icons16/details.png", accelerator: "CmdOrCtrl+Shift+F11", click: () => { 
          overlay.openDevTools(); 
        } }
      ] }
    ] }, { type: "separator" }, { 
    label: "Quit Ferny", icon: app.getAppPath() + "/imgs/icons16/exit.png", accelerator: "CmdOrCtrl+Shift+Q", click: () => { 
      app.quit(); 
    } }
  ]);

  Menu.setApplicationMenu(null);
  mainWindow.setMenu(sideMenu);
}

function toggleFullscreen() {
  if(mainWindow.isFullScreen()) {
    mainWindow.setFullScreen(false);
  } else {
    mainWindow.setFullScreen(true);
  }
  tabManager.setFullscreen(mainWindow.isFullScreen());
}

function checkForUpdates() {
  autoUpdater.checkForUpdates().then((downloadPromise) => {
    updateCancellationToken = downloadPromise.cancellationToken;
  });
}

function cancelUpdate() {
  updateCancellationToken.cancel();
}

function showWelcomeWindow() {
  mainWindow.webContents.send('action-esc');
  
  loadTheme().then(function(theme) {
    welcomeWindow = new BrowserWindow({
      width: 480, height: 350,
      frame: false,
      show: false,
      modal: true,
      parent: mainWindow,
      icon: app.getAppPath() + '/imgs/icon.ico',
      minimizable: false,
      maximizable: false,
      resizable: false,
      webPreferences: {
        nodeIntegration: true
      },
      backgroundColor: theme.colorBack
    }); 
  
    welcomeWindow.setMenu(null);
  
    welcomeWindow.on('focus', () => {
      welcomeWindow.webContents.send('action-focus-window');
    });
  
    welcomeWindow.on('blur', () => {
      welcomeWindow.webContents.send('action-blur-window');
    });
  
    welcomeWindow.loadFile(app.getAppPath() + '/html/welcome.html');
  
    welcomeWindow.once('ready-to-show', () => {
      // welcomeWindow.webContents.openDevTools();
      welcomeWindow.show();
    });
  });
}

function openFileDialog() {
  dialog.showOpenDialog(mainWindow, { 
    properties: [ 'multiSelections' ]
  }).then(({ canceled, filePaths, bookmarks }) => {
    filePaths.forEach((item, index) => {
      tabManager.addTab("file://" + item, true);
    });
  });
}

/*
.########.....###....########....###.......##........#######.....###....########.
.##.....##...##.##......##......##.##......##.......##.....##...##.##...##.....##
.##.....##..##...##.....##.....##...##.....##.......##.....##..##...##..##.....##
.##.....##.##.....##....##....##.....##....##.......##.....##.##.....##.##.....##
.##.....##.#########....##....#########....##.......##.....##.#########.##.....##
.##.....##.##.....##....##....##.....##....##.......##.....##.##.....##.##.....##
.########..##.....##....##....##.....##....########..#######..##.....##.########.
*/

function loadWelcome() {
  try {
    var welcomeOn = fs.readFileSync(ppath + "/json/welcome.json");
    if(welcomeOn == 1) {
      showWelcomeWindow();
    }
  } catch (e) {
    saveFileToJsonFolder(null, 'welcome', 1);
    showWelcomeWindow();
  }
}

/*
.########.##.....##.########....########.##....##.########.
....##....##.....##.##..........##.......###...##.##.....##
....##....##.....##.##..........##.......####..##.##.....##
....##....#########.######......######...##.##.##.##.....##
....##....##.....##.##..........##.......##..####.##.....##
....##....##.....##.##..........##.......##...###.##.....##
....##....##.....##.########....########.##....##.########.
*/
