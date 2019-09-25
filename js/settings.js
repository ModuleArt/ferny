/*
 #####  ######  ####  #    # # #####  ######
 #    # #      #    # #    # # #    # #
 #    # #####  #    # #    # # #    # #####
 #####  #      #  # # #    # # #####  #
 #   #  #      #   #  #    # # #   #  #
 #    # ######  ### #  ####  # #    # ######
*/

const { ipcRenderer } = require("electron");
const ppath = require("persist-path")("Ferny");
const fs = require("fs");
const path = require("path");

const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");
const loadFileFromJsonFolder = require("../modules/loadFileFromJsonFolder.js");
const loadTheme = require("../modules/loadTheme.js");
const applyTheme = require("../modules/applyTheme.js");
const bytesToSize = require("../modules/bytesToSize.js");

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

function loadThemesFromFolder() {
  let themesFolder = path.join(__dirname, "..", "themes");
  let themeManager = document.getElementById("theme-manager");

  fs.readdir(themesFolder, (err, files) => {
    files.forEach(file => {
      fs.readFile(path.join(themesFolder, file), function(err, data) {
        let themeObj = JSON.parse(data);

        let theme = document.createElement("div");
        theme.classList.add("theme");
        theme.style.borderRadius = "calc(" + themeObj.pxRadius + " + 4px)";
        theme.innerHTML = `
          <div>
            <label>` + themeObj.name + `</label>
            <span>` + themeObj.type + `</span>
            <img src='../imgs/theme-icons/` + themeObj.icons + `/theme-16.png'>
          </div>
          <button class='nav-btn' onclick="requestTheme('` + file.split(".")[0] + `')">
            <img name='check-16' class='theme-icon'>
            <label>Apply</label>
          </button>`;

        let div = theme.getElementsByTagName("div")[0];
        div.style.backgroundColor = themeObj.colorBack;
        div.style.borderRadius = "calc(" + themeObj.pxRadius + " + 4px)";
        div.style.border = "1px solid " + themeObj.colorBorder;

        let label = div.getElementsByTagName("label")[0];
        label.style.color = themeObj.colorTop;
        label.style.backgroundColor = themeObj.colorElement;
        label.style.border = "1px solid " + themeObj.colorBorder;
        label.style.borderRadius = themeObj.pxRadius;

        let span = div.getElementsByTagName("span")[0];
        span.style.color = themeObj.colorTop;
        span.style.backgroundColor = themeObj.colorSecond;
        span.style.border = "1px solid " + themeObj.colorBorder;
        span.style.borderRadius = themeObj.pxRadius;
        span.style.boxShadow = themeObj.shadowFocus;

        let img = div.getElementsByTagName("img")[0];
        img.style.opacity = themeObj.opacityOver;

        themeManager.appendChild(theme);

        updateTheme();
      });
    });
  });
}

function requestTheme(theme) {
  saveFileToJsonFolder(null, "theme", theme).then(function(bool) {
    loadTheme(theme).then(function(themeObj) {
      ipcRenderer.send("request-change-theme", themeObj);
      applyTheme(themeObj);
    });
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
    ipcRenderer.send("request-add-status-notif", { text: "Startup action changed", type: "success" });
  });
}

function loadStartup() {
  loadFileFromJsonFolder(null, "startup").then((data) => {
    let startup = data.toString();
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
    ipcRenderer.send("request-add-status-notif", { text: "First enter the home page URL", type: "warning" });
  } else {
    if(on) {
      on = 1;
    } else {
      on = 0;
    }
  
    saveFileToJsonFolder(null, "home", JSON.stringify({ url, on })).then(function() {
      ipcRenderer.send("request-add-status-notif", { text: `Home page saved: "` + url + `"`, type: "success" });

      ipcRenderer.send("tabManager-setHomePage", { url, on });
    });
  }
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
    ipcRenderer.send("request-add-status-notif", { text: "First check something", type: "error" });
  } else {
    let Data = {
      cache: clearCache,
      storage: clearStorage
    };
  
    ipcRenderer.send("request-clear-browsing-data", Data);
  }
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
 # #    # # #####
 # ##   # #   #
 # # #  # #   #
 # #  # # #   #
 # #   ## #   #
 # #    # #   #
*/

function init() {
  updateTheme();

  loadThemesFromFolder();

  loadHomePage();
  loadStartup();

  ipcRenderer.send("request-set-cache-size");
}

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