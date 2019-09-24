/*
.##.....##....###....####.##....##
.###...###...##.##....##..###...##
.####.####..##...##...##..####..##
.##.###.##.##.....##..##..##.##.##
.##.....##.#########..##..##..####
.##.....##.##.....##..##..##...###
.##.....##.##.....##.####.##....##
*/

const { ipcRenderer } = require("electron");

/*
.##.....##..#######..########..##.....##.##.......########..######.
.###...###.##.....##.##.....##.##.....##.##.......##.......##....##
.####.####.##.....##.##.....##.##.....##.##.......##.......##......
.##.###.##.##.....##.##.....##.##.....##.##.......######....######.
.##.....##.##.....##.##.....##.##.....##.##.......##.............##
.##.....##.##.....##.##.....##.##.....##.##.......##.......##....##
.##.....##..#######..########...#######..########.########..######.
*/

const loadTheme = require("../modules/loadTheme.js");
const applyTheme = require("../modules/applyTheme.js");

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
  ipcRenderer.send("tabManager-addTab", "file://" + __dirname + "/../LICENSE", true);
}

function loadAbout() {
  document.getElementById("about-electron").innerHTML = "Electron: v" + process.versions.electron;
  document.getElementById("about-chrome").innerHTML = "Chrome: v" + process.versions.chrome;
  document.getElementById("about-node").innerHTML = "Node: " + process.version;

  ipcRenderer.send("request-set-about");
}

function openIssuesPage() {
  ipcRenderer.send("tabManager-addTab", "https://github.com/ModuleArt/ferny/issues", true);
}

function openDonatePage() {
  ipcRenderer.send("tabManager-addTab", "https://www.patreon.com/moduleart", true);
}

function openDeveloperPage() {
  ipcRenderer.send("tabManager-addTab", "https://moduleart.github.io/", true);
}

function openAppPage() {
  ipcRenderer.send("tabManager-addTab", "https://moduleart.github.io/ferny", true);
}

function openReleasesPage() {
  ipcRenderer.send("tabManager-addTab", "https://github.com/ModuleArt/ferny/releases", true);
}

function openPlannerPage() {
  ipcRenderer.send("tabManager-addTab", "https://trello.com/b/cb5lXUgS/ferny", true);
}

function openSourcePage() {
  ipcRenderer.send("tabManager-addTab", "https://github.com/ModuleArt/ferny", true);
}

function openElectronPage() {
  ipcRenderer.send("tabManager-addTab", "https://electronjs.org/releases", true);
}

function openChromePage() {
  ipcRenderer.send("tabManager-addTab", "https://chromereleases.googleblog.com", true);
}

function openNodePage() {
  ipcRenderer.send("tabManager-addTab", "https://nodejs.org/en/download/releases", true);
}

function checkForUpdates() {
  ipcRenderer.send("request-check-for-updates");
}

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
.####.########...######.....########..########.##....##.########..########.########..########.########.
..##..##.....##.##....##....##.....##.##.......###...##.##.....##.##.......##.....##.##.......##.....##
..##..##.....##.##..........##.....##.##.......####..##.##.....##.##.......##.....##.##.......##.....##
..##..########..##..........########..######...##.##.##.##.....##.######...########..######...########.
..##..##........##..........##...##...##.......##..####.##.....##.##.......##...##...##.......##...##..
..##..##........##....##....##....##..##.......##...###.##.....##.##.......##....##..##.......##....##.
.####.##.........######.....##.....##.########.##....##.########..########.##.....##.########.##.....##
*/

ipcRenderer.on("action-set-about", (event, arg) => {
  document.getElementById("about-app").innerHTML = "Beta v" + arg.version + "<br>" + arg.platform + " / " + arg.arch;
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

  loadAbout();
}

document.onreadystatechange = () => {
  if (document.readyState === "complete") {
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