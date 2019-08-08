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
const isDarkColor = require("is-dark-color");

/*
.########.##.....##.##....##..######..########.####..#######..##....##..######.
.##.......##.....##.###...##.##....##....##.....##..##.....##.###...##.##....##
.##.......##.....##.####..##.##..........##.....##..##.....##.####..##.##......
.######...##.....##.##.##.##.##..........##.....##..##.....##.##.##.##..######.
.##.......##.....##.##..####.##..........##.....##..##.....##.##..####.......##
.##.......##.....##.##...###.##....##....##.....##..##.....##.##...###.##....##
.##........#######..##....##..######.....##....####..#######..##....##..######.
*/

function openLicenseFile() {
  ipcRenderer.send('request-open-license-file');
}

function changeBorderRadius(size) {
  document.documentElement.style.setProperty('--px-radius', size + 'px');
}

function loadBorderRadius() {
  try {
    var borderRadius = fs.readFileSync(ppath + "\\json\\radius.json");
    changeBorderRadius(borderRadius);

    var radios = document.getElementsByName("border-radius");
    for(var i = 0; i < radios.length; i++) {
      if(radios[i].value == borderRadius) {
        radios[i].checked = true;
      }
    }
  } catch (e) {

  }
}

function loadAbout() {
  document.getElementById('about-electron').innerHTML = "Electron: v" + process.versions.electron;
  document.getElementById('about-chrome').innerHTML = "Chrome: v" + process.versions.chrome;
  document.getElementById('about-node').innerHTML = "Node: " + process.version;

  ipcRenderer.send('request-set-about');
}

function changeTheme(color) {
  // document.body.style.backgroundColor = color;

  if(isDarkColor(color)) {
    setIconsStyle('light');

    document.documentElement.style.setProperty('--color-top', 'white');
    document.documentElement.style.setProperty('--color-over', 'rgba(0, 0, 0, 0.3)');
  } else {
    setIconsStyle('dark');

    document.documentElement.style.setProperty('--color-top', 'black');
    document.documentElement.style.setProperty('--color-over', 'rgba(0, 0, 0, 0.1)');
  }
}

function setIconsStyle(str) {
  var icons = document.getElementsByClassName('theme-icon');

  for(var i = 0; i < icons.length; i++) {
    icons[i].src = "../themes/" + str + "/icons/" + icons[i].name + ".png";
  }
}

function loadTheme() {
  try {
    var themeColor = fs.readFileSync(ppath + "\\json\\theme.json");
    changeTheme(themeColor);
  } catch (e) {

  }
}

function openIssuesPage() {
  ipcRenderer.send('request-open-url-in-new-tab', "https://github.com/ModuleArt/ferny/issues");
}

function openDonatePage() {
  ipcRenderer.send('request-open-url-in-new-tab', "https://www.patreon.com/moduleart");
}

function openDeveloperPage() {
  ipcRenderer.send('request-open-url-in-new-tab', "https://moduleart.github.io/");
}

function openAppPage() {
  ipcRenderer.send('request-open-url-in-new-tab', "https://moduleart.github.io/ferny");
}

function openReleasesPage() {
  ipcRenderer.send('request-open-url-in-new-tab', "https://github.com/ModuleArt/ferny/releases");
}

function openPlannerPage() {
  ipcRenderer.send('request-open-url-in-new-tab', "https://trello.com/b/cb5lXUgS/ferny");
}

function openSourcePage() {
  ipcRenderer.send('request-open-url-in-new-tab', "https://github.com/ModuleArt/ferny");
}

function openElectronPage() {
  ipcRenderer.send('request-open-url-in-new-tab', "https://electronjs.org/releases");
}

function openChromePage() {
  ipcRenderer.send('request-open-url-in-new-tab', "https://chromereleases.googleblog.com");
}

function openNodePage() {
  ipcRenderer.send('request-open-url-in-new-tab', "https://nodejs.org/en/download/releases");
}

function checkForUpdates() {
  ipcRenderer.send('request-check-for-updates');
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

ipcRenderer.on('action-set-about', (event, arg) => {
  document.getElementById('about-app').innerHTML = "v" + arg.version + " / " + arg.arch + " / " + arg.platform;
});

ipcRenderer.on('action-load-theme', (event, arg) => {
  loadTheme();
});

ipcRenderer.on('action-load-border-radius', (event, arg) => {
  loadBorderRadius();
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
  loadTheme();
  loadAbout();
  loadBorderRadius();
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