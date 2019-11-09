"use strict";

/*
 #####  ######  ####  #    # # #####  ######
 #    # #      #    # #    # # #    # #
 #    # #####  #    # #    # # #    # #####
 #####  #      #  # # #    # # #####  #
 #   #  #      #   #  #    # # #   #  #
 #    # ######  ### #  ####  # #    # ######
*/

const { ipcRenderer } = require("electron");
const dialog = require("electron").remote.dialog;
const ppath = require("persist-path")("Ferny");
const fs = require("fs");
const path = require("path");

const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");
const loadFileFromJsonFolder = require("../modules/loadFileFromJsonFolder.js");
const loadTheme = require("../modules/loadTheme.js");
const applyTheme = require("../modules/applyTheme.js");
const bytesToSize = require("../modules/bytesToSize.js");
const applyWinControls = require("../modules/applyWinControls.js");
const loadLastTabModule = require("../modules/loadLastTab.js");
const loadSearchEngineModule = require("../modules/loadSearchEngine.js");
const loadStartupModule = require("../modules/loadStartup.js");
const loadTabClosedModule = require("../modules/loadTabClosed.js");
const loadWinControlsModule = require("../modules/loadWinControls.js");

/*
 ###### #    # #    #  ####              ##### #    # ###### #    # ######  ####
 #      #    # ##   # #    #               #   #    # #      ##  ## #      #
 #####  #    # # #  # #         #####      #   ###### #####  # ## # #####   ####
 #      #    # #  # # #                    #   #    # #      #    # #           #
 #      #    # #   ## #    #               #   #    # #      #    # #      #    #
 #       ####  #    #  ####                #   #    # ###### #    # ######  ####
*/

function updateTheme() {
  loadTheme().then(({ theme, dark }) => {
    applyTheme(theme, dark);
  });
}

function loadThemesFromFolder() {
  let themesFolder = path.join(__dirname, "..", "themes");
  let themeManager = document.getElementById("theme-manager");

  fs.readdir(themesFolder, (err, files) => {
    loadFileFromJsonFolder(null, "theme").then((data) => {
      let loadedTheme = {
        name: "ferny",
        dark: false
      };
      if(data.toString().length > 0) {
        loadedTheme = JSON.parse(data);
      }

      files.forEach((file) => {
        fs.readFile(path.join(themesFolder, file), (err, data) => {
          let themeObj = JSON.parse(data);

          let fileName = file.split(".")[0];

          let darkValue = (fileName == loadedTheme.name) && loadedTheme.dark;
          let lightValue = "";
          if(darkValue) {
            darkValue = "checked";
            lightValue = "";
          } else {
            darkValue = "";
            lightValue = "checked";
          }
  
          let theme = document.createElement("div");
          theme.classList.add("theme");
          theme.innerHTML = `
            <label class="theme-name">${themeObj.name}</label>
            <label class="theme-description">${themeObj.description}</label><br>
            <img class="theme-image" src="../previews/${themeObj.light.image}" onclick="requestTheme('${fileName}', false)">
            <img class="theme-image" src="../previews/${themeObj.dark.image}" onclick="requestTheme('${fileName}', true)">
            <div class="nav-checkbox">
              <label>Light</label>
              <input id="${fileName}-light-theme-checkbox" type="radio" onclick="requestTheme(this.value, false)" 
                class="checkbox" checked name="theme" value="${fileName}" ${lightValue}>
            </div>
            <div class="nav-checkbox">
              <label>Dark</label>
              <input id="${fileName}-dark-theme-checkbox" type="radio" onclick="requestTheme(this.value, true)" 
                class="checkbox" name="theme" value="${fileName}" ${darkValue}>
            </div>
          `;
  
          themeManager.appendChild(theme);
  
          updateTheme();
        });
      });
    });
  });
}

function requestTheme(theme, dark) {
  let cbName = theme;
  if(dark) {
    cbName += "-dark-theme-checkbox";
  } else {
    cbName += "-light-theme-checkbox"
  }
  let cb = document.getElementById(cbName);
  if(!cb.checked) {
    cb.checked = true;
  }

  saveFileToJsonFolder(null, "theme", JSON.stringify({ name: theme, dark:dark })).then((bool) => {
    ipcRenderer.send("main-updateTheme");
    updateTheme();
  });
}

/*
 ###### #    # #    #  ####              #    # # #    # #####   ####  #    #
 #      #    # ##   # #    #             #    # # ##   # #    # #    # #    #
 #####  #    # # #  # #         #####    #    # # # #  # #    # #    # #    #
 #      #    # #  # # #                  # ## # # #  # # #    # #    # # ## #
 #      #    # #   ## #    #             ##  ## # #   ## #    # #    # ##  ##
 #       ####  #    #  ####              #    # # #    # #####   ####  #    #
*/

function closeWindow() {
  ipcRenderer.send("settings-closeWindow");
}

/*
 ###### #    # #    #  ####               ####  ######   ##   #####   ####  #    #    ###### #    #  ####  # #    # ######
 #      #    # ##   # #    #             #      #       #  #  #    # #    # #    #    #      ##   # #    # # ##   # #
 #####  #    # # #  # #         #####     ####  #####  #    # #    # #      ######    #####  # #  # #      # # #  # #####
 #      #    # #  # # #                       # #      ###### #####  #      #    #    #      #  # # #  ### # #  # # #
 #      #    # #   ## #    #             #    # #      #    # #   #  #    # #    #    #      #   ## #    # # #   ## #
 #       ####  #    #  ####               ####  ###### #    # #    #  ####  #    #    ###### #    #  ####  # #    # ######
*/

function requestSearchEngine(engine) {
  saveFileToJsonFolder(null, "search-engine", engine).then(function(bool) {
    ipcRenderer.send("overlay-setSearchEngine", engine);
    ipcRenderer.send("main-addStatusNotif", { text: `Search engine changed: "${engine}"`, type: "success" });
  });
}

function loadSearchEngine() {
  loadSearchEngineModule().then((searchEngine) => {
    let radios = document.getElementsByName("search-engine");
    for(let i = 0; i < radios.length; i++) {
      if(radios[i].value === searchEngine) {
        radios[i].checked = true;
        break;
      }
    }
  });
}

/*
 ###### #    # #    #  ####              #####   ####  #    # #    # #       ####    ##   #####   ####
 #      #    # ##   # #    #             #    # #    # #    # ##   # #      #    #  #  #  #    # #
 #####  #    # # #  # #         #####    #    # #    # #    # # #  # #      #    # #    # #    #  ####
 #      #    # #  # # #                  #    # #    # # ## # #  # # #      #    # ###### #    #      #
 #      #    # #   ## #    #             #    # #    # ##  ## #   ## #      #    # #    # #    # #    #
 #       ####  #    #  ####              #####   ####  #    # #    # ######  ####  #    # #####   ####
*/

function requestDownloadsFolder(folder) {
  if(folder === "?custom-folder?") {
    folder = document.getElementById("downloads-folder").innerHTML;
  }

  saveFileToJsonFolder("downloads", "downloads-folder", folder).then(function(bool) {
    ipcRenderer.send("main-setDownloadsFolder", folder);
    ipcRenderer.send("main-addStatusNotif", { text: "Downloads folder changed", type: "success" });
  });
}

function chooseDownloadsFolder() {
  ipcRenderer.send("main-chooseDownloadsFolder", document.getElementById("downloads-folder").innerHTML);
}

function loadDownloadsFolder() {
  ipcRenderer.send("main-getDownloadsFolder");
  loadFileFromJsonFolder("downloads", "downloads-folder").then((data) => {
    let folder = data.toString();
    if(folder != "?ask?" && folder != "?downloads?" && folder != "?desktop?" && folder.length > 0) {
      document.getElementById("downloads-folder").innerHTML = folder;
      folder = "?custom-folder?";
    }
    let radios = document.getElementsByName("downloads-folder");
      for(let i = 0; i < radios.length; i++) {
        if(radios[i].value === folder) {
          radios[i].checked = true;
          break;
        }
      }
  });
}

function openDownloadsFolder() {
  ipcRenderer.send("main-openDownloadsFolder");
}

/*
 ###### #    # #    #  ####              #####   ##   #####      ####  #       ####   ####  ###### #####
 #      #    # ##   # #    #               #    #  #  #    #    #    # #      #    # #      #      #    #
 #####  #    # # #  # #         #####      #   #    # #####     #      #      #    #  ####  #####  #    #
 #      #    # #  # # #                    #   ###### #    #    #      #      #    #      # #      #    #
 #      #    # #   ## #    #               #   #    # #    #    #    # #      #    # #    # #      #    #
 #       ####  #    #  ####                #   #    # #####      ####  ######  ####   ####  ###### #####
*/

function requestTabClosed(tabClosed) {
  saveFileToJsonFolder(null, "tabclosed", tabClosed).then(function(bool) {
    ipcRenderer.send("tabManager-setTabClosedAction", tabClosed);
    ipcRenderer.send("main-addStatusNotif", { text: "Active tab closed action changed", type: "success" });
  });
}

function loadTabClosed() {
  loadTabClosedModule().then((tabClosed) => {
    let radios = document.getElementsByName("tabclosed");
    for(let i = 0; i < radios.length; i++) {
      if(radios[i].value === tabClosed) {
        radios[i].checked = true;
        break;
      }
    }
  });
}

/*
 ###### #    # #    #  ####              #        ##    ####  #####    #####   ##   #####
 #      #    # ##   # #    #             #       #  #  #        #        #    #  #  #    #
 #####  #    # # #  # #         #####    #      #    #  ####    #        #   #    # #####
 #      #    # #  # # #                  #      ######      #   #        #   ###### #    #
 #      #    # #   ## #    #             #      #    # #    #   #        #   #    # #    #
 #       ####  #    #  ####              ###### #    #  ####    #        #   #    # #####
*/

function requestLastTab(lastTab) {
  saveFileToJsonFolder(null, "lasttab", lastTab).then(function(bool) {
    ipcRenderer.send("main-addStatusNotif", { text: "Last tab closed action changed", type: "success" });
  });
}

function loadLastTab() {
  loadLastTabModule().then((lastTab) => {
    let radios = document.getElementsByName("lasttab");
    for(let i = 0; i < radios.length; i++) {
      if(radios[i].value === lastTab) {
        radios[i].checked = true;
        break;
      }
    }
  });
}

/*
 ###### #    # #    #  ####               ####  #####   ##   #####  ##### #    # #####
 #      #    # ##   # #    #             #        #    #  #  #    #   #   #    # #    #
 #####  #    # # #  # #         #####     ####    #   #    # #    #   #   #    # #    #
 #      #    # #  # # #                       #   #   ###### #####    #   #    # #####
 #      #    # #   ## #    #             #    #   #   #    # #   #    #   #    # #
 #       ####  #    #  ####               ####    #   #    # #    #   #    ####  #
*/

function requestStartup(startup) {
  saveFileToJsonFolder(null, "startup", startup).then(() => {
    ipcRenderer.send("main-addStatusNotif", { text: "Startup action changed", type: "success" });
  });
}

function loadStartup() {
  loadStartupModule().then((startup) => {
    let radios = document.getElementsByName("startup");
    for(let i = 0; i < radios.length; i++) {
      if(radios[i].value === startup) {
        radios[i].checked = true;
        break;
      }
    }
  });
}

/*
 ###### #    # #    #  ####              #    #  ####  #    # ######    #####    ##    ####  ######
 #      #    # ##   # #    #             #    # #    # ##  ## #         #    #  #  #  #    # #
 #####  #    # # #  # #         #####    ###### #    # # ## # #####     #    # #    # #      #####
 #      #    # #  # # #                  #    # #    # #    # #         #####  ###### #  ### #
 #      #    # #   ## #    #             #    # #    # #    # #         #      #    # #    # #
 #       ####  #    #  ####              #    #  ####  #    # ######    #      #    #  ####  ######
*/

function loadHomePage() {
  loadFileFromJsonFolder(null, "home").then((data) => {
    let Data = JSON.parse(data);
    document.getElementById("home-page-input").value = Data.url;
    if(Data.on === 1) {
      document.getElementById("home-page-checkbox").checked = true;
    }
  });
}

function saveHomePage() {
  var url = document.getElementById("home-page-input").value;
  var on = document.getElementById("home-page-checkbox").checked;

  if(url.length <= 0) {
    ipcRenderer.send("main-addStatusNotif", { text: "First enter the home page URL", type: "warning" });
  } else {
    if(on) {
      on = 1;
    } else {
      on = 0;
    }
  
    saveFileToJsonFolder(null, "home", JSON.stringify({ url, on })).then(() => {
      ipcRenderer.send("main-addStatusNotif", { text: `Home page saved: "` + url + `"`, type: "success" });
      ipcRenderer.send("tabManager-setHomePage", { url, on });
    });
  }
}

function useHomePage(url) {
  document.getElementById("home-page-input").value = url;
  saveHomePage();
}

/*
 ###### #    # #    #  ####               ####  #      ######   ##   #####     #####    ##   #####   ##
 #      #    # ##   # #    #             #    # #      #       #  #  #    #    #    #  #  #    #    #  #
 #####  #    # # #  # #         #####    #      #      #####  #    # #    #    #    # #    #   #   #    #
 #      #    # #  # # #                  #      #      #      ###### #####     #    # ######   #   ######
 #      #    # #   ## #    #             #    # #      #      #    # #   #     #    # #    #   #   #    #
 #       ####  #    #  ####               ####  ###### ###### #    # #    #    #####  #    #   #   #    #
*/

function clearBrowsingData() {
  var clearCache = document.getElementById("clear-cache-checkbox").checked;
  var clearStorage = document.getElementById("clear-storage-checkbox").checked;
  if(!clearCache && !clearStorage) {
    ipcRenderer.send("main-addStatusNotif", { text: "First check something", type: "error" });
  } else {
    let Data = {
      cache: clearCache,
      storage: clearStorage
    };
  
    ipcRenderer.send("request-clear-browsing-data", Data);
  }
}

/*
 ###### #    # #    #  ####              #    # # #    #     ####   ####  #    # ##### #####   ####  #       ####
 #      #    # ##   # #    #             #    # # ##   #    #    # #    # ##   #   #   #    # #    # #      #
 #####  #    # # #  # #         #####    #    # # # #  #    #      #    # # #  #   #   #    # #    # #       ####
 #      #    # #  # # #                  # ## # # #  # #    #      #    # #  # #   #   #####  #    # #           #
 #      #    # #   ## #    #             ##  ## # #   ##    #    # #    # #   ##   #   #   #  #    # #      #    #
 #       ####  #    #  ####              #    # # #    #     ####   ####  #    #   #   #    #  ####  ######  ####
*/

function requestWinControls(bool) {
  saveFileToJsonFolder(null, "wincontrols", JSON.stringify({ systemTitlebar: bool })).then(() => {
    if(bool) {
      ipcRenderer.send("main-addStatusNotif", { text: "System titlebar turned on", type: "success" });
    } else {
      ipcRenderer.send("main-addStatusNotif", { text: "System titlebar turned off", type: "info" });
    }
  });
}

/*
 ###### #    # #    #  ####               ####    ##   ##### ######  ####   ####  #####  # ######  ####
 #      #    # ##   # #    #             #    #  #  #    #   #      #    # #    # #    # # #      #
 #####  #    # # #  # #         #####    #      #    #   #   #####  #      #    # #    # # #####   ####
 #      #    # #  # # #                  #      ######   #   #      #  ### #    # #####  # #           #
 #      #    # #   ## #    #             #    # #    #   #   #      #    # #    # #   #  # #      #    #
 #       ####  #    #  ####               ####  #    #   #   ######  ####   ####  #    # # ######  ####
*/

function showCategory(id) {
  let containers = document.getElementsByClassName("container");
  let buttons = document.getElementById("sidebar").getElementsByClassName("nav-btn");
  for(let i = 0; i < containers.length; i++) {
    if(containers[i].id === id) {
      containers[i].classList.add("active");
      buttons[i].classList.add("active");
    } else {
      containers[i].classList.remove("active");
      buttons[i].classList.remove("active");
    }
  }
}

/*
 # #####   ####               ####    ##    ####  #    # ######
 # #    # #    #             #    #  #  #  #    # #    # #
 # #    # #         #####    #      #    # #      ###### #####
 # #####  #                  #      ###### #      #    # #
 # #      #    #             #    # #    # #    # #    # #
 # #       ####               ####  #    #  ####  #    # ######
*/

ipcRenderer.on("action-set-cache-size", (event, arg) => {
  document.getElementById("cache-size-label").innerHTML = "Cache size: " + bytesToSize(arg.cacheSize);
});

/*
 # #####   ####              #    # # #    # #####   ####  #    #
 # #    # #    #             #    # # ##   # #    # #    # #    #
 # #    # #         #####    #    # # # #  # #    # #    # #    #
 # #####  #                  # ## # # #  # # #    # #    # # ## #
 # #      #    #             ##  ## # #   ## #    # #    # ##  ##
 # #       ####              #    # # #    # #####   ####  #    #
*/

ipcRenderer.on("window-blur", (event) => {
  document.getElementById("titlebar").classList.add("blur");
});

ipcRenderer.on("window-focus", (event) => {
  document.getElementById("titlebar").classList.remove("blur");
});

/*
 # #####   ####               ####  ###### ##### ##### # #    #  ####   ####
 # #    # #    #             #      #        #     #   # ##   # #    # #
 # #    # #         #####     ####  #####    #     #   # # #  # #       ####
 # #####  #                       # #        #     #   # #  # # #  ###      #
 # #      #    #             #    # #        #     #   # #   ## #    # #    #
 # #       ####               ####  ######   #     #   # #    #  ####   ####
*/

ipcRenderer.on("settings-setDownloadsFolder", (event, path) => {
  document.getElementById("downloads-folder").innerHTML = path;
  if(document.getElementById("custom-folder-radio").checked) {
    requestDownloadsFolder("?custom-folder?");
  }
});

ipcRenderer.on("settings-showCategory", (event, categoryId) => {
  if(categoryId) {
    showCategory(categoryId);
  }
});

/*
 # #    # # #####
 # ##   # #   #
 # # #  # #   #
 # #  # # #   #
 # #   ## #   #
 # #    # #   #
*/

function init() {
  loadWinControlsModule().then((winControls) => {
    applyWinControls(winControls.systemTitlebar, "only-close");
    document.getElementById("system-titlebar-checkbox").checked = winControls.systemTitlebar;
  });

  updateTheme();

  loadThemesFromFolder();

  loadHomePage();
  loadSearchEngine();
  loadStartup();
  loadTabClosed();
  loadLastTab();
  loadDownloadsFolder();

  ipcRenderer.send("request-set-cache-size");
}

document.onkeyup = function(e) {
  if (e.which == 27) {
    closeWindow();
  } 
};

document.onreadystatechange = () => {
  if (document.readyState === "complete") {
      init();
  }
};

/*
 ##### #    # ######    ###### #    # #####
   #   #    # #         #      ##   # #    #
   #   ###### #####     #####  # #  # #    #
   #   #    # #         #      #  # # #    #
   #   #    # #         #      #   ## #    #
   #   #    # ######    ###### #    # #####
*/