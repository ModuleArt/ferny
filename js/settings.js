/*
.##.....##....###....####.##....##
.###...###...##.##....##..###...##
.####.####..##...##...##..####..##
.##.###.##.##.....##..##..##.##.##
.##.....##.#########..##..##..####
.##.....##.##.....##..##..##...###
.##.....##.##.....##.####.##....##
*/

const { ipcRenderer } = require('electron');
const ppath = require('persist-path')('Ferny');
const fs = require("fs");
const path = require("path");

/*
.##.....##..#######..########..##.....##.##.......########..######.
.###...###.##.....##.##.....##.##.....##.##.......##.......##....##
.####.####.##.....##.##.....##.##.....##.##.......##.......##......
.##.###.##.##.....##.##.....##.##.....##.##.......######....######.
.##.....##.##.....##.##.....##.##.....##.##.......##.............##
.##.....##.##.....##.##.....##.##.....##.##.......##.......##....##
.##.....##..#######..########...#######..########.########..######.
*/

const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");
const loadTheme = require("../modules/loadTheme.js");
const applyTheme = require("../modules/applyTheme.js");
const loadWinControls = require("../modules/loadWinControls.js");

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

function changeWinControls() {
  var frame = document.getElementById('system-titlebar-checkbox').checked;
  var autoHide = document.getElementById('autohide-menubar-checkbox').checked;
  var colorTabs = document.getElementById('color-tabs-checkbox').checked;

  let Data = {
    frame: frame,
    hideMenu: autoHide,
    color: colorTabs
  };

  saveFileToJsonFolder('wincontrols', JSON.stringify(Data));

  ipcRenderer.send('request-set-color-tabs', Data.color);
}

function requestLastTab(lastTab) {
  saveFileToJsonFolder('lasttab', lastTab);
}

function requestBookmarksBar(on, layout) {
  if(on != null) {
    if(on) {
      on = 1;
    } else {
      on = 0;
    }
  }

  let Data = {
    on: on,
    layout: layout
  };

  ipcRenderer.send('request-set-bookmarks-bar', Data);
}

function scrollToId(id) {
  document.getElementById(id).scrollIntoView({
	  	behavior: 'smooth'
	});
}

function requestSearchEngine(engine) {
  ipcRenderer.send('request-set-search-engine', engine);
}

function loadThemesFromFolder() {
  let themesFolder = path.join(__dirname, "..", "themes");
  let themeManager = document.getElementById('theme-manager');

  fs.readdir(themesFolder, (err, files) => {
    files.forEach(file => {
      fs.readFile(path.join(themesFolder, file), function(err, data) {
        let themeObj = JSON.parse(data);

        let theme = document.createElement('div');
        theme.classList.add('theme');
        theme.style.borderRadius = 'calc(' + themeObj.pxRadius + ' + 4px);'
        theme.innerHTML = `
          <div>
            <label>` + themeObj.name + `</label><br>
            <span>` + themeObj.type + `</span>
            <img src='../imgs/theme-icons/` + themeObj.icons + `/theme-16.png'>
          </div>
          <button class='nav-btn' onclick="requestTheme('` + file.split(".")[0] + `')">
            <img name='check-16' class='theme-icon'>
            <label>Apply</label>
          </button>`;

        let div = theme.getElementsByTagName('div')[0];
        div.style.backgroundColor = themeObj.colorBack;
        div.style.borderRadius = "calc(" + themeObj.pxRadius + " + 4px)";
        div.style.border = "1px solid " + themeObj.colorBorder;

        let label = div.getElementsByTagName('label')[0];
        label.style.color = themeObj.colorTop;
        label.style.backgroundColor = themeObj.colorElement;
        label.style.border = "1px solid " + themeObj.colorBorder;
        label.style.borderRadius = themeObj.pxRadius;

        let span = div.getElementsByTagName('span')[0];
        span.style.color = themeObj.colorTop;
        span.style.backgroundColor = themeObj.colorSecond;
        span.style.border = "1px solid " + themeObj.colorBorder;
        span.style.borderRadius = themeObj.pxRadius;
        span.style.boxShadow = themeObj.shadowFocus;

        let img = div.getElementsByTagName('img')[0];
        img.style.opacity = themeObj.opacityOver;

        themeManager.appendChild(theme);

        updateTheme();
      });
    });
  });
}

function requestTheme(theme) {
  saveFileToJsonFolder('theme', theme).then(function(bool) {
    loadTheme(theme).then(function(themeObj) {
      ipcRenderer.send('request-change-theme', themeObj);
      applyTheme(themeObj);
    });
  });
}

function changeWelcome(bool) {
  if(bool) {
    saveFileToJsonFolder('welcome', 1);
  } else {
    saveFileToJsonFolder('welcome', 0);
  }
}

function loadStartPage() {
  try {
    fs.readFile(ppath + "/json/startpage.json", function(err, data) {
      document.getElementById('start-page-input').value = data;
    });
  } catch (e) {

  }
}

function loadHomePage() {
  try {
    fs.readFile(ppath + "/json/home.json", function(err, data) {
      let Data = JSON.parse(data);
      document.getElementById('home-page-input').value = Data.url;
      if(Data.on == 1) {
        document.getElementById('home-page-checkbox').checked = true;
      }
    });    
  } catch (e) {

  }
}

function saveHomePage() {
  var url = document.getElementById('home-page-input').value;
  var on = document.getElementById('home-page-checkbox').checked;

  if(url.length <= 0) {
    notif("First enter the home page URL", "warning");
  } else {
    if(on) {
      on = 1;
    } else {
      on = 0;
    }
  
    saveFileToJsonFolder('home', JSON.stringify({ url: url, on: on })).then(function() {
      notif("Home page saved", "success");

      ipcRenderer.send('request-update-home-page');
    });
  }
}

function loadSearchEngine() {
  try {
    fs.readFile(ppath + "/json/searchengine.json", function(err, data) {
      var radios = document.getElementsByName("search-engine");
      for(var i = 0; i < radios.length; i++) {
        if(radios[i].value == data) {
          radios[i].checked = true;
          break;
        }
      }
    });
  } catch (e) {

  }
}

function showWelcomeScreen() {
  ipcRenderer.send("request-show-welcome-screen");
}

function saveStartPage() {
  var startPage = document.getElementById('start-page-input').value;

  saveFileToJsonFolder('startpage', startPage).then(function() {
    notif("New tab page saved: " + startPage, "success");

    ipcRenderer.send('request-set-start-page', startPage);
  });
}

function notif(text, type) {
  let Data = {
    text: text,
    type: type
  };
  ipcRenderer.send('request-add-status-notif', Data)
}

function moreInfo(btn) {
  btn.classList.toggle('active');
  btn.nextElementSibling.classList.toggle('active');
}

function loadWelcome() {
  try {
    var welcomeOn = fs.readFileSync(ppath + "/json/welcome.json");
    if(welcomeOn == 1) {
      document.getElementById('welcome-checkbox').checked = true;
    } else {
      document.getElementById('welcome-checkbox').checked = false;
    }
  } catch (e) {

  }
}

function loadBookmarksBar() {
  try {
    var jsonstr = fs.readFileSync(ppath + "/json/bookmarksbar.json");
    let Data = JSON.parse(jsonstr);

    if(Data.on) {
      document.getElementById('bookmarks-bar-checkbox').checked = true;
    }

    var radios = document.getElementsByName("bbar-layout");
    for(var i = 0; i < radios.length; i++) {
      if(radios[i].value == Data.layout) {
        radios[i].checked = true;
        break;
      }
    }
  } catch (e) {

  }
}

function loadLastTab() {
  var lastTab = "new-tab";
  
  try {
    lastTab = fs.readFileSync(ppath + "/json/lasttab.json");
  } catch (e) {
    saveFileToJsonFolder("lasttab", lastTab);
  }
  
  var radios = document.getElementsByName("last-tab");
  for(var i = 0; i < radios.length; i++) {
    if(radios[i].value == lastTab) {
      radios[i].checked = true;
      break;
    }
  }
}

function loadCache() {
  ipcRenderer.send('request-set-cache-size');
}

function bytesToSize(bytes) {
  var sizes = ['bytes', 'Kb', 'Mb', 'Gb', 'Tb'];
  if (bytes == 0) return '0 Byte';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function clearBrowsingData() {
  var clearCache = document.getElementById('clear-cache-checkbox').checked;
  var clearStorage = document.getElementById('clear-storage-checkbox').checked;
  if(!clearCache && !clearStorage) {
    notif("First check something", "warning")
  } else {
    let Data = {
      cache: clearCache,
      storage: clearStorage
    };
  
    ipcRenderer.send('request-clear-browsing-data', Data);
  }
}

function setStartPageLikeHomePage() {
  try {
    var jsonstr = fs.readFileSync(ppath + "/json/home.json");
    Data = JSON.parse(jsonstr);
    document.getElementById('start-page-input').value = Data.url;
  } catch (e) {

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

ipcRenderer.on('action-set-cache-size', (event, arg) => {
  document.getElementById('cache-size-label').innerHTML = "Cache size: " + bytesToSize(arg.cacheSize);
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
  updateTheme();

  loadThemesFromFolder();
  
  loadBookmarksBar();
  loadStartPage();
  loadHomePage();
  loadSearchEngine();
  loadCache();
  loadLastTab();
  loadWelcome();

  var winControls = loadWinControls();
  document.getElementById('system-titlebar-checkbox').checked = winControls.frame;
  document.getElementById('autohide-menubar-checkbox').checked = winControls.hideMenu;
  document.getElementById('color-tabs-checkbox').checked = winControls.color;
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