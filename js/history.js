/*
.##.....##....###....####.##....##
.###...###...##.##....##..###...##
.####.####..##...##...##..####..##
.##.###.##.##.....##..##..##.##.##
.##.....##.#########..##..##..####
.##.....##.##.....##..##..##...###
.##.....##.##.....##.####.##....##
*/

const { ipcRenderer, clipboard } = require('electron');
const getTitleAtUrl = require('get-title-at-url');
const readl = require('readl-async');
const ppath = require('persist-path')('Ferny');
const getAvColor = require('color.js');
const parsePath = require("parse-path");
const fileExtension = require('file-extension');

var historyLineNumber = 0;
var reader = new readl(ppath + "/json/history.json", { encoding: 'utf8' });

reader.on('line', function(line, index, start, end) {
  var obj = JSON.parse(line);
  createHistoryItem(historyLineNumber, obj.url, obj.time, false);
  historyLineNumber++;
});

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
const extToImagePath = require("../modules/extToImagePath.js");
const loadTheme = require("../modules/loadTheme.js");
const epochToDate = require("../modules/epochToDate.js");
const epochToTime = require("../modules/epochToTime.js");
const applyTheme = require("../modules/applyTheme.js");
const rgbToRgbaString = require("../modules/rgbToRgbaString.js");

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

function copyUrl(url) {
  clipboard.writeText(url);
}

function loadHistory() {
  reader.read();
}

function clearHistory() {
  var container = document.getElementById('history');
  if(container.innerHTML == "") {
    notif('History is already empty', 'info');
  } else {
    ipcRenderer.send('request-add-quest-notif', { 
      text: "Are you sure to clear history?", 
      ops: [{ 
        text:'Delete', 
        icon:'delete-16', 
        click:'clearHistory()' 
      }] 
    });
  }
}

function createHistoryItem(index, url, time, begin) {
  return new Promise(function (resolve, reject) {
    var div = document.createElement('div');
    div.classList.add('history-item');
    div.id = "history-" + index;
    
    div.innerHTML = `<hr>
                    Url: <label class="history-url" title="` + url + `">` + url + `</label><br>
                    Date: <label class="history-date">` + epochToDate(time) + `</label> / <label>Time: </label><label class="history-time">` + epochToTime(time) + `</label><hr>
                    <center class="history-buttons">
                      <button class="nav-btn" onclick="openUrl('` + url + `')" title="Open URL">
                        <img class="nav-btn-icon theme-icon" name="link-16">
                        <label>Open</label>
                      </button>
                      <button class="nav-btn" onclick="openUrlInNewTab('` + url + `')" title="Open URL in new tab">
                        <img class="nav-btn-icon theme-icon" name="tab-16">
                        <label>New tab</label>
                      </button>
                      <button class="nav-btn" onclick="copyUrl('` + url + `')" title="Copy URL">
                        <img class="nav-btn-icon theme-icon" name="copy-16">
                        <label>Copy</label>
                      </button>
                      
                    </center>`;

    if (parsePath(url).protocol == 'file') {
      var ext = fileExtension(url);
      div.innerHTML = `<img class="history-icon" src=` + extToImagePath(ext) + `><label class="history-name">` + ext.toUpperCase() + ` file</label>` + div.innerHTML;
    } else {
      div.innerHTML = `<img class="history-icon" src="` + 'http://www.google.com/s2/favicons?domain=' + url + `"><label class="history-name">Loading...</label>` + div.innerHTML;
      applyTitle(url, index);
    }

    div.addEventListener('auxclick', (e) => {
      e.preventDefault();
      if(e.which == 2) {
        ipcRenderer.send('request-open-url-in-new-tab', url);
      }
    }, false);   

    div.onload = resolve;
    div.onerror = reject;

    var color = new getAvColor(div.getElementsByTagName('img')[0]);
    color.mostUsed(result => {
      div.style.backgroundColor = rgbToRgbaString(result[0]);
    });

    var container = document.getElementById('history');

    if(begin) {
      container.insertBefore(div, container.firstChild);
    } else {
      container.appendChild(div);
    }

    updateTheme();
  });
}

// function removeHistoryItem(index) {
//   var div = document.getElementById('history-' + index);
//   div.parentNode.removeChild(div);

//   replace({ files: ppath + "/json/history.json", from: , to:  }, (error, results) => {
//     if (error) {
//       return console.error('Error occurred:', error);
//     } else {

//     }
//     console.log('Replacement results:', results);
//   });
// }

function applyTitle(url, index) {
  getTitleAtUrl(url, function(title) {
    var div = document.getElementById('history-' + index);
    var name = div.getElementsByClassName('history-name')[0];
    if(typeof(title) == "undefined") {
      name.innerHTML = "Failed to load";
    } else {
      name.title = title;
      name.innerHTML = title;
    }
  });
}

function openUrl(url) {
  ipcRenderer.send('request-open-url', url);
}

function openUrlInNewTab(url) {
  ipcRenderer.send('request-open-url-in-new-tab', url);
}

function notif(text, type) {
  let Data = {
    text: text,
    type: type
  };
  ipcRenderer.send('request-add-status-notif', Data)
}

function numberToMonth(number) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[number];
}

/*
..######..########....###....########...######..##.....##
.##....##.##.........##.##...##.....##.##....##.##.....##
.##.......##........##...##..##.....##.##.......##.....##
..######..######...##.....##.########..##.......#########
.......##.##.......#########.##...##...##.......##.....##
.##....##.##.......##.....##.##....##..##....##.##.....##
..######..########.##.....##.##.....##..######..##.....##
*/

function closeSearchPanel() {
  cancelSearch();
  document.getElementById('search-panel').style.display = "none";
  document.getElementById('search-btn').classList.remove('active');
}

function showSearchPanel() {
  document.getElementById('search-panel').style.display = "";
  document.getElementById('search-btn').classList.add('active');
  document.getElementById('search').select();
}

function searchKeyUp() {
  if(document.getElementById("search").value.length > 0) {
    var search = document.getElementById("search").value.toLowerCase();
    var elements = document.getElementsByClassName('history-item');
    for(var i = 0; i < elements.length; i++) {
      var name = elements[i].getElementsByClassName('history-name')[0].innerHTML.toLowerCase();
      var url = elements[i].getElementsByClassName('history-url')[0].innerHTML.toLowerCase();
      var date = elements[i].getElementsByClassName('history-date')[0].innerHTML.toLowerCase();
      var time = elements[i].getElementsByClassName('history-time')[0].innerHTML.toLowerCase();
      var text = name + " " + url + " " + date + " " + time;
      if(text.indexOf(search) != -1) {
        elements[i].style.display = "";
      } else {
        elements[i].style.display = "none";
      }
    }
  } else {
    var elements = document.getElementsByClassName('history-item');
    for(var i = 0; i < elements.length; i++) {
      elements[i].style.display = "";
    }
  }
}

function cancelSearch() {
  document.getElementById('search').value = "";
  searchKeyUp();
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

ipcRenderer.on('action-add-history-item', (event, arg) => {
  createHistoryItem(arg.index, arg.url, arg.time, true);
});


ipcRenderer.on('action-clear-history', (event, arg) => {
  try {
    saveFileToJsonFolder('history', "").then(function() {
      var container = document.getElementById('history');
      container.innerHTML = "";
      notif('History cleared', 'success');
    });
  } catch (error) {
    notif('Error: ' + error, 'error')
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
  updateTheme();
  
  loadHistory();
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