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
.##.....##..#######..########..##.....##.##.......########..######.
.###...###.##.....##.##.....##.##.....##.##.......##.......##....##
.####.####.##.....##.##.....##.##.....##.##.......##.......##......
.##.###.##.##.....##.##.....##.##.....##.##.......######....######.
.##.....##.##.....##.##.....##.##.....##.##.......##.............##
.##.....##.##.....##.##.....##.##.....##.##.......##.......##....##
.##.....##..#######..########...#######..########.########..######.
*/

const applyBorderRadius = require("../modules/applyBorderRadius.js");
const applyBgColor = require("../modules/applyBgColor.js");
const loadBgColor = require("../modules/loadBgColor.js");
const loadBorderRadius = require("../modules/loadBorderRadius.js");
const applyWinControls = require("../modules/applyWinControls.js");

/*
.########.##.....##.##....##..######..########.####..#######..##....##..######.
.##.......##.....##.###...##.##....##....##.....##..##.....##.###...##.##....##
.##.......##.....##.####..##.##..........##.....##..##.....##.####..##.##......
.######...##.....##.##.##.##.##..........##.....##..##.....##.##.##.##..######.
.##.......##.....##.##..####.##..........##.....##..##.....##.##..####.......##
.##.......##.....##.##...###.##....##....##.....##..##.....##.##...###.##....##
.##........#######..##....##..######.....##....####..#######..##....##..######.
*/

function closeWindow() {
  ipcRenderer.send('request-close-keybinds');
}

function updateSearch() {
  var names = document.getElementsByClassName('key-name');
  var codes = document.getElementsByClassName('key-code');

  var containers = document.getElementsByClassName('block-container');
  var blocks = document.getElementsByClassName('block-title');

  if(document.getElementById("search").value.length > 0) {
    var search = document.getElementById("search").value.toLowerCase();
    for(var i = 0; i < names.length; i++) {
      var text = names[i].innerHTML.toLowerCase();
      if(text.indexOf(search) != -1) {
        names[i].style.display = "";
        codes[i].style.display = "";
      } else {
        names[i].style.display = "none";
        codes[i].style.display = "none";
      }
    }

    for(var i = 1; i < containers.length; i++) {
      if(containers[i].clientHeight < 16) {
        containers[i].style.display = "none";
        blocks[i].style.display = "none";
      } else {
        containers[i].style.display = "";
        blocks[i].style.display = "";
      }
    }
  } else {
    for(var i = 0; i < names.length; i++) {
      names[i].style.display = "";
      codes[i].style.display = "";
    }

    for(var i = 1; i < containers.length; i++) {
      containers[i].style.display = "";
      blocks[i].style.display = "";
    }
  }
}

function scrollToId(id) {
  document.getElementById(id).scrollIntoView({
	  	behavior: 'smooth'
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
  applyWinControls('only-close');
  applyBgColor(loadBgColor());
  applyBorderRadius(loadBorderRadius());
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