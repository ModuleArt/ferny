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

const extToImagePath = require("../modules/extToImagePath.js");
const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");
const applyTheme = require("../modules/applyTheme.js");
const loadTheme = require("../modules/loadTheme.js");
const applyWinControls = require("../modules/applyWinControls.js");
const bytesToSize = require("../modules/bytesToSize.js");
const loadWinControls = require("../modules/loadWinControls.js");
const rgbToRgbaString = require("../modules/rgbToRgbaString.js");

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

//   webview.getWebContents().on('context-menu', (event, params) => {
//     let Data = {
//       id: tab.id,
//       params: params
//     }

//     ipcRenderer.send('request-webview-contextmenu', Data);
//   });

//   document.getElementById('search-input').value = "";
//   document.getElementById('back-btn').disabled = true;
//   document.getElementById('forward-btn').disabled = true;
//   applyFindPanel();

//   webview.addEventListener('update-target-url', (e) => {
//     document.getElementById('target-url').innerHTML = e.url;
//   });

//   webview.addEventListener('did-navigate', (e) => {
//     document.getElementById('search-input').value = e.url;
//     tab.setIcon("../imgs/gifs/page-loading.gif");

//     if (webview.canGoBack()) {
//       document.getElementById('back-btn').disabled = false;
//     } else {
//       document.getElementById('back-btn').disabled = true;
//     }
//     if (webview.canGoForward()) {
//       document.getElementById('forward-btn').disabled = false;
//     } else {
//       document.getElementById('forward-btn').disabled = true;
//     }
    
//     ipcRenderer.send('request-add-history-item', e.url);
//   });

// tabGroup.on("tab-removed", (tab, tabGroup) => {
//   if (tabGroup.getTabs().length <= 0) {
//     try {
//       fs.readFile(ppath + "/json/lasttab.json", function(err, data) {
//         if(data == "new-tab") {
//           tabGroup.addTab();
//         } else if(data == "quit") {
//           closeWindow();
//         }
//       });
//     } catch (e) {
//       saveFileToJsonFolder("lasttab", "new-tab");
//       tabGroup.addTab();
//     }
//   }
// });

/*
.########.##.....##.##....##..######..########.####..#######..##....##..######.
.##.......##.....##.###...##.##....##....##.....##..##.....##.###...##.##....##
.##.......##.....##.####..##.##..........##.....##..##.....##.####..##.##......
.######...##.....##.##.##.##.##..........##.....##..##.....##.##.##.##..######.
.##.......##.....##.##..####.##..........##.....##..##.....##.##..####.......##
.##.......##.....##.##...###.##....##....##.....##..##.....##.##...###.##....##
.##........#######..##....##..######.....##....####..#######..##....##..######.
*/

function loadSearchEngine() {
  var searchEngine = 'duckduckgo';

  try {
    searchEngine = fs.readFileSync(ppath + "/json/searchengine.json");
  } catch (e) {
    saveFileToJsonFolder('searchengine', searchEngine);
  }

  applySearchEngine(searchEngine);
}

function applySearchEngine(arg) {
  var engines = document.getElementsByClassName('search-engine');
  for(var i = 0; i < engines.length; i++) {
    if(engines[i].name == arg) {
      engines[i].classList.add('active');
    } else {
      engines[i].classList.remove('active');
    }
  }
}

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

function createBookmark(url, name, folder) {
  let Data = {
    name: name,
    url: url,
    folder: folder
  };

  var arr = [];
  try {
    var jsonstr = fs.readFileSync(ppath + "/json/bookmarks.json");
    arr = JSON.parse(jsonstr);
  } catch (e) {

  }

  arr.push(Data);

  saveFileToJsonFolder('bookmarks', JSON.stringify(arr));

  document.getElementById('sidebar-webview').send('action-update-bookmarks');

  notificationManager.addStatusNotif("Bookmark added", "info");

  updateBookmarksBar();
}

function searchWith(text, engine) {
  if(text == null) {
    var suggestions = document.getElementById('search-suggest-container').childNodes;
    var i = 0;
    while (i < suggestions.length && !suggestions[i].classList.contains('active')) {
      i++;
    }
    text = suggestions[i].value;
  }

  removeSuggestions();

  // switch (engine) {
  //   case 'google':
  //     tabGroup.getActiveTab().webview.loadURL("https://google.com/search?q=" + text);
  //     break;
  //   case 'bing':
  //     tabGroup.getActiveTab().webview.src = "https://bing.com/search?q=" + text;
  //     break;
  //   case 'duckduckgo':
  //     tabGroup.getActiveTab().webview.loadURL("https://duckduckgo.com/?q=" + text);
  //     break;
  //   case 'yahoo':
  //     tabGroup.getActiveTab().webview.loadURL("https://search.yahoo.com/search?p=" + text);
  //     break;
  //   case 'wikipedia':
  //     tabGroup.getActiveTab().webview.loadURL("https://wikipedia.org/wiki/Special:Search?search=" + text);
  //     break;
  //   case 'yandex':
  //     tabGroup.getActiveTab().webview.loadURL("https://yandex.com/search/?text=" + text);
  //     break;
  //   case 'mailru':
  //     tabGroup.getActiveTab().webview.loadURL("https://go.mail.ru/search?q=" + text);
  //     break;
  //   case 'baidu':
  //     tabGroup.getActiveTab().webview.loadURL("https://www.baidu.com/s?wd=" + text);
  //     break;
  //   case 'naver':
  //     tabGroup.getActiveTab().webview.loadURL("https://search.naver.com/search.naver?query=" + text);
  //     break;
  //   case 'qwant':
  //     tabGroup.getActiveTab().webview.loadURL("https://www.qwant.com/?q=" + text);
  //     break;
  //   case 'youtube':
  //     tabGroup.getActiveTab().webview.loadURL("https://www.youtube.com/results?search_query=" + text);
  //     break;
  // }
}

function navigateSuggest(text) {
  if(isUrl(text)) {
    // tabGroup.getActiveTab().webview.loadURL(text);
  } else {
    var engines = document.getElementsByClassName('search-engine');
    for(var i = 0; i < engines.length; i++) {
      if(engines[i].classList.contains('active')) {
        searchWith(text, engines[i].name);
        break;
      }
    }
  }
}

function removeSuggestions() {
  setTimeout(function () {
    var suggest = document.getElementById('search-suggest');
    suggest.classList.add("hide");
    setTimeout(function () {
      suggest.style.display = "none";
      // document.getElementById('search-suggest-container').innerHTML = "";
    }, 250);
  }, 150);
}

function getSuggestions() {
  var input = document.getElementById('search-input');
  var suggest = document.getElementById('search-suggest');
  var container = document.getElementById('search-suggest-container');

  suggest.style.display = "";
  suggest.classList.remove("hide");

  container.innerHTML = "<input tabIndex='-1' class='active' type='button' value='" + input.value + "' onclick='navigateSuggest(this.value)' />";

  if (input.value.length > 0) {
    autoSuggest(input.value, function (err, suggestions) {
      if (suggestions != null && suggestions.length > 0) {
        if (container.childNodes.length < 5) {
          for (var i = 0; i < 5; i++) {
            if (suggestions[i] != null) {
              var button = "<input tabIndex='-1' type='button' value='" + suggestions[i] + "' onclick='navigateSuggest(this.value)' />";
              container.innerHTML += button;
            }
          }
        }
      }
    });
  } else {
    removeSuggestions();
  }
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

function searchKeyUp(event) {
  event.preventDefault();
  if (document.getElementById("search-input").value.length > 0) {
    if (event.keyCode === 13) {
      var suggestions = document.getElementById('search-suggest-container').childNodes;
      if(suggestions.length > 0) {
        var i = 0;
        while (i < suggestions.length && !suggestions[i].classList.contains('active')) {
          i++;
        }
        navigateSuggest(suggestions[i].value);
      } else {
        navigateSuggest(document.getElementById('search-input').value);
      }
    }
    if (event.keyCode === 40) {
      var suggestions = document.getElementById('search-suggest-container').childNodes;
      var i = 0;
      while (i < suggestions.length && !suggestions[i].classList.contains('active')) {
        i++;
      }
      if (i < suggestions.length - 1) {
        document.getElementById('search-input').value = suggestions[i].nextSibling.value;
        suggestions[i].classList.remove('active');
        suggestions[i].nextSibling.classList.add('active');
      }
    }
    if (event.keyCode === 38) {
      var suggestions = document.getElementById('search-suggest-container').childNodes;
      var i = 0;
      while (i < suggestions.length && !suggestions[i].classList.contains('active')) {
        i++;
      }
      if (i > 0) {
        document.getElementById('search-input').value = suggestions[i].previousSibling.value;
        suggestions[i].classList.remove('active');
        suggestions[i].previousSibling.classList.add('active');
      }
    }
  }
}

function removeFolder(folder) {
  try {
    var jsonstr = fs.readFileSync(ppath + "/json/folders.json");
    var arr = JSON.parse(jsonstr);
    for (var i = 0; i < arr.length; i++) {
      if(arr[i].name == folder) {
        arr.splice(i, 1);
      }
    }
    saveFileToJsonFolder('folders', JSON.stringify(arr)).then(function() {
      document.getElementById('sidebar-webview').send('action-remove-folder', folder);
      updateBookmarksBar();

      notificationManager.addStatusNotif("Folder removed: " + folder, "info");
    });
  } catch (e) {

  }
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

function searchSuggestWheel(event) {
  if (event.deltaY < 0) {
    var suggestions = document.getElementById('search-suggest-container').childNodes;
    var i = 0;
    while (i < suggestions.length && !suggestions[i].classList.contains('active')) {
      i++;
    }
    if (i > 0) {
      document.getElementById('search-input').value = suggestions[i].previousSibling.value;
      suggestions[i].classList.remove('active');
      suggestions[i].previousSibling.classList.add('active');
    }
  }
  if (event.deltaY > 0) {
    var suggestions = document.getElementById('search-suggest-container').childNodes;
    var i = 0;
    while (i < suggestions.length && !suggestions[i].classList.contains('active')) {
      i++;
    }
    if (i < suggestions.length - 1) {
      document.getElementById('search-input').value = suggestions[i].nextSibling.value;
      suggestions[i].classList.remove('active');
      suggestions[i].nextSibling.classList.add('active');
    }
  }
}

function focusSearch() {
  let s = document.getElementById('search-input');
  s.focus();
  s.select();
}

function loadHome() {
  let Data = {
    url: "https://duckduckgo.com",
    on: 0
  };

  try {
    var jsonstr = fs.readFileSync(ppath + "/json/home.json");
    Data = JSON.parse(jsonstr);
  } catch (e) {
    saveFileToJsonFolder('home', JSON.stringify(Data))
  }

  var btn = document.getElementById('home-btn');
  if(Data.on == 1) {
    btn.style.display = "";
    btn.onclick = () => {
      goHome(Data.url);
    }
  } else {
    btn.style.display = "none";
  }
}

function goHome(url) {
  // tabGroup.getActiveTab().webview.loadURL(url);
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
  ipcRenderer.send('tabManager-showTabList');
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

ipcRenderer.on('action-maximize-window', (event, arg) => {
  document.getElementById('drag-zone').classList.add('maximize');
  document.getElementById('max-btn').style.display = "none";
  document.getElementById('restore-btn').style.display = "";
});

ipcRenderer.on('action-unmaximize-window', (event, arg) => {
  document.getElementById('drag-zone').classList.remove('maximize');
  document.getElementById('max-btn').style.display = "";
  document.getElementById('restore-btn').style.display = "none";
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

ipcRenderer.on('action-toggle-sidebar', (event, arg) => {
  toggleSidebar();
});

ipcRenderer.on('action-toggle-fullscreen', (event, arg) => {
  // if (arg) {
  //   document.body.classList.add('fullscreen');
  // } else {
  //   document.body.classList.remove('fullscreen');
  // }
  // tabGroup.getActiveTab().webview.focus();
});

ipcRenderer.on('action-activate-tab', (event, arg) => {
  // tabGroup.getTabByPosition(arg + 1).activate();
});

ipcRenderer.on('action-next-tab', (event, arg) => {
  // let pos = tabGroup.getActiveTab().getPosition();
  // if(tabGroup.getTabByPosition(pos + 1) != null) {
  //   tabGroup.getTabByPosition(pos + 1).activate();
  // }
});

ipcRenderer.on('action-prev-tab', (event, arg) => {
  // let pos = tabGroup.getActiveTab().getPosition();
  // if(tabGroup.getTabByPosition(pos - 1) != null) {
  //   tabGroup.getTabByPosition(pos - 1).activate();
  // }
});

ipcRenderer.on('action-blur-window', (event, arg) => {
  // document.getElementById('etabs-tabgroup').classList.add('blur');
});

ipcRenderer.on('action-focus-window', (event, arg) => {
  // document.getElementById('etabs-tabgroup').classList.remove('blur');
});

ipcRenderer.on('action-open-url', (event, arg) => {
  // tabGroup.getActiveTab().webview.loadURL(arg);
  // if(!document.body.classList.contains('pinned-sidebar')) {
  //   hideSidebar();
  // }
});

ipcRenderer.on('action-open-url-in-new-tab', (event, arg) => {
  newTab(arg, null, null);
  if(!document.body.classList.contains('pinned-sidebar')) {
    hideSidebar();
  }
});

ipcRenderer.on('action-set-search-engine', (event, arg) => {
  applySearchEngine(arg);
});

ipcRenderer.on('action-add-history-item', (event, arg) => {
  document.getElementById('sidebar-webview').send('action-add-history-item', arg);
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
.####.########...######................##......##.##.....##.....######...#######..##....##.########.########.##.....##.########
..##..##.....##.##....##...............##..##..##.##.....##....##....##.##.....##.###...##....##....##........##...##.....##...
..##..##.....##.##.....................##..##..##.##.....##....##.......##.....##.####..##....##....##.........##.##......##...
..##..########..##..........#######....##..##..##.##.....##....##.......##.....##.##.##.##....##....######......###.......##...
..##..##........##.....................##..##..##..##...##.....##.......##.....##.##..####....##....##.........##.##......##...
..##..##........##....##...............##..##..##...##.##......##....##.##.....##.##...###....##....##........##...##.....##...
.####.##.........######.................###..###.....###........######...#######..##....##....##....########.##.....##....##...
*/

ipcRenderer.on('action-webview-contextmenu', (event, arg) => {
  // if(arg.action == 'cut') {
  //   tabGroup.getTab(arg.id).webview.cut();
  // } else if(arg.action == 'copy') {
  //   tabGroup.getTab(arg.id).webview.copy();
  // } else if(arg.action == 'paste') {
  //   tabGroup.getTab(arg.id).webview.paste();
  // } else if(arg.action == 'paste-match-style') {
  //   tabGroup.getTab(arg.id).webview.pasteAndMatchStyle();
  // } else if(arg.action == 'undo') {
  //   tabGroup.getTab(arg.id).webview.undo();
  // } else if(arg.action == 'redo') {
  //   tabGroup.getTab(arg.id).webview.redo();
  // } else if(arg.action == 'select-all') {
  //   tabGroup.getTab(arg.id).webview.selectAll();
  // } else if(arg.action == 'delete') {
  //   tabGroup.getTab(arg.id).webview.delete();
  // } 
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

  loadHome();
  loadBookmarksBar();
  loadSearchEngine();
  
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
