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
const { shell } = require('electron');
const ppath = require('persist-path')('Ferny');
const fs = require("fs");
const getAvColor = require('color.js');
const fileExtension = require('file-extension');

/*
.##.....##..#######..########..##.....##.##.......########..######.
.###...###.##.....##.##.....##.##.....##.##.......##.......##....##
.####.####.##.....##.##.....##.##.....##.##.......##.......##......
.##.###.##.##.....##.##.....##.##.....##.##.......######....######.
.##.....##.##.....##.##.....##.##.....##.##.......##.............##
.##.....##.##.....##.##.....##.##.....##.##.......##.......##....##
.##.....##..#######..########...#######..########.########..######.
*/

const applyTheme = require("../modules/applyTheme.js");
const epochToDate = require("../modules/epochToDate.js");
const epochToTime = require("../modules/epochToTime.js");
const loadTheme = require("../modules/loadTheme.js");
const extToImagePath = require("../modules/extToImagePath.js");
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

function loadDownloads() {
  try {
    fs.readFile(ppath + "/json/downloads.json", function(err, data) {
      var arr = JSON.parse(data);
      for (var i = 0; i < arr.length; i++) {
        createStoppedDownload(arr[i].index, arr[i].name, arr[i].url, arr[i].path, arr[i].time);
      }
    });
  } catch (e) {

  }
}

function createDownload(index, name, url, time) {
  var div = document.createElement('div');
  div.classList.add('download');
  div.id = "download-" + index;
  div.name = "starting";

  var ext = fileExtension(url);
  div.innerHTML = `
    <img class="download-icon" src="` + extToImagePath(ext) + `">
    <label class="download-ext">` + ext.toUpperCase() + ` file</label>
    <label class="download-status">Starting</label><hr>
    <label>File: </label><label class="download-file" title="` + name + `">` + name + `</label><br>
    <label>Url: </label><label class="download-link" title="` + url + `">` + url + `</label><br>
    <label>Date: </label><label class="download-date">` + epochToDate(time) + `</label> / <label>Time: </label><label class="download-time">` + epochToTime(time) + `</label><hr>
    <center class="download-buttons"></center>`;

  var color = new getAvColor(div.getElementsByTagName('img')[0]);
  color.mostUsed(result => {
    div.style.backgroundColor = rgbToRgbaString(result[0]);
  });

  var container = document.getElementById('sidebar-downloads');
  var dwndls = container.getElementsByClassName('download');
  if (dwndls.length > 0) {
    container.insertBefore(div, dwndls[0]);
  } else {
    container.appendChild(div);
  }

  // console.log(div.name);
}

function createStoppedDownload(index, name, url, path, time) {
  var div = document.createElement('div');
  div.classList.add('download');
  div.id = "download-" + index;
  div.name = "stopped";

  var ext = fileExtension(url);
  div.innerHTML = `
    <img class="download-icon" src="` + extToImagePath(ext) + `">
    <label class="download-ext">` + ext.toUpperCase() + ` file</label>
    <label class="download-status">Finished</label>
    <hr>
    File: <label class="download-file" title="` + name + `">` + name + `</label><br>
    Url: <label class="download-link" title="` + url + `">` + url + `</label><br>
    Date: <label class="download-date">` + epochToDate(time) + `</label> / Time: <label class="download-time">` + epochToTime(time) + `</label><hr>`;

  var color = new getAvColor(div.getElementsByTagName('img')[0]);
  color.mostUsed(result => {
    div.style.backgroundColor = rgbToRgbaString(result[0]);
  });

  fs.exists(path.replace(/\\/g, "/"), function(exists) {
    if (exists) {
      div.innerHTML += `
        <center class="download-buttons">
          <button class="nav-btn" onclick="showItemInFolder('` + path.replace(/\\/g, "/") + `')" title="Show file in folder">
            <img class="theme-icon" name="folder-16">
            <label>Folder</label>
          </button>
          <button class="nav-btn" onclick="openItem('` + path.replace(/\\/g, "/") + `')" title="Open file">
            <img class="theme-icon" name="file-16">
            <label>Open</label>
          </button>
          <button class="nav-btn" onclick="removeDownload(` + index + `)" title="Remove download">
            <img class="theme-icon" name="delete-16">
            <label>Remove</label>
          </button>
        </center>`;
    } else {
      div.innerHTML += `
        <div class="download-buttons">
          <button class="nav-btn" onclick="retryDownload(` + index + `, '` + url + `')" title="Retry download">
            <img class="theme-icon" name="reload-16">
            <label>Retry</label>
          </button>
          <button class="nav-btn" onclick="removeDownload(` + index + `)" title="Remove download">
            <img class="theme-icon" name="delete-16">
            <label>Remove</label>
          </button>
        </div>`;
    }
  });

  var container = document.getElementById('sidebar-downloads');
  var dwndls = container.getElementsByClassName('download');
  if (dwndls.length > 0) {
    container.insertBefore(div, dwndls[0]);
  } else {
    container.appendChild(div);
  }

  updateTheme();
}

function setDownloadProcess(index, bytes, total, name) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = "Downloading - " + bytesToSize(bytes) + " / " + bytesToSize(total) + " - " + Math.round(percentage(bytes, total)) + "%";

  if (div.name != "process") {
    div.name = "process";
    var buttons = div.getElementsByClassName('download-buttons')[0];
    buttons.innerHTML = `
      <button class="nav-btn" onclick="pauseDownload(` + index + `)" title="Pause download">
        <img class="theme-icon" name="pause-16">
        <label>Pause</label>
      </button>
      <button class="nav-btn" onclick="cancelDownload(` + index + `)" title="Cancel download">
        <img class="theme-icon" name="cancel-16">
        <label>Cancel</label>
      </button>`;
  }

  updateTheme();
}

function setDownloadStatusPause(index, bytes, total, name) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = "Pause - " + bytesToSize(bytes) + " / " + bytesToSize(total);

  if (div.name != "pause") {
    div.name = "pause";
    var buttons = div.getElementsByClassName('download-buttons')[0];
    buttons.innerHTML = `
      <button class="nav-btn" onclick="resumeDownload(` + index + `)" title="Resume download">
        <img class="theme-icon" name="download-16">
        <label>Resume</label>
      </button>
      <button class="nav-btn" onclick="cancelDownload(` + index + `)" title="Cancel download">
        <img class="theme-icon" name="cancel-16">
        <label>Cancel</label>
      </button>`;
  } 

  updateTheme();
}

function setDownloadStatusDone(index, name, path) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = "Done";

  div.name = "done";

  var buttons = div.getElementsByClassName('download-buttons')[0];
  buttons.innerHTML = `
    <button class="nav-btn" onclick="shell.showItemInFolder('` + path.replace(/\\/g, "/") + `')" title="Show file in folder">
      <img class="theme-icon" name="folder-16">
      <label>Folder</label>
    </button>
    <button class="nav-btn" onclick="shell.openItem('` + path.replace(/\\/g, "/") + `')" title="Open file">
      <img class="theme-icon" name="file-16">
      <label>Open</label>
    </button>
    <button class="nav-btn" onclick="removeDownload(` + index + `)" title="Remove download">
      <img class="theme-icon" name="delete-16">
      <label>Remove</label>
    </button>`;

  updateTheme();
}

function setDownloadStatusFailed(index, state, name, link) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = state.charAt(0).toUpperCase() + state.slice(1);;

  div.name = "failed";

  var buttons = div.getElementsByClassName('download-buttons')[0];
  buttons.innerHTML = `
    <button class="nav-btn" onclick="retryDownload(` + index + `, '` + link + `')" title="Retry download">
      <img class="theme-icon" name="reload-16">
      <label>Retry</label>
    </button>
    <button class="nav-btn" onclick="removeDownload(` + index + `)" title="Remove download">
      <img class="theme-icon" name="delete-16">
      <label>Remove</label>
    </button>`;

  updateTheme();
}

function setDownloadStatusInterrupted(index, name) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = "Interrupted";

  div.name = "interrupted";

  var buttons = div.getElementsByClassName('download-buttons')[0];
  buttons.innerHTML = `
    <button class="nav-btn" onclick="resumeDownload(` + index + `)" title="Resume download">
      <img class="theme-icon" name="download-16">
      <label>Resume</label>
    </button>
    <button class="nav-btn" onclick="cancelDownload(` + index + `)" title="Cancel download">
      <img class="theme-icon" name="cancel-16">
      <label>Cancel</label>
    </button>`;

  updateTheme();
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
  ipcRenderer.send('request-open-url-in-new-tab', link);
}

function clearArchive() {
  var dwnlds = document.getElementsByClassName('download');
  if(dwnlds.length > 0) {
    var bool = true;
    for (var i = 0; i < dwnlds.length; i++) {
      if(dwnlds[i].name == "process" || dwnlds[i].name == "starting" || dwnlds[i].name == "pause") {
        bool = false;
        break;
      }
    }
    if(bool) {
      ipcRenderer.send('request-add-quest-notif', { 
        text: "Are you sure to clear all downloads?", 
        ops: [{ 
          text:'Delete', 
          icon:'delete-16', 
          click:'clearDownloads()' 
        }] 
      });
    } else {
      notif("First stop all downloads", "warning");
    }
  } else {
    notif("The downloads are already empty", "info");
  }
}

function showItemInFolder(path) {
  fs.exists(path, function(exists) {
    if (exists) {
      shell.showItemInFolder(path);
    } else {
      notif("File or folder are missing", "error");
    }
  });
}

function openItem(path) {
  fs.exists(path, function(exists) {
    if (exists) {
      shell.openItem(path);
    } else {
      notif("File or folder are missing", "error");
    }
  });
}

function bytesToSize(bytes) {
  var sizes = ['bytes', 'Kb', 'Mb', 'Gb', 'Tb'];
  if (bytes == 0) return '0 Byte';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function percentage(partialValue, totalValue) {
  return (100 * partialValue) / totalValue;
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
    var elements = document.getElementsByClassName('download');
    for(var i = 0; i < elements.length; i++) {
      var link = elements[i].getElementsByClassName('download-link')[0].innerHTML.toLowerCase();
      var file = elements[i].getElementsByClassName('download-file')[0].innerHTML.toLowerCase();
      var date = elements[i].getElementsByClassName('download-date')[0].innerHTML.toLowerCase();
      var time = elements[i].getElementsByClassName('download-time')[0].innerHTML.toLowerCase();
      var text = file + " " + link + " " + date + " " + time;
      if(text.indexOf(search) != -1) {
        elements[i].style.display = "";
      } else {
        elements[i].style.display = "none";
      }
    }
  } else {
    var elements = document.getElementsByClassName('download');
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

ipcRenderer.on('action-create-download', (event, arg) => {
  createDownload(arg.index, arg.name, arg.url, arg.time);
});
ipcRenderer.on('action-create-stopped-download', (event, arg) => {
  createStoppedDownload(arg.index, arg.name, arg.url, arg.path, arg.time);
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

ipcRenderer.on('action-clear-downloads', (event, args) => {
  var dwnlds = document.getElementsByClassName('download');
  for(var i = 0; i < dwnlds.length; i++) {
    dwnlds[i].parentNode.removeChild(dwnlds[i]);
    i--;
  }
  notif("Downloads cleared", "success");
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

  loadDownloads();
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