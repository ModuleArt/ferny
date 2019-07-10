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
const ppath = require('persist-path')('Arrow Browser');
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

// appearance
function changeTheme(color) {
  // document.body.style.backgroundColor = color;

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

    var radios = document.getElementsByName("border-radius");
    for(var i = 0; i < radios.length; i++) {
      if(radios[i].value == borderRadius) {
        radios[i].checked = true;
      }
    }
  } catch (e) {

  }
}
function changeBorderRadius(size) {
  document.documentElement.style.setProperty('--px-radius', size + 'px');
}

// downloads
function loadDownloads() {
  try {
    var jsonstr = fs.readFileSync(ppath + "\\json\\downloads.json");
    var arr = JSON.parse(jsonstr);
    var i;
    for (i = 0; i < arr.length; i++) {
      createStoppedDownload(arr[i].index, arr[i].name, arr[i].url, arr[i].path, arr[i].time);
    }
  } catch (e) {

  }
}

// downloads
function createDownload(index, name, url, time) {
  var div = document.createElement('div');
  div.classList.add('download');
  div.id = "download-" + index;
  div.name = "starting";
  div.innerHTML = `
    <img class="download-icon" src="` + 'http://www.google.com/s2/favicons?domain=' + url + `"><label class="download-status">Starting</label><hr>
    <label>File: </label><label class="download-file" title="` + name + `">` + name + `</label><br>
    <label>Url: </label><label class="download-link" title="` + url + `">` + url + `</label><br>
    <label>Date: </label><label class="download-date">` + epochToDate(time) + `</label> / <label>Time: </label><label class="download-time">` + epochToTime(time) + `</label><hr>
    <center class="download-buttons"></center>`;

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
  div.innerHTML = `
    <img class="download-icon" src="` + 'http://www.google.com/s2/favicons?domain=' + url + `"><label class="download-status">Finished</label><hr>
    File: <label class="download-file" title="` + name + `">` + name + `</label><br>
    Url: <label class="download-link" title="` + url + `">` + url + `</label><br>
    Date: <label class="download-date">` + epochToDate(time) + `</label> / Time: <label class="download-time">` + epochToTime(time) + `</label><hr>`;

  if (fs.existsSync(path.replace(/\\/g, "/"))) {
    div.innerHTML += `
      <center class="download-buttons">
        <div class="nav-btn" onclick="showItemInFolder('` + path.replace(/\\/g, "/") + `')">
          <img class="nav-btn-icon theme-icon" name="download-folder">
          <label>Folder</label>
        </div>
        <div class="nav-btn" onclick="openItem('` + path.replace(/\\/g, "/") + `')">
          <img class="nav-btn-icon theme-icon" name="file">
          <label>Open</label>
        </div>
        <div class="nav-btn" onclick="removeDownload(` + index + `)">
          <img class="nav-btn-icon theme-icon" name="delete">
          <label>Remove</label>
        </div>
      </center>`;
  } else {
    div.innerHTML += `
      <div class="download-buttons">
        <div class="nav-btn" onclick="retryDownload(` + index + `, '` + url + `')">
          <img class="nav-btn-icon theme-icon" name="refresh">
          <label>Retry</label>
        </div>
        <div class="nav-btn" onclick="removeDownload(` + index + `)">
          <img class="nav-btn-icon theme-icon" name="delete">
          <label>Remove</label>
        </div>
      </div>`;
  }

  var container = document.getElementById('sidebar-downloads');
  var dwndls = container.getElementsByClassName('download');
  if (dwndls.length > 0) {
    container.insertBefore(div, dwndls[0]);
  } else {
    container.appendChild(div);
  }

  loadTheme();

  // console.log(div.name);
}

function setDownloadProcess(index, bytes, total, name) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = "Downloading - " + bytesToSize(bytes) + " / " + bytesToSize(total) + " - " + Math.round(percentage(bytes, total)) + "%";

  if (div.name != "process") {
    div.name = "process";
    var buttons = div.getElementsByClassName('download-buttons')[0];
    buttons.innerHTML = `
      <div class="nav-btn" onclick="pauseDownload(` + index + `)">
        <img class="nav-btn-icon theme-icon" name="pause">
        <label>Pause</label>
      </div>
      <div class="nav-btn" onclick="cancelDownload(` + index + `)">
        <img class="nav-btn-icon theme-icon" name="cancel">
        <label>Cancel</label>
      </div>`;
  }

  loadTheme();

  // console.log(div.name);
}

function setDownloadStatusPause(index, bytes, total, name) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = "Pause - " + bytesToSize(bytes) + " / " + bytesToSize(total);

  if (div.name != "pause") {
    div.name = "pause";
    var buttons = div.getElementsByClassName('download-buttons')[0];
    buttons.innerHTML = `
      <div class="nav-btn" onclick="resumeDownload(` + index + `)">
        <img class="nav-btn-icon theme-icon" name="download">
        <label>Resume</label>
      </div>
      <div class="nav-btn" onclick="cancelDownload(` + index + `)">
        <img class="nav-btn-icon theme-icon" name="cancel">
        <label>Cancel</label>
      </div>`;
  } 

  loadTheme();

  // console.log(div.name);
}

function setDownloadStatusDone(index, name, path) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = "Done";

  div.name = "done";

  var buttons = div.getElementsByClassName('download-buttons')[0];
  buttons.innerHTML = `
    <div class="nav-btn" onclick="shell.showItemInFolder('` + path.replace(/\\/g, "/") + `')">
      <img class="nav-btn-icon theme-icon" name="download-folder">
      <label>Folder</label>
    </div>
    <div class="nav-btn" onclick="shell.openItem('` + path.replace(/\\/g, "/") + `')">
      <img class="nav-btn-icon theme-icon" name="file">
      <label>Open</label>
    </div>
    <div class="nav-btn" onclick="removeDownload(` + index + `)">
      <img class="nav-btn-icon theme-icon" name="delete">
      <label>Remove</label>
    </div>`;

  loadTheme();

  // console.log(div.name);
}

function setDownloadStatusFailed(index, state, name, link) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = state.charAt(0).toUpperCase() + state.slice(1);;

  div.name = "failed";

  var buttons = div.getElementsByClassName('download-buttons')[0];
  buttons.innerHTML = `
    <div class="nav-btn" onclick="retryDownload(` + index + `, '` + link + `')">
      <img class="nav-btn-icon theme-icon" name="refresh">
      <label>Retry</label>
    </div>
    <div class="nav-btn" onclick="removeDownload(` + index + `)">
      <img class="nav-btn-icon theme-icon" name="delete">
      <label>Remove</label>
    </div>`;

  loadTheme();

  // console.log(div.name);
}

function setDownloadStatusInterrupted(index, name) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = "Interrupted";

  div.name = "interrupted";

  var buttons = div.getElementsByClassName('download-buttons')[0];
  buttons.innerHTML = `
    <div class="nav-btn" onclick="resumeDownload(` + index + `)">
      <img class="nav-btn-icon theme-icon" name="download">
      <label>Resume</label>
    </div>
    <div class="nav-btn" onclick="cancelDownload(` + index + `)">
      <img class="nav-btn-icon theme-icon" name="cancel">
      <label>Cancel</label>
    </div>`;

  loadTheme();

  // console.log(div.name);
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
      for(var i = 0; i < dwnlds.length; i++) {
        dwnlds[i].parentNode.removeChild(dwnlds[i]);
        i--;
      }
      ipcRenderer.send('request-clear-downloads');
      notif("Downloads cleared", "success");
    } else {
      notif("First stop all downloads", "warning");
    }
  } else {
    notif("The downloads are already empty", "info");
  }
}

function showItemInFolder(path) {
  if (fs.existsSync(path)) {
    shell.showItemInFolder(path);
  } else {
    notif("File or folder are missing", "error");
  }
}

function openItem(path) {
  if (fs.existsSync(path)) {
    shell.openItem(path);
  } else {
    notif("File or folder are missing", "error");
  }
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
  ipcRenderer.send('request-notif', Data)
}

function epochToDate(time) {
  let date = new Date(0);
  date.setUTCSeconds(time);
  var str = date.getDate() + " " + numberToMonth(date.getMonth()) + " " + date.getFullYear(); 
  return str;
}

function epochToTime(time) {
  let date = new Date(0);
  date.setUTCSeconds(time);

  var minutes = date.getMinutes();
  var hours = date.getHours()

  if(minutes <= 9) {
    minutes = "0" + minutes;
  }

  if(hours <= 9) {
    hours = "0" + hours;
  }

  var str = hours + ":" + minutes;
  return str;
}

function numberToMonth(number) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[number];
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
  loadDownloads();
  loadTheme();
  loadBorderRadius();

  document.getElementById("search").addEventListener("keyup", function(event) {
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
  });
}

document.onreadystatechange =  () => {
  if (document.readyState == "complete") {
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