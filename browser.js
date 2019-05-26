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
const {
  shell
} = require('electron');
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
    src: 'html/bookmarks.html', 
    active: true,
    webviewAttributes: {
      nodeintegration: true
      // nodeingtegration: false,
      // enableBlinkFeatures: "DocumentCookie,CookieStore"
    }
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
  });

  webview.addEventListener('update-target-url', (e) => {
    document.getElementById('target-url').innerHTML = e.url;
  });

  webview.addEventListener('new-window', (e) => {
    // console.log(e);
    tabGroup.addTab({
      title: 'New Tab',
      src: e.url,
      active: true
    });
  });

  webview.addEventListener('page-favicon-updated', (e) => {
    // tab.setIcon('http://www.google.com/s2/favicons?domain=' + webview.getURL());
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

  // webview.addEventListener('focus', (e) => {
  //   removeSuggestions();
  // });

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
  tabGroup.getActiveTab().webview.src = 'html/bookmarks.html';
}

function goToAboutTab() {
  tabGroup.getActiveTab().webview.src = 'html/about.html';
}

function goToSettingsTab() {
  tabGroup.getActiveTab().webview.src = 'html/settings.html';
}

function goToDownloadsTab() {
  tabGroup.getActiveTab().webview.src = 'html/downloads.html';
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
  } else if(engine == "duck") {
    tabGroup.getActiveTab().webview.loadURL("https://duckduckgo.com/?q=" + text);
  } else if(engine == "yahoo") {
    location.href = "https://search.yahoo.com/search?p=" + text;
  } else if(engine == "yandex") {
    location.href = "https://yandex.com/search/?text=" + text;
  } else if(engine == "wiki") {
    tabGroup.getActiveTab().webview.loadURL("https://en.wikipedia.org/wiki/Special:Search?search=" + text);
  }
}

function navigateSuggest(text) {
  searchWith(text, "google");
}

function removeSuggestions() {
  setTimeout(function () {
    document.getElementById('search-suggest').classList.remove("show");
    document.getElementById('search-suggest-container').innerHTML = "";
  }, 100);
}

function getSuggestions() {
  closeFindPanel();
  closeDownloadPanel();

  var input = document.getElementById('search-input');
  var suggest = document.getElementById('search-suggest');
  var container = document.getElementById('search-suggest-container');

  suggest.classList.add("show");

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
    btn.classList.add('notif-btn');
    btn.innerHTML = "<img name='" + ops[i].icon + "' class='theme-icon'><label class='notif-btn-label'>" + ops[i].text + "</label>";
    let j = i;
    btn.onclick = function () {
      eval(ops[j].click);
    };
    div.childNodes[1].appendChild(btn);
  }

  document.getElementById('notif-panel').appendChild(div);

  if (notifPanel.childNodes.length > 5) {
    notifPanel.lastChild.classList.add('closed');
    setTimeout(function () {
      notifPanel.removeChild(notifPanel.lastChild);
    }, 250);
  }

  applyTheme(document.documentElement.style.getPropertyValue('--color-back'));
}

function removeNotif(btn) {
  var div = btn.parentNode.parentNode;
  div.classList.add('closed');
  setTimeout(function () {
    document.getElementById('notif-panel').removeChild(div);
  }, 250);
}

// downloads
function createDownload(index, name, url) {
  var div = document.createElement('div');
  div.classList.add('download');
  div.id = "download-" + index;
  div.innerHTML = `
    <label>File: </label><label class="download-file" title="` + name + `">` + name + `</label><br>
    <label class="download-status" value="starting">Starting</label><br>
    <label>Url: </label><label class="download-link" title="` + url + `">` + url + `</label><br>
    <div class="download-buttons"></div>`;

  var container = document.getElementById('sidebar-downloads');
  var dwndls = container.getElementsByClassName('download');
  if (dwndls.length > 0) {
    container.insertBefore(div, dwndls[0]);
  } else {
    container.appendChild(div);
  }
  notif('Download started: ' + name, 'info');
}

function createStoppedDownload(index, name, url, path) {
  var div = document.createElement('div');
  div.classList.add('download');
  div.id = "download-" + index;
  div.innerHTML = `
    <label>File: </label><label class="download-file" title="` + name + `">` + name + `</label><br>
    <label class="download-status" value="stopped">Finished</label><br>
    <label>Url: </label><label class="download-link" title="` + url + `">` + url + `</label><br>`;

  var fs = require('fs');
  if (fs.existsSync(path.replace(/\\/g, "/"))) {
    div.innerHTML += `
      <div class="download-buttons">
        <div class="nav-btn colored green" onclick="showItemInFolder('` + path.replace(/\\/g, "/") + `')">
          <img class="nav-btn-icon theme-icon" name="download-folder">
          <label>Folder</label>
        </div>
        <div class="nav-btn colored orange" onclick="openItem('` + path.replace(/\\/g, "/") + `')">
          <img class="nav-btn-icon theme-icon" name="file">
          <label>Open</label>
        </div>
        <div class="nav-btn colored red" onclick="removeDownload(` + index + `)">
          <img class="nav-btn-icon theme-icon" name="delete">
          <label>Remove</label>
        </div>
      </div>`;
  } else {
    div.innerHTML += `
      <div class="download-buttons">
        <div class="nav-btn colored blue" onclick="retryDownload(` + index + `, '` + url + `')">
          <img class="nav-btn-icon theme-icon" name="refresh">
          <label>Retry</label>
        </div>
        <div class="nav-btn colored red" onclick="removeDownload(` + index + `)">
          <img class="nav-btn-icon theme-icon" name="delete">
          <label>Remove</label>
        </div>
      </div>`;
  }

  var container = document.getElementById('sidebar-downloads');
  var dwndls = container.getElementsByClassName('download');
  if (dwndls.length > 0) {
    container.insertBefore(div, dwndls[0]);
  } else {
    container.appendChild(div);
  }

  applyTheme(document.documentElement.style.getPropertyValue('--color-back'));
}

function setDownloadProcess(index, bytes, total, name) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = "Downloading - " + bytesToSize(bytes) + " / " + bytesToSize(total) + " - " + Math.round(percentage(bytes, total)) + "%";

  if (status.value != "process") {
    status.value = "process";
    var buttons = div.getElementsByClassName('download-buttons')[0];
    buttons.innerHTML = `
      <div class="nav-btn orange" onclick="pauseDownload(` + index + `)">
        <img class="nav-btn-icon theme-icon" name="pause">
        <label>Pause</label>
      </div>
      <div class="nav-btn red" onclick="cancelDownload(` + index + `)">
        <img class="nav-btn-icon theme-icon" name="cancel">
        <label>Cancel</label>
      </div>`;
  }

  applyTheme(document.documentElement.style.getPropertyValue('--color-back'));
}

function setDownloadStatusPause(index, bytes, total, name) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = "Pause - " + bytesToSize(bytes) + " / " + bytesToSize(total);

  if (status.value != "pause") {
    status.value = "pause";
    var buttons = div.getElementsByClassName('download-buttons')[0];
    buttons.innerHTML = `
      <div class="nav-btn colored blue" onclick="resumeDownload(` + index + `)">
        <img class="nav-btn-icon theme-icon" name="download">
        <label>Resume</label>
      </div>
      <div class="nav-btn colored red" onclick="cancelDownload(` + index + `)">
        <img class="nav-btn-icon theme-icon" name="cancel">
        <label>Cancel</label>
      </div>`;
  }

  applyTheme(document.documentElement.style.getPropertyValue('--color-back'));
}

function setDownloadStatusDone(index, name, path) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = "Done";

  status.value = "done";

  var buttons = div.getElementsByClassName('download-buttons')[0];
  buttons.innerHTML = `
    <div class="nav-btn colored green" onclick="shell.showItemInFolder('` + path.replace(/\\/g, "/") + `')">
      <img class="nav-btn-icon theme-icon" name="download-folder">
      <label>Folder</label>
    </div>
    <div class="nav-btn colored orange" onclick="shell.openItem('` + path.replace(/\\/g, "/") + `')">
      <img class="nav-btn-icon theme-icon" name="file">
      <label>Open</label>
    </div>
    <div class="nav-btn colored red" onclick="removeDownload(` + index + `)">
      <img class="nav-btn-icon theme-icon" name="delete">
      <label>Remove</label>
    </div>`;

  notif('Download complete', 'success');
}

function setDownloadStatusFailed(index, state, name, link) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = state.charAt(0).toUpperCase() + state.slice(1);;

  status.value = "failed";

  var buttons = div.getElementsByClassName('download-buttons')[0];
  buttons.innerHTML = `
    <div class="nav-btn colored blue" onclick="retryDownload(` + index + `, '` + link + `')">
      <img class="nav-btn-icon theme-icon" name="refresh">
      <label>Retry</label>
    </div>
    <div class="nav-btn colored red" onclick="removeDownload(` + index + `)">
      <img class="nav-btn-icon theme-icon" name="delete">
      <label>Remove</label>
    </div>`;

  notif('Download ' + state + ": " + name, 'error');
}

function setDownloadStatusInterrupted(index, name) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = "Interrupted";

  status.value = "interrupted";

  var buttons = div.getElementsByClassName('download-buttons')[0];
  buttons.innerHTML = `
    <div class="nav-btn colored blue" onclick="resumeDownload(` + index + `)">
      <img class="nav-btn-icon theme-icon" name="download">
      <label>Resume</label>
    </div>
    <div class="nav-btn colored red" onclick="cancelDownload(` + index + `)">
      <img class="nav-btn-icon theme-icon" name="cancel">
      <label>Cancel</label>
    </div>`;

  notif('Download interrupted: ' + name, 'warning');
}

function removeDownload(index) {
  ipcRenderer.send('request-remove-download', index);
  var div = document.getElementById('download-' + index);
  div.parentNode.removeChild(div);
}

function cancelDownload(index) {
  ipcRenderer.send('request-cancel-download', index);
}

function pauseDownload(index) {
  ipcRenderer.send('request-pause-download', index);
}

function resumeDownload(index) {
  ipcRenderer.send('request-resume-download', index);
}

function retryDownload(index, link) {
  removeDownload(index);
  tabGroup.addTab({
    title: 'Retry download',
    src: link,
    active: true
  });
}

function showItemInFolder(path) {
  var fs = require("fs");

  if (fs.existsSync(path)) {
    shell.showItemInFolder(path);
  } else {
    notif("Folder missing", "error");
  }
}

function openItem(path) {
  var fs = require("fs");

  if (fs.existsSync(path)) {
    shell.openItem(path);
  } else {
    notif("File missing", "error");
  }
}

function closeDownloadPanel() {
  document.getElementById("downloads-btn").classList.remove('active');
  document.getElementById("download-panel").style.display = "none";
}

function showDownloadPanel() {
  esc();

  document.getElementById("downloads-btn").classList.add('active');
  document.getElementById("download-panel").style.display = "";
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

// others
function bytesToSize(bytes) {
  var sizes = ['bytes', 'Kb', 'Mb', 'Gb', 'Tb'];
  if (bytes == 0) return '0 Byte';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function percentage(partialValue, totalValue) {
  return (100 * partialValue) / totalValue;
}

// function deleteLoadingOverlay() {
//   document.getElementById('loading-overlay').style.opacity = "0";
//   setTimeout(function () {
//     document.body.removeChild(document.getElementById('loading-overlay'));
//   }, 500);
// }

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
  closeDownloadPanel();
  closeFindPanel();
}

// find in page
function showFindPanel() {
  esc();

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
ipcRenderer.on('action-downloads-showpanel', (event, arg) => {
  showDownloadPanel();
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

// downloads
ipcRenderer.on('action-create-download', (event, arg) => {
  createDownload(arg.index, arg.name, arg.url);
});
ipcRenderer.on('action-create-stopped-download', (event, arg) => {
  createStoppedDownload(arg.index, arg.name, arg.url, arg.path);
});
ipcRenderer.on('action-set-download-status-pause', (event, arg) => {
  setDownloadStatusPause(arg.index, arg.bytes, arg.total, arg.name);
});
ipcRenderer.on('action-set-download-status-done', (event, arg) => {
  setDownloadStatusDone(arg.index, arg.name, arg.path);
});
ipcRenderer.on('action-set-download-status-failed', (event, arg) => {
  setDownloadStatusFailed(arg.index, arg.state, arg.name, arg.url);
});
ipcRenderer.on('action-set-download-status-interrupted', (event, arg) => {
  setDownloadStatusInterrupted(arg.index, arg.name);
});
ipcRenderer.on('action-set-download-process', (event, arg) => {
  setDownloadProcess(arg.index, arg.bytes, arg.total, arg.name);
});
ipcRenderer.on('action-clear-downloads', (event, arg) => {
  var dwnlds = document.getElementsByClassName('download');
  for (var i = 0; i < dwnlds.length; i++) {
    dwnlds[i].parentNode.removeChild(dwnlds[i]);
    i--;
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

  document.getElementById("show-sidebar-btn").addEventListener("click", (e) => {
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

  document.getElementById("bookmarks-btn").addEventListener("click", (e) => {
    goToBookmarksTab();
  });

  document.getElementById("downloads-btn").addEventListener("click", (e) => {
    if (document.getElementById("download-panel").style.display == "none") {
      showDownloadPanel();
    } else {
      closeDownloadPanel();
    }
  });

  document.getElementById("find-input").addEventListener("keyup", function (event) {
    nextFindInPage();
  });

  document.getElementById("close-suggest-btn").addEventListener("click", (e) => {
    removeSuggestions();
  });

  document.getElementsByClassName('etabs-buttons')[0].title = "New tab";
  tabGroup.addTab();
  goToBookmarksTab();

  // deleteLoadingOverlay();
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