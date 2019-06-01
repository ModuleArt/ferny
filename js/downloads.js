const { ipcRenderer } = require('electron');
const { shell } = require('electron');

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
  document.body.style.backgroundColor = color;

  if(checkIfDark(color)) {
    setIconsStyle('light');

    document.documentElement.style.setProperty('--color-top', 'white');
    document.documentElement.style.setProperty('--color-over', 'rgba(0, 0, 0, 0.2)');
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
  var fs = require("fs");
  var ppath = require('persist-path')('ArrowBrowser');

  try {
    var jsonstr = fs.readFileSync(ppath + "\\json\\downloads.json");
    var arr = JSON.parse(jsonstr);
    var i;
    for (i = 0; i < arr.length; i++) {
      let Data = {
        index: arr[i].index,
        url: arr[i].url,
        name: arr[i].name,
        path: arr[i].path
      };
      createStoppedDownload(arr[i].index, arr[i].name, arr[i].url, arr[i].path);
    }
  } catch (e) {

  }
}

// downloads
function createDownload(index, name, url) {
  var div = document.createElement('div');
  div.classList.add('download');
  div.id = "download-" + index;
  div.innerHTML = `
    <label>File: </label><label class="download-file" title="` + name + `">` + name + `</label><br>
    <label class="download-status" value="starting">Starting</label><br>
    <label>Url: </label><label class="download-link" title="` + url + `">` + url + `</label><br>
    <div class="download-buttons"></div>`;

  var container = document.getElementById('sidebar-downloads');
  var dwndls = container.getElementsByClassName('download');
  if (dwndls.length > 0) {
    container.insertBefore(div, dwndls[0]);
  } else {
    container.appendChild(div);
  }
}

function createStoppedDownload(index, name, url, path) {
  var div = document.createElement('div');
  div.classList.add('download');
  div.id = "download-" + index;
  div.innerHTML = `
    <label>File: </label><label class="download-file" title="` + name + `">` + name + `</label><br>
    <label class="download-status" value="stopped">Finished</label><br>
    <label>Url: </label><label class="download-link" title="` + url + `">` + url + `</label><br>`;

  var fs = require('fs');
  if (fs.existsSync(path.replace(/\\/g, "/"))) {
    div.innerHTML += `
      <div class="download-buttons">
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
      </div>`;
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
}

function setDownloadProcess(index, bytes, total, name) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = "Downloading - " + bytesToSize(bytes) + " / " + bytesToSize(total) + " - " + Math.round(percentage(bytes, total)) + "%";

  if (status.value != "process") {
    status.value = "process";
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
}

function setDownloadStatusPause(index, bytes, total, name) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = "Pause - " + bytesToSize(bytes) + " / " + bytesToSize(total);

  if (status.value != "pause") {
    status.value = "pause";
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
}

function setDownloadStatusDone(index, name, path) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = "Done";

  status.value = "done";

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
}

function setDownloadStatusFailed(index, state, name, link) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = state.charAt(0).toUpperCase() + state.slice(1);;

  status.value = "failed";

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
}

function setDownloadStatusInterrupted(index, name) {
  var div = document.getElementById('download-' + index);

  var status = div.getElementsByClassName('download-status')[0];
  status.innerHTML = "Interrupted";

  status.value = "interrupted";

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
  // tabGroup.addTab({
  //   title: 'Retry download',
  //   src: link,
  //   active: true
  // });
  ipcRenderer.send('request-open-url', link);
}

function clearArchive() {
  ipcRenderer.send('request-clear-downloads');

  var dwnlds = document.getElementsByClassName('download');
  for (var i = 0; i < dwnlds.length; i++) {
    dwnlds[i].parentNode.removeChild(dwnlds[i]);
    i--;
  }
}

function showItemInFolder(path) {
  var fs = require("fs");

  if (fs.existsSync(path)) {
    shell.showItemInFolder(path);
  } else {
    notif("Folder missing", "error");
  }
}

function openItem(path) {
  var fs = require("fs");

  if (fs.existsSync(path)) {
    shell.openItem(path);
  } else {
    notif("File missing", "error");
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
  ipcRenderer.send('request-notf', Data)
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
  createDownload(arg.index, arg.name, arg.url);
});
ipcRenderer.on('action-create-stopped-download', (event, arg) => {
  createStoppedDownload(arg.index, arg.name, arg.url, arg.path);
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
      var search = document.getElementById("search").value;
      var elements = document.getElementsByClassName('download');
      for(var i = 0; i < elements.length; i++) {
        var labels = elements[i].getElementsByClassName('download-label');
        var text = labels[0].innerHTML + " " + labels[1].innerHTML + " " + labels[2].innerHTML;
        if(text.indexOf(search) != -1) {
          elements[i].style.display = "inline-block";
        } else {
          elements[i].style.display = "none";
        }
      }
    } else {
      var elements = document.getElementsByClassName('download');
      for(var i = 0; i < elements.length; i++) {
        elements[i].style.display = "block";
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