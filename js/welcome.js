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
    document.documentElement.style.setProperty('--color-over', 'rgba(0, 0, 0, 0.1)');
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
  try {
    var themeColor = fs.readFileSync(ppath + "\\json\\theme.json");
    changeTheme(themeColor);
  } catch (e) {

  }
}

function loadBorderRadius() {
  try {
    var borderRadius = fs.readFileSync(ppath + "\\json\\radius.json");
    changeBorderRadius(borderRadius);
  } catch (e) {

  }
}

function chooseSlide(i) {
  var dots = document.getElementsByClassName('dot');
  var tabs = document.getElementsByClassName('tab');

  for(var j = 0; j < dots.length; j++) {
    dots[j].classList.remove('active');
    tabs[j].classList.remove('active');
  }

  dots[i].classList.add('active');
  tabs[i].classList.add('active');

  if(i == 0) {
    document.getElementById('prev-btn').classList.add('disable');
  } else {
    document.getElementById('prev-btn').classList.remove('disable');
  }
  if(i == dots.length - 1) {
    document.getElementById('next-btn').classList.add('disable');
    document.getElementById('skip-btn').classList.add('disable');
  } else {
    document.getElementById('next-btn').classList.remove('disable');
    document.getElementById('skip-btn').classList.remove('disable');
  }
}

function nextSlide() {
  var dots = document.getElementsByClassName('dot');
  for(var i = 0; i < dots.length - 1; i++) {
    if(dots[i].classList.contains('active')) {
      chooseSlide(i + 1);
      break;
    }
  }
}

function prevSlide() {
  var dots = document.getElementsByClassName('dot');
  for(var i = 1; i < dots.length; i++) {
    if(dots[i].classList.contains('active')) {
      chooseSlide(i - 1);
      break;
    }
  }
}

function loadSearchEngine() {
  try {
    var searchEngine = fs.readFileSync(ppath + "\\json\\searchengine.json");

    var radios = document.getElementsByName("search-engine");
    for(var i = 0; i < radios.length; i++) {
      if(radios[i].value == searchEngine) {
        radios[i].checked = true;
        break;
      }
    }
  } catch (e) {

  }
}

function closeWindow() {
  ipcRenderer.send('request-close-welcome');
}

function moreSettings(shortcutId) {
  ipcRenderer.send('request-open-settings', shortcutId);
}

function changeWelcome(bool) {
  if(bool) {
    fs.writeFileSync(ppath + "\\json\\welcome.json", 1);
  } else {
    fs.writeFileSync(ppath + "\\json\\welcome.json", 0);
  }
}

function openAppPage() {
  ipcRenderer.send('request-open-url-in-new-tab', "https://moduleart.github.io/ferny");
}

function openDeveloperPage() {
  ipcRenderer.send('request-open-url-in-new-tab', "https://moduleart.github.io/");
}

function loadStartPage() {
  try {
    var startPage = fs.readFileSync(ppath + "\\json\\startpage.json");
    document.getElementById('start-page-input').value = startPage;
  } catch (e) {

  }
}

function setStartPageLikeHomePage() {
  try {
    var jsonstr = fs.readFileSync(ppath + "\\json\\home.json");
    Data = JSON.parse(jsonstr);
    document.getElementById('start-page-input').value = Data.url;
  } catch (e) {

  }
}

function saveStartPage() {
  var url = document.getElementById('start-page-input').value;

  fs.writeFileSync(ppath + "\\json\\startPage.json", url);

  notif("New tab page saved: " + url, "success");
}

function loadBookmarksBar() {
  try {
    var jsonstr = fs.readFileSync(ppath + "\\json\\bookmarksbar.json");
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

function loadHomePage() {
  try {
    var jsonstr = fs.readFileSync(ppath + "\\json\\home.json");
    Data = JSON.parse(jsonstr);
    document.getElementById('home-page-input').value = Data.url;
    if(Data.on == 1) {
      document.getElementById('home-page-checkbox').checked = true;
    }
  } catch (e) {

  }
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
}

function keyDown(e) {
  e = e || window.event;

  if (e.keyCode == '37') {
    prevSlide();
  } else if (e.keyCode == '39') {
    nextSlide();
  }
}

function loadWelcome() {
  try {
    var welcomeOn = fs.readFileSync(ppath + "\\json\\welcome.json");
    if(welcomeOn == 1) {
      document.getElementById('welcome-checkbox').checked = true;
    } else {
      document.getElementById('welcome-checkbox').checked = false;
    }
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
  
    if(!fs.existsSync(ppath + "\\json")) {
      fs.mkdirSync(ppath + "\\json");
    } 
    fs.writeFileSync(ppath + "\\json\\home.json", JSON.stringify({ url: url, on: on }));

    notif("Home page saved: " + url, "success");

    ipcRenderer.send('request-update-home-page');
  }
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
  loadTheme();
  loadBorderRadius();
  loadSearchEngine();
  loadHomePage();
  loadStartPage();
  loadBookmarksBar();
  loadWelcome();

  ipcRenderer.send('request-set-about');

  document.onkeydown = keyDown;
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