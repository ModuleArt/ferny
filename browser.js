/*
.##.....##....###....####.##....##
.###...###...##.##....##..###...##
.####.####..##...##...##..####..##
.##.###.##.##.....##..##..##.##.##
.##.....##.#########..##..##..####
.##.....##.##.....##..##..##...###
.##.....##.##.....##.####.##....##
*/

const {
  ipcRenderer
} = require('electron');
const TabGroup = require("electron-tabs");
const dragula = require("dragula");
const autoSuggest = require('google-autocomplete');
const sslCertificate = require('get-ssl-certificate');

/*
.########....###....########...######.
....##......##.##...##.....##.##....##
....##.....##...##..##.....##.##......
....##....##.....##.########...######.
....##....#########.##.....##.......##
....##....##.....##.##.....##.##....##
....##....##.....##.########...######.
*/

let tabGroup = new TabGroup({
  newTab: {
    title: 'New Tab',
    src: "https://google.com", 
    active: true
  },
  newTabButtonText: "<img name='create' class='theme-icon'/>",
  closeButtonText: "&nbsp;"
});
dragula([tabGroup.tabContainer], {
  direction: "horizontal"
});

tabGroup.on("tab-added", (tab, tabGroup) => {
  let webview = tab.webview;

  tab.tab.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    ipcRenderer.send('request-tab-menu', tab.id);
  }, false);

  tab.on("active", (tab) => {
    document.getElementById('search-input').value = webview.getURL();
    applyFindPanel();
    if (webview.canGoBack()) {
      document.getElementById('back-btn').classList.remove('disable');
    } else {
      document.getElementById('back-btn').classList.add('disable');
    }
    if (webview.canGoForward()) {
      document.getElementById('forward-btn').classList.remove('disable');
    } else {
      document.getElementById('forward-btn').classList.add('disable');
    }
    if (webview.isLoading()) {
      document.getElementById('stop-btn').style.display = "";
      document.getElementById('refresh-btn').style.display = "none";
    } else {
      document.getElementById('stop-btn').style.display = "none";
      document.getElementById('refresh-btn').style.display = "";
    }
  });

  webview.addEventListener('update-target-url', (e) => {
    document.getElementById('target-url').innerHTML = e.url;
  });

  webview.addEventListener('new-window', (e) => {
    if(e.disposition == "background-tab") {
      tabGroup.addTab({
        title: 'New Background Tab',
        src: e.url,
        active: false
      });
    } else {
      tabGroup.addTab({
        title: 'New Tab',
        src: e.url,
        active: true
      });
    }
    
  });

  webview.addEventListener('page-favicon-updated', (e) => {
    tab.setIcon(e.favicons[0]);
  });

  webview.addEventListener('page-title-updated', (e) => {
    tab.setTitle(e.title);
    var index = tab.getPosition(false);
    document.getElementsByClassName('etabs-tab')[index - 1].title = e.title;
  });

  webview.addEventListener('dom-ready', () => {
    webview.blur();
    webview.focus();
    applyFindPanel();
  });

  webview.addEventListener('did-start-loading', () => {
    document.getElementById("refresh-btn").style.display = "none";
    document.getElementById("stop-btn").style.display = "";
  });

  webview.addEventListener('did-stop-loading', () => {
    document.getElementById("refresh-btn").style.display = "";
    document.getElementById("stop-btn").style.display = "none";
  });

  webview.addEventListener('did-navigate', (e) => {
    document.getElementById('search-input').value = e.url;
    tab.setIcon("imgs/gifs/page-loading.gif");

    if (webview.canGoBack()) {
      document.getElementById('back-btn').classList.remove('disable');
    } else {
      document.getElementById('back-btn').classList.add('disable');
    }
    if (webview.canGoForward()) {
      document.getElementById('forward-btn').classList.remove('disable');
    } else {
      document.getElementById('forward-btn').classList.add('disable');
    }
  });

  webview.addEventListener('did-navigate-in-page', (e) => {
    if (e.isMainFrame) {
      document.getElementById('search-input').value = e.url;
      if (webview.canGoBack()) {
        document.getElementById('back-btn').classList.remove('disable');
      } else {
        document.getElementById('back-btn').classList.add('disable');
      }
      if (webview.canGoForward()) {
        document.getElementById('forward-btn').classList.remove('disable');
      } else {
        document.getElementById('forward-btn').classList.add('disable');
      }
    }
  });

  webview.addEventListener('certificate-error', (e) => {
    notif("Certificate error", 'warning');
  });

  webview.addEventListener('enter-html-full-screen', (e) => {
    document.body.classList.add('fullscreen');
    notif("Press F11 to exit full screen", 'info');
  });

  webview.addEventListener('leave-html-full-screen', (e) => {
    document.body.classList.remove('fullscreen');
  });

  webview.addEventListener('did-fail-load', (e) => {
    if (webview.canGoBack()) {
      document.getElementById('back-btn').classList.remove('disable');
    } else {
      document.getElementById('back-btn').classList.add('disable');
    }
    if (webview.canGoForward()) {
      document.getElementById('forward-btn').classList.remove('disable');
    } else {
      document.getElementById('forward-btn').classList.add('disable');
    }

    if (e.errorCode == -300) {
      if (document.getElementById('search-input').value != null) {
        navigateSuggest(document.getElementById('search-input').value);
      }
    // } else if(e.errorCode == -27) {

    } else if (!e.errorDescription == "") {
      notif("Connection failed! " + e.errorDescription + " (" + e.errorCode + ")", "error");
      // tabGroup.getActiveTab().webview.src = 'html/error.html';
    }
  });

  document.getElementsByClassName('etabs-tab-buttons')[tab.getPosition(false) - 1].title = "Close tab";
  resizeTabs();
});

tabGroup.on("tab-removed", (tab, tabGroup) => {
  if (tabGroup.getTabs().length <= 0) {
    tabGroup.addTab();
  }

  resizeTabs();
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

// system pages
function goToBookmarksTab() {
  showSidebar();
  document.getElementById('sidebar-webview').src = 'html/bookmarks.html';
  document.getElementById('bookmarks-btn').classList.add('active');
  document.getElementById('downloads-btn').classList.remove('active');
  document.getElementById('settings-btn').classList.remove('active');
  document.getElementById('about-btn').classList.remove('active');
}

function goToAboutTab() {
  showSidebar();
  document.getElementById('sidebar-webview').src = 'html/about.html';
  document.getElementById('bookmarks-btn').classList.remove('active');
  document.getElementById('downloads-btn').classList.remove('active');
  document.getElementById('settings-btn').classList.remove('active');
  document.getElementById('about-btn').classList.add('active');
}

function goToSettingsTab() {
  showSidebar();
  document.getElementById('sidebar-webview').src = 'html/settings.html';
  document.getElementById('bookmarks-btn').classList.remove('active');
  document.getElementById('downloads-btn').classList.remove('active');
  document.getElementById('settings-btn').classList.add('active');
  document.getElementById('about-btn').classList.remove('active');
}

function goToDownloadsTab() {
  showSidebar();
  document.getElementById('sidebar-webview').src = 'html/downloads.html';
  document.getElementById('bookmarks-btn').classList.remove('active');
  document.getElementById('downloads-btn').classList.add('active');
  document.getElementById('settings-btn').classList.remove('active');
  document.getElementById('about-btn').classList.remove('active');
}

// bookmarks
function createBookmark() {
  var url = tabGroup.getActiveTab().webview.getURL();
  var name = tabGroup.getActiveTab().webview.getTitle();

  let Data = {
    name: name,
    url: url
  };

  var fs = require("fs");
  var ppath = require('persist-path')('ArrowBrowser');

  try {
    var jsonstr = fs.readFileSync(ppath + "\\json\\bookmarks.json");
    var arr = JSON.parse(jsonstr);

    arr.push(Data);

    fs.writeFileSync(ppath + "\\json\\bookmarks.json", JSON.stringify(arr));
  } catch (e) {
    alert(e);
  }

  document.getElementById('sidebar-webview').send('action-update-bookmarks');

  notif("Bookmark added", "info");
}

// search suggestions
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

  if(engine == "google") {
    tabGroup.getActiveTab().webview.loadURL("https://google.com/search?q=" + text);
  } else if(engine == "bing") {
    tabGroup.getActiveTab().webview.loadURL("https://bing.com/search?q=" + text);
  } else if(engine == "duckduckgo") {
    tabGroup.getActiveTab().webview.loadURL("https://duckduckgo.com/?q=" + text);
  } else if(engine == "yahoo") {
    tabGroup.getActiveTab().webview.loadURL("https://search.yahoo.com/search?p=" + text);
  } else if(engine == "yandex") {
    location.href = "https://yandex.com/search/?text=" + text;
  } else if(engine == "wikipedia") {
    tabGroup.getActiveTab().webview.loadURL("https://en.wikipedia.org/wiki/Special:Search?search=" + text);
  }
}

function navigateSuggest(text) {
  var engines = document.getElementsByClassName('search-engine');
  for(var i = 0; i < engines.length; i++) {
    if(engines[i].classList.contains('active')) {
      searchWith(text, engines[i].name);
      break;
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
  closeFindPanel();
  hideSidebar();

  var input = document.getElementById('search-input');
  var suggest = document.getElementById('search-suggest');
  var container = document.getElementById('search-suggest-container');

  suggest.style.display = "";
  suggest.classList.remove("hide");

  if (input.value.length > 0) {
    autoSuggest.getQuerySuggestions(input.value, function (err, suggestions) {
      container.innerHTML = "<input class='active' type='button' value='" + input.value + "' onclick='navigateSuggest(this.value)' />";
      if (suggestions != null && suggestions.length > 0) {
        if (container.childNodes.length < 5) {
          var i;
          for (i = 0; i < 5; i++) {
            if (suggestions[i] != null) {
              var button = "<input type='button' value='" + suggestions[i].suggestion + "' onclick='navigateSuggest(this.value)' />";
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

// notifications
function notif(text, type) {
  var div = document.createElement('div');
  div.classList.add('notif');
  div.classList.add(type);
  div.innerHTML = "<div class='notif-body'><label class='notif-text'>" + text + "</label><img class='notif-close theme-icon' onclick='removeNotif(this)' title='Close notification' name='cancel'></div>";

  var img = document.createElement('img');
  img.classList.add('notif-icon', 'theme-icon');

  switch (type) {
    case "success":
      div.title = 'Success notification';
      img.name = 'check';
      break;
    case "info":
      div.title = 'Info notification';
      img.name = 'info';
      break;
    case "warning":
      div.title = 'Warning notification';
      img.name = 'warning';
      break;
    case "error":
      div.title = 'Error notification';
      img.name = 'fire';
  }
  div.insertBefore(img, div.children[0]);

  var notifPanel = document.getElementById('notif-panel');
  notifPanel.insertBefore(div, notifPanel.firstChild);

  applyTheme(document.documentElement.style.getPropertyValue('--color-back'));

  if (notifPanel.childNodes.length > 5) {
    notifPanel.lastChild.classList.add('closed');
    setTimeout(function () {
      notifPanel.removeChild(notifPanel.lastChild);
    }, 250);
  }

  setTimeout(function () {
    div.classList.add('closed');
    setTimeout(function () {
      notifPanel.removeChild(div);
    }, 250);
  }, 5000);
}

function quest(text, ops) {
  var div = document.createElement('div');
  div.classList.add('notif');
  div.classList.add('quest');
  div.innerHTML = "<img name='question' class='notif-icon theme-icon'><div class='notif-body'><label class='notif-text'>" + text + "</label><br></div>";

  for (var i = 0; i < ops.length; i++) {
    var btn = document.createElement('div');
    btn.classList.add('nav-btn');
    btn.innerHTML = "<img name='" + ops[i].icon + "' class='theme-icon'><label>" + ops[i].text + "</label>";
    let j = i;
    btn.onclick = function () {
      eval(ops[j].click);
    };
    div.childNodes[1].appendChild(btn);
  }

  document.getElementById('notif-panel').appendChild(div);

  applyTheme(document.documentElement.style.getPropertyValue('--color-back'));

  if (notifPanel.childNodes.length > 5) {
    notifPanel.lastChild.classList.add('closed');
    setTimeout(function () {
      notifPanel.removeChild(notifPanel.lastChild);
    }, 250);
  }
}

function removeNotif(btn) {
  var div = btn.parentNode.parentNode;
  div.classList.add('closed');
  setTimeout(function () {
    document.getElementById('notif-panel').removeChild(div);
  }, 250);
}

// themes
function setIconsStyle(str) {
  var icons = document.getElementsByClassName('theme-icon');

  for (var i = 0; i < icons.length; i++) {
    icons[i].src = "themes/" + str + "/icons/" + icons[i].name + ".png";
  }
}

function checkIfDark(color) {
  var r, g, b, hsp;
  if (String(color).match(/^rgb/)) {
    color = String(color).match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

    r = color[1];
    g = color[2];
    b = color[3];
  } else {
    color = +("0x" + color.slice(1).replace(
      color.length < 5 && /./g, '$&$&'));

    r = color >> 16;
    g = color >> 8 & 255;
    b = color & 255;
  }

  hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  if (hsp > 127.5) {
    return false;
  } else {
    return true;
  }
}

function applyTheme(color) {
  document.documentElement.style.setProperty('--color-back', color);
  document.getElementById('search-suggest').style.backgroundColor = color;

  if (checkIfDark(color)) {
    setIconsStyle('light');

    document.documentElement.style.setProperty('--color-top', 'white');
    document.documentElement.style.setProperty('--color-over', 'rgba(0, 0, 0, 0.2)');
  } else {
    setIconsStyle('dark');

    document.documentElement.style.setProperty('--color-top', 'black');
    document.documentElement.style.setProperty('--color-over', 'rgba(0, 0, 0, 0.1)');
  }
}

function applyBorderRadius(size) {
  document.documentElement.style.setProperty('--px-radius', size + 'px');
}

// sidebar

function showSidebar() {
  closeFindPanel();
  removeSuggestions();

  document.getElementById("sidebar-btn").classList.add('active');
  document.getElementById('sidebar').style.display = "";
  document.getElementById('sidebar').classList.remove('hide');

  // document.getElementById('sidebar-webview').openDevTools();
}

function hideSidebar() {
  document.getElementById("sidebar-btn").classList.remove('active');
  document.getElementById('sidebar').classList.add('hide');
  setTimeout(function() {
    document.getElementById('sidebar').style.display = "none";
  }, 250);
}

function checkForUpdates() {
  ipcRenderer.send('request-check-for-updates');
}

function resizeTabs() {
  var tabs = document.getElementsByClassName('etabs-tab');
  var titles = document.getElementsByClassName('etabs-tab-title');
  var buttons = document.getElementsByClassName('etabs-tab-buttons');

  var containerWidth = document.getElementById('etabs-tabs').offsetWidth - 300;

  var tabWidth = containerWidth / tabs.length - 1;
  tabWidth += 1;
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].style.display = "";
    tabs[i].style.width = tabWidth + "px";
    if (tabWidth < 90) {
      titles[i].style.display = "none";
      if (tabWidth < 64) {
        buttons[i].style.display = "none";
        if (tabWidth < 40) {
          if (tabs[i].getBoundingClientRect().left - 16 > containerWidth) {
            tabs[i].style.display = "none";
          }
        }
      } else {
        buttons[i].style.display = "";
      }
    } else {
      titles[i].style.display = "";
    }
  }
}

function exitAppAnyway() {
  ipcRenderer.send('request-exit-app-anyway');
}

function esc() {
  removeSuggestions();
  closeFindPanel();
  hideSidebar();
}

// find in page
function showFindPanel() {
  removeSuggestions();
  hideSidebar();

  document.getElementById("find-panel").style.display = "";
  document.getElementById("find-input").select();

  nextFindInPage();
}

function closeFindPanel() {
  document.getElementById("find-panel").style.display = "none";
  tabGroup.getActiveTab().webview.stopFindInPage("keepSelection");
}

function nextFindInPage() {
  var text = document.getElementById('find-input').value;
  if (text.length > 0) {
    tabGroup.getActiveTab().webview.findInPage(text);
  } else {
    tabGroup.getActiveTab().webview.stopFindInPage("keepSelection");
  }
}

function previousFindInPage() {
  var text = document.getElementById('find-input').value;
  if (text.length > 0) {
    tabGroup.getActiveTab().webview.findInPage(text, {
      forward: false
    });
  } else {
    tabGroup.getActiveTab().webview.stopFindInPage("keepSelection");
  }
}

function applyFindPanel() {
  var status = document.getElementById("find-panel").style.display;
  if (status == "") {
    showFindPanel();
  } else {
    closeFindPanel();
  }
}

// window controls
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

/*
.####.########...######.....########..########.##....##.########..########.########..########.########.
..##..##.....##.##....##....##.....##.##.......###...##.##.....##.##.......##.....##.##.......##.....##
..##..##.....##.##..........##.....##.##.......####..##.##.....##.##.......##.....##.##.......##.....##
..##..########..##..........########..######...##.##.##.##.....##.######...########..######...########.
..##..##........##..........##...##...##.......##..####.##.....##.##.......##...##...##.......##...##..
..##..##........##....##....##....##..##.......##...###.##.....##.##.......##....##..##.......##....##.
.####.##.........######.....##.....##.########.##....##.########..########.##.....##.########.##.....##
*/

// tab menu
ipcRenderer.on('action-tab-newtab', (event, arg) => {
  tabGroup.addTab();
});
ipcRenderer.on('action-tab-reload', (event, arg) => {
  tabGroup.getActiveTab().webview.reload();
});
ipcRenderer.on('action-tab-duplicatetab', (event, arg) => {
  var url = tabGroup.getActiveTab().webview.src;
  tabGroup.addTab();
  tabGroup.getActiveTab().webview.src = url;
});
ipcRenderer.on('action-tab-closetab', (event, arg) => {
  tabGroup.getActiveTab().close(false);
});
ipcRenderer.on('action-tab-goback', (event, arg) => {
  tabGroup.getActiveTab().webview.goBack();
});

// more menu
ipcRenderer.on('action-esc', (event, arg) => {
  esc();
});
ipcRenderer.on('action-page-focussearch', (event, arg) => {
  document.getElementById('search-input').focus();
});

// bookmarks menu
ipcRenderer.on('action-open-bookmarks', (event, arg) => {
  goToBookmarksTab();
});
ipcRenderer.on('action-bookmark-this-page', (event, arg) => {
  createBookmark();
});

// downloads menu
ipcRenderer.on('action-open-downloads', (event, arg) => {
  goToDownloadsTab();
});

// main menu
ipcRenderer.on('action-open-settings', (event, arg) => {
  goToSettingsTab();
});

// zoom menu
ipcRenderer.on('action-zoom-zoomout', (event, arg) => {
  tabGroup.getActiveTab().webview.getZoomFactor(function (zoomFactor) {
    if (zoomFactor > 0.3) {
      tabGroup.getActiveTab().webview.setZoomFactor(zoomFactor - 0.1);
      notif("Zoom factor changed to " + Math.round((zoomFactor - 0.1) * 100) + "%", "info");
      tabGroup.getActiveTab().webview.focus();
    }
  });
});
ipcRenderer.on('action-zoom-zoomin', (event, arg) => {
  tabGroup.getActiveTab().webview.getZoomFactor(function (zoomFactor) {
    if (zoomFactor < 2.5) {
      tabGroup.getActiveTab().webview.setZoomFactor(zoomFactor + 0.1);
      notif("Zoom factor changed to " + Math.round((zoomFactor + 0.1) * 100) + "%", "info");
      tabGroup.getActiveTab().webview.focus();
    }
  });
});
ipcRenderer.on('action-zoom-actualsize', (event, arg) => {
  tabGroup.getActiveTab().webview.getZoomFactor(function (zoomFactor) {
    if (zoomFactor != 1) {
      tabGroup.getActiveTab().webview.setZoomFactor(1);
      notif("Zoom factor changed to the actual size (100%)", "info");
      tabGroup.getActiveTab().webview.focus();
    }
  });
});

// edit menu
ipcRenderer.on('action-edit-cut', (event, arg) => {
  tabGroup.getActiveTab().webview.cut();
  tabGroup.getActiveTab().webview.focus();
});
ipcRenderer.on('action-edit-copy', (event, arg) => {
  tabGroup.getActiveTab().webview.copy();
  tabGroup.getActiveTab().webview.focus();
});
ipcRenderer.on('action-edit-paste', (event, arg) => {
  tabGroup.getActiveTab().webview.paste();
  tabGroup.getActiveTab().webview.focus();
});
ipcRenderer.on('action-edit-undo', (event, arg) => {
  tabGroup.getActiveTab().webview.undo();
  tabGroup.getActiveTab().webview.focus();
});
ipcRenderer.on('action-edit-redo', (event, arg) => {
  tabGroup.getActiveTab().webview.redo();
  tabGroup.getActiveTab().webview.focus();
});
ipcRenderer.on('action-edit-selectall', (event, arg) => {
  tabGroup.getActiveTab().webview.selectAll();
  tabGroup.getActiveTab().webview.focus();
});
ipcRenderer.on('action-edit-delete', (event, arg) => {
  tabGroup.getActiveTab().webview.delete();
  tabGroup.getActiveTab().webview.focus();
});

// page menu
ipcRenderer.on('action-page-devtools', (event, arg) => {
  if (tabGroup.getActiveTab().webview.isDevToolsOpened()) {
    tabGroup.getActiveTab().webview.closeDevTools();
  } else {
    tabGroup.getActiveTab().webview.openDevTools();
  }
});
ipcRenderer.on('action-page-findinpage', (event, arg) => {
  showFindPanel();
});

// app menu
ipcRenderer.on('action-app-about', (event, arg) => {
  goToAboutTab();
});

// tab context menu
ipcRenderer.on('action-tabcontext-reload', (event, arg) => {
  tabGroup.getTab(arg).webview.reload();
});
ipcRenderer.on('action-tabcontext-duplicatetab', (event, arg) => {
  var url = tabGroup.getTab(arg).webview.src;
  tabGroup.addTab();
  tabGroup.getActiveTab().webview.src = url;
});
ipcRenderer.on('action-tabcontext-closetab', (event, arg) => {
  tabGroup.getTab(arg).close();
});

// notif
ipcRenderer.on('action-notif', (event, arg) => {
  notif(arg.text, arg.type);
});
ipcRenderer.on('action-quest', (event, arg) => {
  quest(arg.text, arg.ops);
});

// window
ipcRenderer.on('action-maximize-window', (event, arg) => {
  document.getElementById('drag-zone').classList.add('maximize');
  document.getElementById('maximize-btn').style.display = 'none';
  document.getElementById('unmaximize-btn').style.display = '';
});
ipcRenderer.on('action-unmaximize-window', (event, arg) => {
  document.getElementById('drag-zone').classList.remove('maximize');
  document.getElementById('maximize-btn').style.display = '';
  document.getElementById('unmaximize-btn').style.display = 'none';
});
ipcRenderer.on('action-resize-tabs', (event, arg) => {
  resizeTabs();
});
ipcRenderer.on('action-change-theme', (event, arg) => {
  applyTheme(arg);
});
ipcRenderer.on('action-change-border-radius', (event, arg) => {
  applyBorderRadius(arg);
});
ipcRenderer.on('action-toggle-fullscreen', (event, arg) => {
  if (arg) {
    document.body.classList.add('fullscreen');
  } else {
    document.body.classList.remove('fullscreen');
  }
  tabGroup.getActiveTab().webview.focus();
});
ipcRenderer.on('action-activate-tab', (event, arg) => {
  tabGroup.getTabByPosition(arg + 1).activate();
});
ipcRenderer.on('action-blur-window', (event, arg) => {
  document.getElementById('etabs-tabgroup').classList.add('blur');
});
ipcRenderer.on('action-focus-window', (event, arg) => {
  document.getElementById('etabs-tabgroup').classList.remove('blur');
});
ipcRenderer.on('action-open-url', (event, arg) => {
  tabGroup.addTab({
    title: 'New Tab',
    src: arg,
    active: true
  });
});
ipcRenderer.on('action-set-search-engine', (event, arg) => {
  var engines = document.getElementsByClassName('search-engine');
  for(var i = 0; i < engines.length; i++) {
    if(engines[i].name == arg) {
      engines[i].classList.add('active');
    } else {
      engines[i].classList.remove('active');
    }
  }
});
ipcRenderer.on('action-set-start-page', (event, arg) => {
  // startPage = arg;
  tabGroup.options.newTab.src = arg;
  // console.log(tabGroup);
});

// downloads
ipcRenderer.on('action-create-download', (event, arg) => {
  document.getElementById('sidebar-webview').send('action-create-download', arg);
  notif('Download started: ' + arg.name, 'info');
});
ipcRenderer.on('action-create-stopped-download', (event, arg) => {
  document.getElementById('sidebar-webview').send('action-create-stopped-download', arg);
});
ipcRenderer.on('action-set-download-status-pause', (event, arg) => {
  document.getElementById('sidebar-webview').send('action-set-download-status-pause', arg);
});
ipcRenderer.on('action-set-download-status-done', (event, arg) => {
  document.getElementById('sidebar-webview').send('action-set-download-status-done', arg);
  notif('Download complete: ' + arg.name, 'success');
});
ipcRenderer.on('action-set-download-status-failed', (event, arg) => {
  document.getElementById('sidebar-webview').send('action-set-download-status-failed', arg);
  notif('Download ' + arg.state + ": " + arg.name, 'error');
});
ipcRenderer.on('action-set-download-status-interrupted', (event, arg) => {
  document.getElementById('sidebar-webview').send('action-set-download-status-interrupted', arg);
  notif('Download interrupted: ' + arg.name, 'warning');
});
ipcRenderer.on('action-set-download-process', (event, arg) => {
  document.getElementById('sidebar-webview').send('action-set-download-process', arg);
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
  // document.getElementById('window-controls').innerHTML = `
  //   <img name="minimize" id="minimize-btn" class="title-bar-btn theme-icon" title="Minimize" onclick="minimizeWindow()">
  //   <img name="restore" id="unmaximize-btn" class="title-bar-btn theme-icon" title="Restore down" onclick="restoreWindow()" style="display: none">
  //   <img name="maximize" id="maximize-btn" class="title-bar-btn theme-icon" title="Maximize" onclick="maximizeWindow()">
  //   <img name="close" id="close-btn" class="title-bar-btn theme-icon" title="Close" onclick="closeWindow()">
  // `;
  // document.getElementById('window-controls').classList.add('arrow');
  document.getElementById('window-controls').innerHTML = `
    <div class="button" id="minimize-btn" title="Minimize" onclick="minimizeWindow()"><span>&#xE921;</span></div>
    <div class="button" id="unmaximize-btn" title="Restore down" onclick="restoreWindow()" style="display: none"><span>&#xE923;</span></div>
    <div class="button" id="maximize-btn" title="Maximize" onclick="maximizeWindow()"><span>&#xE922;</span></div>
    <div class="button" id="close-btn" title="Close" onclick="closeWindow()"><span>&#xE8BB;</span></div>
  `;
  document.getElementById('window-controls').classList.add('windows');

  sslCertificate.get('google.com').then(function (certificate) {
    console.log(certificate)
  });

  document.getElementById("add-bookmark-btn").addEventListener("click", (e) => {
    createBookmark();
  });

  document.getElementById("search-input").addEventListener("keyup", function (event) {
    event.preventDefault();
    if (document.getElementById("search-input").value.length > 0) {
      if (event.keyCode === 13) {
        var suggestions = document.getElementById('search-suggest-container').childNodes;
        var i = 0;
        while (i < suggestions.length && !suggestions[i].classList.contains('active')) {
          i++;
        }
        navigateSuggest(suggestions[i].value);
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
  });

  document.getElementById("search-input").addEventListener("focus", function (event) {
    this.select();
  });

  document.getElementById("menu-btn").addEventListener("click", (e) => {
    ipcRenderer.send('request-side-menu');
  });

  document.getElementById("tabs-list-btn").addEventListener("click", (e) => {
    let arr = [];
    let tabs = document.getElementsByClassName('etabs-tab');
    for (var i = 0; i < tabs.length; i++) {
      arr.push({
        label: tabs[i].getElementsByClassName('etabs-tab-title')[0].innerHTML,
        active: tabs[i].classList.contains('active')
      });
    }
    ipcRenderer.send('request-tabs-list', arr);
  });

  document.getElementById("back-btn").addEventListener("click", (e) => {
    tabGroup.getActiveTab().webview.goBack();
  });

  document.getElementById("forward-btn").addEventListener("click", (e) => {
    tabGroup.getActiveTab().webview.goForward();
  });

  document.getElementById("refresh-btn").addEventListener("click", (e) => {
    tabGroup.getActiveTab().webview.reload();
  });

  document.getElementById("stop-btn").addEventListener("click", (e) => {
    tabGroup.getActiveTab().webview.stop();
  });

  document.getElementById("find-input").addEventListener("keyup", function (event) {
    nextFindInPage();
  });

  document.getElementById("close-suggest-btn").addEventListener("click", (e) => {
    removeSuggestions();
  });

  document.getElementById("hide-sidebar-btn").addEventListener("click", (e) => {
    hideSidebar();
  });

  document.getElementById("sidebar-btn").addEventListener("click", (e) => {
    if (document.getElementById("sidebar").style.display == "none") {
      showSidebar();
    } else {
      hideSidebar();
    }
  });

  document.getElementsByClassName('etabs-buttons')[0].title = "New tab";
};

document.onreadystatechange = () => {
  if (document.readyState == "complete") {
    init();
  }
};

/*
.########.##.....##.########....########.##....##.########.
....##....##.....##.##..........##.......###...##.##.....##
....##....##.....##.##..........##.......####..##.##.....##
....##....#########.######......######...##.##.##.##.....##
....##....##.....##.##..........##.......##..####.##.....##
....##....##.....##.##..........##.......##...###.##.....##
....##....##.....##.########....########.##....##.########.
*/