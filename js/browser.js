/*
.##.....##....###....####.##....##
.###...###...##.##....##..###...##
.####.####..##...##...##..####..##
.##.###.##.##.....##..##..##.##.##
.##.....##.#########..##..##..####
.##.....##.##.....##..##..##...###
.##.....##.##.....##.####.##....##
*/

const { ipcRenderer, BrowserView } = require('electron');
const dragula = require("dragula");
// const autoSuggest = require('google-autocomplete');
const autoSuggest = require('suggestion');
const isUrl = require('validate.io-uri');
const getAvColor = require('color.js');
const fs = require("fs");
const ppath = require('persist-path')('Ferny');
// const checkFile = require('check-file');
const fileExtension = require('file-extension');
const parsePath = require("parse-path");

/*
.##.....##..#######..########..##.....##.##.......########..######.
.###...###.##.....##.##.....##.##.....##.##.......##.......##....##
.####.####.##.....##.##.....##.##.....##.##.......##.......##......
.##.###.##.##.....##.##.....##.##.....##.##.......######....######.
.##.....##.##.....##.##.....##.##.....##.##.......##.............##
.##.....##.##.....##.##.....##.##.....##.##.......##.......##....##
.##.....##..#######..########...#######..########.########..######.
*/

const applyTheme = require("../modules/applyTheme.js");
const loadTheme = require("../modules/loadTheme.js");
const applyWinControls = require("../modules/applyWinControls.js");
const loadWinControls = require("../modules/loadWinControls.js");

const NotificationManager = require("../modules/NotificationManager/NotificationManager.js");
const TabRenderer = require("../modules/TabManager/TabRenderer.js");

/*
 #    #  ####  ##### # ###### #  ####    ##   ##### #  ####  #    #  ####
 ##   # #    #   #   # #      # #    #  #  #    #   # #    # ##   # #
 # #  # #    #   #   # #####  # #      #    #   #   # #    # # #  #  ####
 #  # # #    #   #   # #      # #      ######   #   # #    # #  # #      #
 #   ## #    #   #   # #      # #    # #    #   #   # #    # #   ## #    #
 #    #  ####    #   # #      #  ####  #    #   #   #  ####  #    #  ####
*/

let notificationManager = new NotificationManager(document.getElementById('notif-panel'));

notificationManager.on("notif-added", (notif) => {
  updateTheme();
});

/*
.########....###....########...######.
....##......##.##...##.....##.##....##
....##.....##...##..##.....##.##......
....##....##.....##.########...######.
....##....#########.##.....##.......##
....##....##.....##.##.....##.##....##
....##....##.....##.########...######.
*/

let tabRenderer = new TabRenderer();

let tabDrag = dragula([tabRenderer.getTabContainer()], {
  direction: "horizontal"
});

tabDrag.on('drag', function(el, source) {
  let div = el.getElementsByClassName('tabman-tab-preview')[0];
  if(div != null) {
    div.parentNode.removeChild(div);
  }
});

tabDrag.on('drop', function(el, target, source, sibling) {
  tabRenderer.updateTabsPositions();
});

/*
.########.##.....##.##....##..######..########.####..#######..##....##..######.
.##.......##.....##.###...##.##....##....##.....##..##.....##.###...##.##....##
.##.......##.....##.####..##.##..........##.....##..##.....##.####..##.##......
.######...##.....##.##.##.##.##..........##.....##..##.....##.##.##.##..######.
.##.......##.....##.##..####.##..........##.....##..##.....##.##..####.......##
.##.......##.....##.##...###.##....##....##.....##..##.....##.##...###.##....##
.##........#######..##....##..######.....##....####..#######..##....##..######.
*/

function updateTheme() {
  loadTheme().then(function(theme) {
    applyTheme(theme);
  });
}

function prevDef(event) {
  event.preventDefault();
}

function popupInfoContextMenu() {
  ipcRenderer.send('request-info-contextmenu');
}

function popupHomeButtonContextMenu() {
  ipcRenderer.send('request-home-button-contextmenu');
}

function requestSideMenu() {
  ipcRenderer.send('request-side-menu');
}

function installUpdate() {
  ipcRenderer.send('request-install-update');
}

function clearDownloads() {
  ipcRenderer.send('action-clear-downloads');
  document.getElementById('sidebar-webview').send('action-clear-downloads');
}

function clearHistory() {
  document.getElementById('sidebar-webview').send('action-clear-history');
}

function cancelUpdate() {
  ipcRenderer.send('request-cancel-update');
  notificationManager.addStatusNotif('Update cancelled', 'error');
}

function checkForUpdates() {
  ipcRenderer.send('request-check-for-updates');
}

function exitAppAnyway() {
  ipcRenderer.send('request-exit-app-anyway');
}

function maximizeWindow() {
  ipcRenderer.send('request-maximize-window');
}

function minimizeWindow() {
  ipcRenderer.send('request-minimize-window');
}

function restoreWindow() {
  ipcRenderer.send('request-unmaximize-window');
}

function closeWindow() {
  ipcRenderer.send('request-quit-app');
}

function zoomIn() {
  // var zoomFactor = tabGroup.getActiveTab().webview.getZoomFactor();
  // if (zoomFactor < 2.5) {
  //   tabGroup.getActiveTab().webview.setZoomFactor(zoomFactor + 0.1);
  //   notificationManager.refreshZoomNotif(Math.round((zoomFactor + 0.1) * 100));
  //   tabGroup.getActiveTab().webview.focus();
  // }
}

function zoomOut() {
  // var zoomFactor = tabGroup.getActiveTab().webview.getZoomFactor();
  // if (zoomFactor > 0.3) {
  //   tabGroup.getActiveTab().webview.setZoomFactor(zoomFactor - 0.1);
  //   notificationManager.refreshZoomNotif(Math.round((zoomFactor - 0.1) * 100));
  //   tabGroup.getActiveTab().webview.focus();
  // }
}

function focusSearch() {
  let s = document.getElementById('search-input');
  s.focus();
  s.select();
}

function bookmarkAllTabs() {
  // tabGroup.eachTab((currentTab, index, tabs) => {
  //   createBookmark(currentTab.webview.getURL(), currentTab.getTitle(), null);
  // });
}

function checkOpenWith() {
  ipcRenderer.send('request-check-open-with');
}

/*
 ###### #    # #    #  ####               ####  #    # ###### #####  #        ##   #   #
 #      #    # ##   # #    #             #    # #    # #      #    # #       #  #   # #
 #####  #    # # #  # #         #####    #    # #    # #####  #    # #      #    #   #
 #      #    # #  # # #                  #    # #    # #      #####  #      ######   #
 #      #    # #   ## #    #             #    #  #  #  #      #   #  #      #    #   #
 #       ####  #    #  ####               ####    ##   ###### #    # ###### #    #   #
*/

function showOverlay() {
  ipcRenderer.send('overlay-show');
}

function showOverlayButtonMenu() {
  ipcRenderer.send('overlay-showButtonMenu');
}

function goToSearch(text) {
  ipcRenderer.send('overlay-goToSearch', text);
}

/*
 ###### #    # #    #  ####              #####   ##   #####     #    #   ##   #    #   ##    ####  ###### #####
 #      #    # ##   # #    #               #    #  #  #    #    ##  ##  #  #  ##   #  #  #  #    # #      #    #
 #####  #    # # #  # #         #####      #   #    # #####     # ## # #    # # #  # #    # #      #####  #    #
 #      #    # #  # # #                    #   ###### #    #    #    # ###### #  # # ###### #  ### #      #####
 #      #    # #   ## #    #               #   #    # #    #    #    # #    # #   ## #    # #    # #      #   #
 #       ####  #    #  ####                #   #    # #####     #    # #    # #    # #    #  ####  ###### #    #
*/

function newTab() {
  ipcRenderer.send('tabManager-newTab');
}

function showTabList() {
  tabRenderer.showTabList();
}

function goBack() {
  ipcRenderer.send('tabManager-goBack');
}

function goForward() {
  ipcRenderer.send('tabManager-goForward');
}

function reload() {
  ipcRenderer.send('tabManager-reload');
}

function stop() {
  ipcRenderer.send('tabManager-stop');
}

function newTabDrop(event) {
  event.preventDefault();
  let textData = event.dataTransfer.getData("Text");
  if (textData) {
    ipcRenderer.send('tabManager-addTab', textData, false);
  } else if(event.dataTransfer.files.length > 0) {
    for(let i = 0; i < event.dataTransfer.files.length; i++) {
      ipcRenderer.send('tabManager-addTab', event.dataTransfer.files[i].path, false);
    }
  }
}

function tabsWheel(event) {
  if (event.deltaY < 0) {
    tabRenderer.scrollLeft();
  }
  if (event.deltaY > 0) {
    tabRenderer.scrollRight();
  }
}

function goHome() {
  ipcRenderer.send("tabManager-goHome");
}

/*
.####.########...######.....########..########.##....##.########..########.########..########.########.
..##..##.....##.##....##....##.....##.##.......###...##.##.....##.##.......##.....##.##.......##.....##
..##..##.....##.##..........##.....##.##.......####..##.##.....##.##.......##.....##.##.......##.....##
..##..########..##..........########..######...##.##.##.##.....##.######...########..######...########.
..##..##........##..........##...##...##.......##..####.##.....##.##.......##...##...##.......##...##..
..##..##........##....##....##....##..##.......##...###.##.....##.##.......##....##..##.......##....##.
.####.##.........######.....##.....##.########.##....##.########..########.##.....##.########.##.....##
*/

ipcRenderer.on('action-set-color-tabs', (event, arg) => {
  // if(arg) {
  //   document.body.classList.add('color-tabs');
  //   tabGroup.eachTab((currentTab, index, tabs) => {
  //     var img = currentTab.tab.getElementsByTagName('img')[0];
  //     var color = new getAvColor(img);
  //     color.mostUsed(result => {
  //       if(document.body.classList.contains('color-tabs')) {
  //         currentTab.tab.style.backgroundColor = rgbToRgbaString(result[0]);
  //       }
  //     });
  //   });
  // } else {
  //   document.body.classList.remove('color-tabs');
  //   tabGroup.eachTab((currentTab, index, tabs) => {
  //     currentTab.tab.style.backgroundColor = "";
  //   });
  // }
});

ipcRenderer.on('action-page-focussearch', (event, arg) => {
  focusSearch();
});

ipcRenderer.on('action-add-status-notif', (event, arg) => {
  notificationManager.addStatusNotif(arg.text, arg.type);
});

ipcRenderer.on('action-add-quest-notif', (event, arg) => {
  notificationManager.addQuestNotif(arg.text, arg.ops);
});

ipcRenderer.on('action-add-update-notif', (event, arg) => {
  notificationManager.addUpdateNotif(arg);
});

ipcRenderer.on('action-refresh-update-notif', (event, arg) => {
  notificationManager.refreshUpdateNotif(arg.percent, arg.transferred, arg.total, arg.speed);
});

ipcRenderer.on('action-change-theme', (event, arg) => {
  applyTheme(arg);
});

ipcRenderer.on('action-create-download', (event, arg) => {
  document.getElementById('sidebar-webview').send('action-create-download', arg);
  notificationManager.addStatusNotif('Download started: ' + arg.name, 'info');
  notificationManager.addDownloadNotif(arg.name, arg.index);
});

ipcRenderer.on('action-create-stopped-download', (event, arg) => {
  document.getElementById('sidebar-webview').send('action-create-stopped-download', arg);
});

ipcRenderer.on('action-set-download-status-pause', (event, arg) => {
  document.getElementById('sidebar-webview').send('action-set-download-status-pause', arg);
});

ipcRenderer.on('action-set-download-status-done', (event, arg) => {
  document.getElementById('sidebar-webview').send('action-set-download-status-done', arg);
  notificationManager.addStatusNotif('Download complete: ' + arg.name, 'success');
  notificationManager.closeDownloadNotif(arg.index);
});

ipcRenderer.on('action-set-download-status-failed', (event, arg) => {
  document.getElementById('sidebar-webview').send('action-set-download-status-failed', arg);
  notificationManager.addStatusNotif('Download ' + arg.state + ": " + arg.name, 'error');
  notificationManager.closeDownloadNotif(arg.index);
});

ipcRenderer.on('action-set-download-status-interrupted', (event, arg) => {
  document.getElementById('sidebar-webview').send('action-set-download-status-interrupted', arg);
  notificationManager.addStatusNotif('Download interrupted: ' + arg.name, 'warning');
  notificationManager.closeDownloadNotif(arg.index);
});

ipcRenderer.on('action-set-download-process', (event, arg) => {
  document.getElementById('sidebar-webview').send('action-set-download-process', arg);
  notificationManager.refreshDownloadNotif(Math.round(arg.bytes / arg.total * 100), arg.bytes, arg.total, arg.index);
});

/*
 # #####   ####              #    # # #    # #####   ####  #    #
 # #    # #    #             #    # # ##   # #    # #    # #    #
 # #    # #         #####    #    # # # #  # #    # #    # #    #
 # #####  #                  # ## # # #  # # #    # #    # # ## #
 # #      #    #             ##  ## # #   ## #    # #    # ##  ##
 # #       ####              #    # # #    # #####   ####  #    #
*/

ipcRenderer.on('window-blur', (event) => {
  document.getElementById('tabman').classList.add('blur');
});

ipcRenderer.on('window-focus', (event) => {
  document.getElementById('tabman').classList.remove('blur');
});

ipcRenderer.on('window-maximize', (event) => {
  document.getElementById('drag-zone').classList.add('maximize');
  document.getElementById('max-btn').style.display = "none";
  document.getElementById('restore-btn').style.display = "";
});

ipcRenderer.on('window-unmaximize', (event) => {
  document.getElementById('drag-zone').classList.remove('maximize');
  document.getElementById('max-btn').style.display = "";
  document.getElementById('restore-btn').style.display = "none";
});

/*
 # #####   ####               ####  #    # ###### #####  #        ##   #   #
 # #    # #    #             #    # #    # #      #    # #       #  #   # #
 # #    # #         #####    #    # #    # #####  #    # #      #    #   #
 # #####  #                  #    # #    # #      #####  #      ######   #
 # #      #    #             #    #  #  #  #      #   #  #      #    #   #
 # #       ####               ####    ##   ###### #    # ###### #    #   #
*/

ipcRenderer.on('overlay-toggleButton', (event, bool) => {
  if(bool) {
    document.getElementById('overlay-btn').classList.add('active');
  } else {
    document.getElementById('overlay-btn').classList.remove('active');
  }
});

/*
 # #####   ####              #####   ##   #####     #####  ###### #    # #####  ###### #####  ###### #####
 # #    # #    #               #    #  #  #    #    #    # #      ##   # #    # #      #    # #      #    #
 # #    # #         #####      #   #    # #####     #    # #####  # #  # #    # #####  #    # #####  #    #
 # #####  #                    #   ###### #    #    #####  #      #  # # #    # #      #####  #      #####
 # #      #    #               #   #    # #    #    #   #  #      #   ## #    # #      #   #  #      #   #
 # #       ####                #   #    # #####     #    # ###### #    # #####  ###### #    # ###### #    #
*/

ipcRenderer.on('tabRenderer-addTab', (event, arg) => {
  tabRenderer.addTab(arg.id, arg.url, arg.active)
});

ipcRenderer.on('tabRenderer-activateTab', (event, id) => {
  tabRenderer.activateTab(id);
});

ipcRenderer.on('tabRenderer-closeTab', (event, id) => {
  tabRenderer.closeTab(id);
});

ipcRenderer.on('tabRenderer-setTabTitle', (event, arg) => {
  tabRenderer.setTabTitle(arg.id, arg.title);
});

ipcRenderer.on('tabRenderer-setTabIcon', (event, arg) => {
  tabRenderer.setTabIcon(arg.id, arg.icon);
});

ipcRenderer.on('tabRenderer-updateNavigationButtons', (event, arg) => {
  tabRenderer.updateNavigationButtons(arg.canGoBack, arg.canGoForward, arg.isLoading);
});

ipcRenderer.on('tabRenderer-updateAddressBar', (event, url) => {
  tabRenderer.updateAddressBar(url);
});

ipcRenderer.on('tabRenderer-showPreview', (event, id, dataURL) => {
  tabRenderer.showPreview(id, dataURL);
});

ipcRenderer.on('tabRenderer-hidePreview', (event, id) => {
  tabRenderer.hidePreview(id);
});

ipcRenderer.on('tabRenderer-unactivateAllTabs', (event) => {
  tabRenderer.unactivateAllTabs();
});

ipcRenderer.on('tabRenderer-updateTargetURL', (event, url) => {
  tabRenderer.updateTargetURL(url);
});

ipcRenderer.on('tabRenderer-setHomePage', (event, homePage) => {
  var btn = document.getElementById('home-btn');
  if(homePage.on == 1) {
    btn.style.display = "";
    btn.onclick = () => {
      goHome();
    }
    btn.title = "Go home\n(" + homePage.url + ")";
  } else {
    btn.style.display = "none";
  }
});

/*
.####.##....##.####.########
..##..###...##..##.....##...
..##..####..##..##.....##...
..##..##.##.##..##.....##...
..##..##..####..##.....##...
..##..##...###..##.....##...
.####.##....##.####....##...
*/

function init() {
  var winControls = loadWinControls();
  if(winControls.frame) {
    document.body.classList.add('system-titlebar');

    if(!winControls.hideMenu) {
      document.body.classList.add('show-menubar');
    }
  } else {
    applyWinControls();
  }
  if(winControls.color) {
    document.body.classList.add('color-tabs');
  }

  updateTheme();

  // checkOpenWith();
}

document.onreadystatechange = () => {
  if (document.readyState == "complete") {
      init();
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
