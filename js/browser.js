/*
 #####  ######  ####  #    # # #####  ######
 #    # #      #    # #    # # #    # #
 #    # #####  #    # #    # # #    # #####
 #####  #      #  # # #    # # #####  #
 #   #  #      #   #  #    # # #   #  #
 #    # ######  ### #  ####  # #    # ######
*/

const { ipcRenderer } = require("electron");
const dragula = require("dragula");

const applyTheme = require("../modules/applyTheme.js");
const loadTheme = require("../modules/loadTheme.js");
const applyWinControls = require("../modules/applyWinControls.js");

const NotificationManager = require("../modules/NotificationManager/NotificationManager.js");
const TabRenderer = require("../modules/TabManager/TabRenderer.js");

/*
 ###### #    # #    #  ####              ##### #    # ###### #    # ######  ####
 #      #    # ##   # #    #               #   #    # #      ##  ## #      #
 #####  #    # # #  # #         #####      #   ###### #####  # ## # #####   ####
 #      #    # #  # # #                    #   #    # #      #    # #           #
 #      #    # #   ## #    #               #   #    # #      #    # #      #    #
 #       ####  #    #  ####                #   #    # ###### #    # ######  ####
*/

function updateTheme() {
  loadTheme().then(function(theme) {
    applyTheme(theme);
  });
}

/*
 #    #  ####  ##### # ###### #  ####    ##   ##### #  ####  #    #  ####
 ##   # #    #   #   # #      # #    #  #  #    #   # #    # ##   # #
 # #  # #    #   #   # #####  # #      #    #   #   # #    # # #  #  ####
 #  # # #    #   #   # #      # #      ######   #   # #    # #  # #      #
 #   ## #    #   #   # #      # #    # #    #   #   # #    # #   ## #    #
 #    #  ####    #   # #      #  ####  #    #   #   #  ####  #    #  ####
*/

let notificationManager = new NotificationManager(document.getElementById("notif-panel"));

notificationManager.on("notif-added", (notif) => {
  updateTheme();
});

/*
 #####   ##   #####   ####
   #    #  #  #    # #
   #   #    # #####   ####
   #   ###### #    #      #
   #   #    # #    # #    #
   #   #    # #####   ####
*/

let tabRenderer = new TabRenderer();

let tabDrag = dragula([tabRenderer.getTabContainer()], {
  direction: "horizontal"
});

tabDrag.on("drag", function(el, source) {
  let div = el.getElementsByClassName("tabman-tab-preview")[0];
  if(div != null) {
    div.parentNode.removeChild(div);
  }
});

tabDrag.on("drop", function(el, target, source, sibling) {
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

function prevDef(event) {
  event.preventDefault();
}

function popupInfoContextMenu() {
  ipcRenderer.send("request-info-contextmenu");
}

function requestSideMenu() {
  ipcRenderer.send("request-side-menu");
}

function installUpdate() {
  ipcRenderer.send("main-installUpdate");
}

function downloadUpdate() {
  ipcRenderer.send("main-downloadUpdate");
}

function clearDownloads() {
  ipcRenderer.send("overlay-clearDownloads");
}

function clearHistory() {
  ipcRenderer.send("overlay-clearHistory")
}

function cancelUpdate() {
  ipcRenderer.send("main-cancelUpdate");
  notificationManager.addStatusNotif("Update cancelled", "error");
}

function checkForUpdates() {
  ipcRenderer.send("main-checkForUpdates");
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
  ipcRenderer.send("tabManager-zoomIn");
}

function zoomOut() {
  ipcRenderer.send("tabManager-zoomOut");
}

function zoomToActualSize() {
  ipcRenderer.send("tabManager-zoomToActualSize");
}

function focusSearch() {
  let s = document.getElementById('search-input');
  s.focus();
  s.select();
}

function createBookmark() {
  ipcRenderer.send("overlay-bookmarkThisPage");
}

function bookmarkAllTabs() {
  // tabGroup.eachTab((currentTab, index, tabs) => {
  //   createBookmark(currentTab.webview.getURL(), currentTab.getTitle(), null);
  // });
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
  ipcRenderer.send("overlay-show");
}

function showOverlayButtonMenu() {
  ipcRenderer.send("overlay-showButtonMenu");
}

function goToSearch(text, selectionStart) {
  ipcRenderer.send("overlay-goToSearch", text, selectionStart);
}

function removeFolder(id) {
  ipcRenderer.send("overlay-removeFolder", id);
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
  ipcRenderer.send("tabManager-newTab");
}

function newBackgroundTab() {
  ipcRenderer.send("tabManager-newBackgroundTab");
}

function showTabList() {
  tabRenderer.showTabList();
}

function goBack() {
  ipcRenderer.send("tabManager-goBack");
}

function goForward() {
  ipcRenderer.send("tabManager-goForward");
}

function reload() {
  ipcRenderer.send("tabManager-reload");
}

function stop() {
  ipcRenderer.send("tabManager-stop");
}

function newTabDrop(event) {
  event.preventDefault();
  let textData = event.dataTransfer.getData("Text");
  if (textData) {
    ipcRenderer.send("tabManager-addTab", "file://" + textData, false);
  } else if(event.dataTransfer.files.length > 0) {
    for(let i = 0; i < event.dataTransfer.files.length; i++) {
      ipcRenderer.send("tabManager-addTab", "file://" + event.dataTransfer.files[i].path, false);
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
 # #####   ####              #    #  ####  ##### # ######
 # #    # #    #             ##   # #    #   #   # #
 # #    # #         #####    # #  # #    #   #   # #####
 # #####  #                  #  # # #    #   #   # #
 # #      #    #             #   ## #    #   #   # #
 # #       ####              #    #  ####    #   # #
*/

ipcRenderer.on("notificationManager-addStatusNotif", (event, arg) => {
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

ipcRenderer.on("action-refresh-zoom-notif", (event, zoomFactor) => {
  notificationManager.refreshZoomNotif(zoomFactor);
});

/*
 # #####   ####              #    # # #    # #####   ####  #    #
 # #    # #    #             #    # # ##   # #    # #    # #    #
 # #    # #         #####    #    # # # #  # #    # #    # #    #
 # #####  #                  # ## # # #  # # #    # #    # # ## #
 # #      #    #             ##  ## # #   ## #    # #    # ##  ##
 # #       ####              #    # # #    # #####   ####  #    #
*/

ipcRenderer.on("action-page-focussearch", (event, arg) => {
  focusSearch();
});

ipcRenderer.on("window-changeTheme", (event, arg) => {
  applyTheme(arg);
});

ipcRenderer.on("window-blur", (event) => {
  document.getElementById("tabman").classList.add("blur");
});

ipcRenderer.on("window-focus", (event) => {
  document.getElementById("tabman").classList.remove("blur");
});

ipcRenderer.on("window-maximize", (event) => {
  document.getElementById("drag-zone").classList.add("maximize");
  document.getElementById("max-btn").style.display = "none";
  document.getElementById("restore-btn").style.display = "";
});

ipcRenderer.on("window-unmaximize", (event) => {
  document.getElementById("drag-zone").classList.remove("maximize");
  document.getElementById("max-btn").style.display = "";
  document.getElementById("restore-btn").style.display = "none";
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
    document.getElementById("overlay-btn").classList.add("active");
    document.getElementById("titlebar").style.display = "none";
  } else {
    document.getElementById("overlay-btn").classList.remove("active");
    document.getElementById("titlebar").style.display = "";
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

ipcRenderer.on("tabRenderer-addTab", (event, arg) => {
  tabRenderer.addTab(arg.id, arg.url, arg.active)
});

ipcRenderer.on("tabRenderer-activateTab", (event, id) => {
  tabRenderer.activateTab(id);
});

ipcRenderer.on("tabRenderer-closeTab", (event, id) => {
  tabRenderer.closeTab(id);
});

ipcRenderer.on("tabRenderer-setTabTitle", (event, arg) => {
  tabRenderer.setTabTitle(arg.id, arg.title);
});

ipcRenderer.on("tabRenderer-setTabIcon", (event, arg) => {
  tabRenderer.setTabIcon(arg.id, arg.icon);
});

ipcRenderer.on("tabRenderer-updateNavigationButtons", (event, arg) => {
  tabRenderer.updateNavigationButtons(arg.canGoBack, arg.canGoForward, arg.isLoading);
});

ipcRenderer.on("tabRenderer-updateAddressBar", (event, url) => {
  tabRenderer.updateAddressBar(url);
});

ipcRenderer.on("tabRenderer-showPreview", (event, id, dataURL) => {
  tabRenderer.showPreview(id, dataURL);
});

ipcRenderer.on("tabRenderer-hidePreview", (event, id) => {
  tabRenderer.hidePreview(id);
});

ipcRenderer.on("tabRenderer-unactivateAllTabs", (event) => {
  tabRenderer.unactivateAllTabs();
});

ipcRenderer.on("tabRenderer-updateTargetURL", (event, url) => {
  tabRenderer.updateTargetURL(url);
});

ipcRenderer.on("tabRenderer-moveTabBefore", (event, id, beforeId) => {
  tabRenderer.moveTabBefore(id, beforeId);
});

ipcRenderer.on("tabRenderer-moveTabToEnd", (event, id) => {
  tabRenderer.moveTabToEnd(id);
});

ipcRenderer.on("tabRenderer-setHomePage", (event, homePage) => {
  var btn = document.getElementById("home-btn");
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
  applyWinControls();

  updateTheme();
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
