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

/*
.########.##.....##.##....##..######..########.####..#######..##....##..######.
.##.......##.....##.###...##.##....##....##.....##..##.....##.###...##.##....##
.##.......##.....##.####..##.##..........##.....##..##.....##.####..##.##......
.######...##.....##.##.##.##.##..........##.....##..##.....##.##.##.##..######.
.##.......##.....##.##..####.##..........##.....##..##.....##.##..####.......##
.##.......##.....##.##...###.##....##....##.....##..##.....##.##...###.##....##
.##........#######..##....##..######.....##....####..#######..##....##..######.
*/

function requestTheme(color) {
  changeTheme(color);
  ipcRenderer.send('request-change-theme', color);
}

function requestBorderRadius(size) {
  changeBorderRadius(size);
  ipcRenderer.send('request-change-border-radius', size);
}

function changeTheme(color) {
  document.body.style.backgroundColor = color;

  if(checkIfDark(color)) {
    setIconsStyle('light');

    document.documentElement.style.setProperty('--color-top', 'white');
    document.documentElement.style.setProperty('--color-over', 'rgba(0, 0, 0, 0.3)');
  } else {
    setIconsStyle('dark');

    document.documentElement.style.setProperty('--color-top', 'black');
    document.documentElement.style.setProperty('--color-over', 'rgba(0, 0, 0, 0.15)');
  }
}

function setIconsStyle(str) {
  var icons = document.getElementsByClassName('theme-icon');

  for(var i = 0; i < icons.length; i++) {
    icons[i].src = "../themes/" + str + "/icons/" + icons[i].name + ".png";
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

function changeBorderRadius(size) {
  document.documentElement.style.setProperty('--px-radius', size + 'px');
}

function loadTheme() {
  var fs = require("fs");
  var ppath = require('persist-path')('ArrowBrowser');

  try {
    var themeColor = fs.readFileSync(ppath + "\\json\\theme.json");
    changeTheme(themeColor);
  } catch (e) {

  }
}

function loadBorderRadius() {
  var fs = require("fs");
  var ppath = require('persist-path')('ArrowBrowser');

  try {
    var borderRadius = fs.readFileSync(ppath + "\\json\\radius.json");
    changeBorderRadius(borderRadius);
  } catch (e) {

  }
}

// tabs
function chooseSlide(dot) {
  var dots = document.getElementsByClassName('dot');
  var tabs = document.getElementsByClassName('tab');

  for(var i = 0; i < dots.length; i++) {
    if(dots[i] == dot) {
      dots[i].classList.add('active');
      tabs[i].classList.add('active');

      if(i == 0) {
        document.getElementById('prev-btn').classList.add('disable');
      } else {
        document.getElementById('prev-btn').classList.remove('disable');
      }
      if(i == dots.length - 1) {
        document.getElementById('next-btn').classList.add('disable');
      } else {
        document.getElementById('next-btn').classList.remove('disable');
      }
    } else {
      dots[i].classList.remove('active');
      tabs[i].classList.remove('active');
    }
  }
}

function nextSlide() {
  var dots = document.getElementsByClassName('dot');
  var tabs = document.getElementsByClassName('tab');

  for(var i = 0; i < dots.length - 1; i++) {
    document.getElementById('prev-btn').classList.remove('disable');

    if(dots[i].classList.contains('active')) {
      dots[i].classList.remove('active');
      tabs[i].classList.remove('active');
      dots[i + 1].classList.add('active');
      tabs[i + 1].classList.add('active');

      if(i == dots.length - 2) {
        document.getElementById('next-btn').classList.add('disable');
      } else {
        document.getElementById('next-btn').classList.remove('disable');
      }

      break;
    }
  }
}

function prevSlide() {
  var dots = document.getElementsByClassName('dot');
  var tabs = document.getElementsByClassName('tab');

  for(var i = 1; i < dots.length; i++) {
    document.getElementById('next-btn').classList.remove('disable');

    if(dots[i].classList.contains('active')) {
      dots[i].classList.remove('active');
      tabs[i].classList.remove('active');
      dots[i - 1].classList.add('active');
      tabs[i - 1].classList.add('active');

      if(i == 1) {
        document.getElementById('prev-btn').classList.add('disable');
      } else {
        document.getElementById('prev-btn').classList.remove('disable');
      }

      break;
    }
  }
}

// window
function closeWindow() {
  ipcRenderer.send('request-close-welcome');
}

function moreSettings() {
  closeWindow();
  ipcRenderer.send('request-open-settings');
}

// welcome
function finishWelcome() {
  changeWelcome(document.getElementById('welcome-checkbox').checked);
  closeWindow();
}

function changeWelcome(bool) {
  var fs = require('fs');
  var ppath = require('persist-path')('ArrowBrowser');

  if(bool) {
    fs.writeFileSync(ppath + "\\json\\welcome.json", 1);
  } else {
    fs.writeFileSync(ppath + "\\json\\welcome.json", 0);
  }
}

function openAppPage() {
  ipcRenderer.send('request-open-url-in-new-tab', "https://moduleart.github.io/arrowbrowser");
}

function loadStartPage() {
  var fs = require("fs");
  var ppath = require('persist-path')('ArrowBrowser');

  try {
    var startPage = fs.readFileSync(ppath + "\\json\\startpage.json");
    document.getElementById('start-page-input').value = startPage;
  } catch (e) {
    alert(e);
  }
}

function saveStartPage() {
  var url = document.getElementById('start-page-input').value;

  var fs = require('fs');
  var ppath = require('persist-path')('ArrowBrowser');

  fs.writeFileSync(ppath + "\\json\\startPage.json", url);

  notif("Start page saved: " + url, "success");
}

function notif(text, type) {
  let Data = {
    text: text,
    type: type
  };
  ipcRenderer.send('request-notif', Data)
}

function moreInfo(btn) {
  btn.classList.toggle('active');
  btn.nextElementSibling.classList.toggle('active');
}

function requestSearchEngine(engine) {
  ipcRenderer.send('request-set-search-engine', engine);

  notif("Search engine changed: " + engine, "success");
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
  document.getElementById('version').innerHTML = "v" + arg.app;
});

// window
ipcRenderer.on('action-blur-window', (event, arg) => {
  document.getElementById('titlebar').classList.add('blur');
});
ipcRenderer.on('action-focus-window', (event, arg) => {
  document.getElementById('titlebar').classList.remove('blur');
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
  //   <div class="button" id="close-btn" title="Close" onclick="closeWindow()"><span>&#xE8BB;</span></div>
  // `;
  // document.getElementById('window-controls').classList.add('windows');

  loadTheme();
  loadBorderRadius();
  loadStartPage();

  ipcRenderer.send('request-set-about');
}

document.onreadystatechange =  () => {
  if (document.readyState == "complete") {
    init();
  }
};