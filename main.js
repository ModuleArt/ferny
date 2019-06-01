/*
.##.....##....###....####.##....##
.###...###...##.##....##..###...##
.####.####..##...##...##..####..##
.##.###.##.##.....##..##..##.##.##
.##.....##.#########..##..##..####
.##.....##.##.....##..##..##...###
.##.....##.##.....##.####.##....##
*/

const { ipcMain, app, Menu, MenuItem, BrowserWindow } = require('electron');
const { autoUpdater } = require("electron-updater")
const os = require('os');
const path = require('path');

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

/*
..######..####.##....##..######...##.......########....####.##....##..######..########....###....##....##..######..########
.##....##..##..###...##.##....##..##.......##...........##..###...##.##....##....##......##.##...###...##.##....##.##......
.##........##..####..##.##........##.......##...........##..####..##.##..........##.....##...##..####..##.##.......##......
..######...##..##.##.##.##...####.##.......######.......##..##.##.##..######.....##....##.....##.##.##.##.##.......######..
.......##..##..##..####.##....##..##.......##...........##..##..####.......##....##....#########.##..####.##.......##......
.##....##..##..##...###.##....##..##.......##...........##..##...###.##....##....##....##.....##.##...###.##....##.##......
..######..####.##....##..######...########.########....####.##....##..######.....##....##.....##.##....##..######..########
*/

const gotTheLock  = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}

/*
.##.....##....###....########..####....###....########..##.......########..######.
.##.....##...##.##...##.....##..##....##.##...##.....##.##.......##.......##....##
.##.....##..##...##..##.....##..##...##...##..##.....##.##.......##.......##......
.##.....##.##.....##.########...##..##.....##.########..##.......######....######.
..##...##..#########.##...##....##..#########.##.....##.##.......##.............##
...##.##...##.....##.##....##...##..##.....##.##.....##.##.......##.......##....##
....###....##.....##.##.....##.####.##.....##.########..########.########..######.
*/

const sideMenu = Menu.buildFromTemplate([
 { label: 'Tab', icon: app.getAppPath() + '\\imgs\\icons16\\tab.png', submenu: [
   { label: 'New tab', icon: app.getAppPath() + '\\imgs\\icons16\\create.png', accelerator: 'CmdOrCtrl+T', click: () => { mainWindow.webContents.send('action-tab-newtab'); } },
   { label: 'New private tab', accelerator: 'CmdOrCtrl+Shift+T', click: () => {  }, enabled: false },
   { type: 'separator' },
   { label: 'Reload', icon: app.getAppPath() + '\\imgs\\icons16\\reload.png', accelerator: 'F5', click: () => { mainWindow.webContents.send('action-tab-reload'); } },
   { label: 'Duplicate', icon: app.getAppPath() + '\\imgs\\icons16\\copy.png', accelerator: 'CmdOrCtrl+Shift+D', click: () => { mainWindow.webContents.send('action-tab-duplicatetab'); } },
   { label: 'Mute site', accelerator: 'CmdOrCtrl+Shift+M', click: () => {  }, enabled: false },
   { type: 'separator' },
   { label: 'Close other tabs', accelerator: 'CmdOrCtrl+Shift+W', click: () => {  }, enabled: false },
   { label: 'Close tab', icon: app.getAppPath() + '\\imgs\\icons16\\close.png', accelerator: 'CmdOrCtrl+W', click: () => { mainWindow.webContents.send('action-tab-closetab'); } }
 ] },
 { type: 'separator' },
 { label: 'Bookmarks', icon: app.getAppPath() + '\\imgs\\icons16\\bookmarks.png', submenu: [
   { label: 'Bookmarks', icon: app.getAppPath() + '\\imgs\\icons16\\bookmarks.png', accelerator: 'CmdOrCtrl+B', click: () => { mainWindow.webContents.send('action-open-bookmarks'); } },
   { type: 'separator' },
   { label: 'Bookmark this page', icon: app.getAppPath() + '\\imgs\\icons16\\star.png', accelerator: 'CmdOrCtrl+Shift+B', click: () => { mainWindow.webContents.send('action-bookmark-this-page'); } },
   { label: 'Bookmark all tabs', click: () => {  }, enabled: false }
 ] },
 // { label: 'Reading list', accelerator: 'CmdOrCtrl+R', click: () => {  }, enabled: false },
 { label: 'History', accelerator: 'CmdOrCtrl+H', click: () => {  }, enabled: false },
 { label: 'Downloads', icon: app.getAppPath() + '\\imgs\\icons16\\download.png', click: () => { mainWindow.webContents.send('action-open-downloads'); } },
 // { label: 'Closed tabs', accelerator: 'CmdOrCtrl+Q', click: () => {  }, enabled: false },
 { type: 'separator' },
 { label: 'Zoom', icon: app.getAppPath() + '\\imgs\\icons16\\zoom.png', submenu: [
   { label: 'Zoom out', icon: app.getAppPath() + '\\imgs\\icons16\\zoom-out.png', accelerator: 'CmdOrCtrl+-', click: () => { mainWindow.webContents.send('action-zoom-zoomout'); } },
   { label: 'Zoom in', icon: app.getAppPath() + '\\imgs\\icons16\\zoom-in.png', accelerator: 'CmdOrCtrl+=', click: () => { mainWindow.webContents.send('action-zoom-zoomin'); } },
   { type: 'separator' },
   { label: 'Actual size', icon: app.getAppPath() + '\\imgs\\icons16\\actual-size.png', accelerator: 'CmdOrCtrl+Backspace', click: () => { mainWindow.webContents.send('action-zoom-actualsize'); } },
   { type: 'separator' },
   { label: 'Fullscreen', icon: app.getAppPath() + '\\imgs\\icons16\\fullscreen.png', accelerator: 'F11', click: () => { toggleFullscreen(); } },
 ] },
 { label: 'Edit', icon: app.getAppPath() + '\\imgs\\icons16\\edit.png', submenu: [
   { label: 'Cut', icon: app.getAppPath() + '\\imgs\\icons16\\cut.png', accelerator: 'CmdOrCtrl+X', click: () => { mainWindow.webContents.send('action-edit-cut'); } },
   { label: 'Copy', icon: app.getAppPath() + '\\imgs\\icons16\\copy.png', accelerator: 'CmdOrCtrl+C', click: () => { mainWindow.webContents.send('action-edit-copy'); } },
   { label: 'Paste', icon: app.getAppPath() + '\\imgs\\icons16\\paste.png', accelerator: 'CmdOrCtrl+V', click: () => { mainWindow.webContents.send('action-edit-paste'); } },
   { type: 'separator' },
   { label: 'Undo', icon: app.getAppPath() + '\\imgs\\icons16\\undo.png', accelerator: 'CmdOrCtrl+Z', click: () => { mainWindow.webContents.send('action-edit-undo'); } },
   { label: 'Redo', icon: app.getAppPath() + '\\imgs\\icons16\\redo.png', accelerator: 'CmdOrCtrl+Shift+Z', click: () => { mainWindow.webContents.send('action-edit-redo'); } },
   { type: 'separator' },
   { label: 'Select all', icon: app.getAppPath() + '\\imgs\\icons16\\select-all.png', accelerator: 'CmdOrCtrl+A', click: () => { mainWindow.webContents.send('action-edit-selectall'); } },
   { type: 'separator' },
   { label: 'Delete', icon: app.getAppPath() + '\\imgs\\icons16\\delete.png', accelerator: 'Backspace', click: () => { mainWindow.webContents.send('action-edit-delete'); } },
 ] },
 { label: 'Page', icon: app.getAppPath() + '\\imgs\\icons16\\page.png', submenu: [
   { label: 'Find in page', icon: app.getAppPath() + '\\imgs\\icons16\\zoom.png', accelerator: 'CmdOrCtrl+F', click: () => { mainWindow.webContents.send('action-page-findinpage'); } },
   { type: 'separator' },
   { label: 'Certificate info', accelerator: 'CmdOrCtrl+I', click: () => {  }, enabled: false },
   { type: 'separator' },
   { label: 'Print page', accelerator: 'CmdOrCtrl+P', click: () => {  }, enabled: false },
   { label: 'Save page as', accelerator: 'CmdOrCtrl+S', click: () => {  }, enabled: false },
   { label: 'Open file', accelerator: 'CmdOrCtrl+O', click: () => {  }, enabled: false },
   { label: 'Create page shortcut', click: () => {  }, enabled: false },
   { type: 'separator' },
   { label: 'Developer tools', icon: app.getAppPath() + '\\imgs\\icons16\\tools.png', accelerator: 'F12', click: () => { mainWindow.webContents.send('action-page-devtools'); } }
 ] },
 { type: 'separator' },
 { label: 'Settings', icon: app.getAppPath() + '\\imgs\\icons16\\settings.png', accelerator: 'CmdOrCtrl+Shift+S', click: () => { mainWindow.webContents.send('action-open-settings'); } },
 { label: 'Help', icon: app.getAppPath() + '\\imgs\\icons16\\help.png', submenu: [
   { label: 'Key binds', accelerator: 'CmdOrCtrl+K', click: () => {  }, enabled: false },
   { label: 'Check for updates', icon: app.getAppPath() + '\\imgs\\icons16\\reload.png', accelerator: 'CmdOrCtrl+U', click: () => { checkForUpdates(); } },
   { type: 'separator' },
   { label: 'About', icon: app.getAppPath() + '\\imgs\\icons16\\about.png', accelerator: 'CmdOrCtrl+Shift+A', click: () => { mainWindow.webContents.send('action-app-about'); } },
   { label: 'Report an issue', accelerator: 'CmdOrCtrl+Shift+I', click: () => {  }, enabled: false },
   { type: 'separator' },
 ]},
 { label: 'More', icon: app.getAppPath() + '\\imgs\\icons16\\more.png', submenu: [
   { label: 'Focus search field', icon: app.getAppPath() + '\\imgs\\icons16\\zoom.png', accelerator: 'CmdOrCtrl+Shift+F', click: () => { mainWindow.webContents.send('action-page-focussearch'); } },
   { label: 'Close active panel', icon: app.getAppPath() + '\\imgs\\icons16\\close.png', accelerator: 'Esc', click: () => { mainWindow.webContents.send('action-esc'); } },
   // { type: 'separator' },
   // { label: 'Task manager', accelerator: 'Shift+Esc', click: () => {  }, enabled: false },
 ] },
 { type: 'separator' },
 { label: 'Exit', icon: app.getAppPath() + '\\imgs\\icons16\\exit.png', accelerator: 'CmdOrCtrl+Shift+E', click: () => { app.quit(); } }
]);
const selectionMenu = Menu.buildFromTemplate([
  { label: 'Copy', icon: app.getAppPath() + '\\imgs\\icons16\\copy.png', accelerator: 'CmdOrCtrl+C', click: () => { mainWindow.webContents.copy(); } },
  { type: 'separator' },
  { label: 'Select all', icon: app.getAppPath() + '\\imgs\\icons16\\select-all.png', accelerator: 'CmdOrCtrl+A', click: () => { mainWindow.webContents.selectAll(); } },
]);
const inputMenu = Menu.buildFromTemplate([
  { label: 'Cut', icon: app.getAppPath() + '\\imgs\\icons16\\cut.png', accelerator: 'CmdOrCtrl+X', click: () => { mainWindow.webContents.cut(); } },
  { label: 'Copy', icon: app.getAppPath() + '\\imgs\\icons16\\copy.png', accelerator: 'CmdOrCtrl+C', click: () => { mainWindow.webContents.copy(); } },
  { label: 'Paste', icon: app.getAppPath() + '\\imgs\\icons16\\paste.png', accelerator: 'CmdOrCtrl+V', click: () => { mainWindow.webContents.paste(); } },
  { type: 'separator' },
  { label: 'Undo', icon: app.getAppPath() + '\\imgs\\icons16\\undo.png', accelerator: 'CmdOrCtrl+Z', click: () => { mainWindow.webContents.undo(); } },
  { label: 'Redo', icon: app.getAppPath() + '\\imgs\\icons16\\redo.png', accelerator: 'CmdOrCtrl+Shift+Z', click: () => { mainWindow.webContents.redo(); } },
  { type: 'separator' },
  { label: 'Select all', icon: app.getAppPath() + '\\imgs\\icons16\\select-all.png', accelerator: 'CmdOrCtrl+A', click: () => { mainWindow.webContents.selectAll(); } },
  { type: 'separator' },
  { label: 'Delete', icon: app.getAppPath() + '\\imgs\\icons16\\delete.png', accelerator: 'Backspace', click: () => { mainWindow.webContents.delete(); } },
]);

var mainWindow = null;
var welcomeWindow = null;

var themeColor = "rgb(255, 255, 255)";
var borderRadius = '4';

var downloadsArray = [];
var curDownloadNum = 0;

var welcomeOn = 1;

app.on('ready', function() {

/*
....###....##.....##.########..#######.....##.....##.########..########.....###....########.########.########.
...##.##...##.....##....##....##.....##....##.....##.##.....##.##.....##...##.##......##....##.......##.....##
..##...##..##.....##....##....##.....##....##.....##.##.....##.##.....##..##...##.....##....##.......##.....##
.##.....##.##.....##....##....##.....##....##.....##.########..##.....##.##.....##....##....######...########.
.#########.##.....##....##....##.....##....##.....##.##........##.....##.#########....##....##.......##...##..
.##.....##.##.....##....##....##.....##....##.....##.##........##.....##.##.....##....##....##.......##....##.
.##.....##..#######.....##.....#######......#######..##........########..##.....##....##....########.##.....##
*/

  autoUpdater.logger = require("electron-log");
  autoUpdater.logger.transports.file.level = "info";

  autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('action-notif', { type: "info", text: "Checking for updates..." });
  });
  autoUpdater.on('error', () => {
    mainWindow.webContents.send('action-notif', { type: "error", text: "Update error!" });
  });
  autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('action-notif', { type: "success", text: "App is up to date!" });
  });
  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('action-notif', { type: "success", text: "Update is available! Download started..." });
  });
  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('action-quest', { text: "Update is downloaded!", ops: [{ text:'Install', icon:'install', click:'installUpdate(); removeNotif(this)' }, { text:'Cancel', icon:'close3', click:'removeNotif(this)' }] });
  });

/*
.##.....##....###....####.##....##....##......##.####.##....##.########...#######..##......##
.###...###...##.##....##..###...##....##..##..##..##..###...##.##.....##.##.....##.##..##..##
.####.####..##...##...##..####..##....##..##..##..##..####..##.##.....##.##.....##.##..##..##
.##.###.##.##.....##..##..##.##.##....##..##..##..##..##.##.##.##.....##.##.....##.##..##..##
.##.....##.#########..##..##..####....##..##..##..##..##..####.##.....##.##.....##.##..##..##
.##.....##.##.....##..##..##...###....##..##..##..##..##...###.##.....##.##.....##.##..##..##
.##.....##.##.....##.####.##....##.....###..###..####.##....##.########...#######...###..###.
*/

  mainWindow = new BrowserWindow({
    width: 1000, height: 640,
    minWidth: 480, minHeight: 320,
    frame: false,
    show: false,
    icon: app.getAppPath() + '\\imgs\\icon.ico',
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true
    },
    backgroundColor: 'rgb(0, 0, 0)'
  });
  mainWindow.setMenu(sideMenu);

  // mainWindow.webContents.openDevTools();
  mainWindow.loadFile(app.getAppPath() + '\\index.html');

  mainWindow.webContents.on('context-menu', (e, props) => {
    const { selectionText, isEditable } = props;
    if (isEditable) {
      inputMenu.popup(mainWindow);
    } else if (selectionText && selectionText.trim() !== '') {
      selectionMenu.popup(mainWindow);
    }
  });

  mainWindow.on('focus', () => {
    mainWindow.webContents.send('action-focus-window');
  });
  mainWindow.on('blur', () => {
    mainWindow.webContents.send('action-blur-window');
  });
  mainWindow.once('ready-to-show', () => {
    // loadAllData();
    // mainWindow.show();
  });
  mainWindow.webContents.once('did-finish-load', () => {
    loadAllData();
    mainWindow.show();

    var data = null;
    if (process.platform == 'win32' && process.argv.length >= 2) {
      var openFilePath = process.argv[1];
      // data = fs.readFileSync(openFilePath, 'utf-8');
      // tabGroup.getActiveTab().webview.src = openFilePath;
      mainWindow.webContents.send('action-open-url', openFilePath);
      // console.log(process.argv);
    }
  });
  mainWindow.on('resize', () => {
    mainWindow.webContents.send('action-resize-tabs');
  });
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('action-maximize-window');
  });
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('action-unmaximize-window');
  });
  mainWindow.on('close', function(event) {
    event.preventDefault();

    var download = false;
    for (var i = 0; i < downloadsArray.length; i++) {
      try {
        if(downloadsArray[i].item.getState() == "progressing") {
          download = true;
          break;
        }
      } catch (e) {

      }
    }
    if(download) {
      mainWindow.webContents.send('action-quest', { text: "Download is in progress! Exit anyway?", ops: [{ text:'Continue', icon:'download', click:'removeNotif(this)' }, { text:'Exit', icon:'exit', click:'exitAppAnyway()' }] });
    } else {
      saveBounds();
      app.exit();
    }
  });

  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    curDownloadNum++;

    let curnum = curDownloadNum;

    let Item = {
      index: curnum,
      item: item,
      url: item.getURL(),
      name: item.getFilename(),
      path: ""
    };

    downloadsArray.push(Item);
    saveDownloads();

    let Data = {
      index: curnum,
      url: item.getURL(),
      name: item.getFilename()
    };

    mainWindow.webContents.send('action-create-download', Data);

    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        let Data = {
          index: curnum,
          name: item.getFilename()
        };
        mainWindow.webContents.send('action-set-download-status-interrupted', Data);
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          let Data = {
            index: curnum,
            bytes: item.getReceivedBytes(),
            total: item.getTotalBytes(),
            name: item.getFilename()
          };
          mainWindow.webContents.send('action-set-download-status-pause', Data);
        } else {
          let Data = {
            index: curnum,
            bytes: item.getReceivedBytes(),
            total: item.getTotalBytes(),
            name: item.getFilename()
          };
          mainWindow.webContents.send('action-set-download-process', Data);
        }
      }
    });

    item.once('done', (event, state) => {
      if (state === 'completed') {
        let Data = {
          index: curnum,
          name: item.getFilename(),
          path: item.getSavePath()
        };
        mainWindow.webContents.send('action-set-download-status-done', Data);
        var i;
        for(i = 0; i < downloadsArray.length; i++) {
          if(downloadsArray[i].index == curnum) {
            downloadsArray[i].path = item.getSavePath();
            saveDownloads();
          }
        }
      } else {
        let Data = {
          index: curnum,
          state: state,
          name: item.getFilename(),
          url: item.getURL()
        };
        mainWindow.webContents.send('action-set-download-status-failed', Data);
      }
    });
  });
});

/*
.####.########...######.....##.....##....###....####.##....##
..##..##.....##.##....##....###...###...##.##....##..###...##
..##..##.....##.##..........####.####..##...##...##..####..##
..##..########..##..........##.###.##.##.....##..##..##.##.##
..##..##........##..........##.....##.#########..##..##..####
..##..##........##....##....##.....##.##.....##..##..##...###
.####.##.........######.....##.....##.##.....##.####.##....##
*/

ipcMain.on('request-notif', (event, arg) => {
  mainWindow.webContents.send('action-notif', arg);
});

ipcMain.on('request-open-url', (event, arg) => {
  mainWindow.webContents.send('action-open-url', arg);
});

ipcMain.on('request-open-settings', (event, arg) => {
  mainWindow.webContents.send('action-open-settings');
});

ipcMain.on('request-clear-downloads', (event, arg) => {
  downloadsArray = [];
  saveDownloads();
  mainWindow.webContents.send('action-clear-downloads');
});

ipcMain.on('request-set-about', (event, arg) => {
  let Data = {
    app: app.getVersion() + " / " + os.arch()
  };

  event.sender.send('action-set-about', Data);
});

ipcMain.on('request-check-for-updates', (event, arg) => {
  checkForUpdates();
});

ipcMain.on('request-tabs-list', (event, arg) => {
  let m = new Menu();
  for(let i = 0; i < arg.length; i++) {
    let mi = new MenuItem({
      type: 'checkbox',
      label: "[" + (i + 1) + "] " + arg[i].label,
      checked: arg[i].active,
      click: () => { mainWindow.webContents.send('action-activate-tab', i); }
    });
    m.append(mi);
  }
  m.popup(mainWindow);
});

ipcMain.on('request-tab-menu', (event, arg) => {
  let tabMenu = Menu.buildFromTemplate([
    { label: 'Reload', icon: app.getAppPath() + '\\imgs\\icons16\\reload.png', accelerator: 'F5', click: () => { mainWindow.webContents.send('action-tabcontext-reload', arg); } },
    { label: 'Duplicate', icon: app.getAppPath() + '\\imgs\\icons16\\copy.png', accelerator: 'CmdOrCtrl+Shift+D', click: () => { mainWindow.webContents.send('action-tabcontext-duplicatetab', arg); } },
    { label: 'Mute site', accelerator: 'CmdOrCtrl+Shift+M', click: () => {  }, enabled: false },
    { type: 'separator' },
    { label: 'Close other tabs', accelerator: 'CmdOrCtrl+Shift+W', click: () => {  }, enabled: false },
    { label: 'Close tab', icon: app.getAppPath() + '\\imgs\\icons16\\close.png', accelerator: 'CmdOrCtrl+W', click: () => { mainWindow.webContents.send('action-tabcontext-closetab', arg); } }
  ]);
  tabMenu.popup(mainWindow);
});

ipcMain.on('request-side-menu', (event, arg) => {
  sideMenu.popup(mainWindow);
});

ipcMain.on('request-tab-reload', (event, arg) => {
  mainWindow.webContents.send('action-tab-reload');
});

ipcMain.on('request-tab-goback', (event, arg) => {
  mainWindow.webContents.send('action-tab-goback');
});

ipcMain.on('request-resume-download', (event, arg) => {
  var i;
  for(i = 0; i < downloadsArray.length; i++) {
    if(downloadsArray[i].index == arg) {
      downloadsArray[i].item.resume();
    }
  }
});

ipcMain.on('request-pause-download', (event, arg) => {
  var i;
  for(i = 0; i < downloadsArray.length; i++) {
    if(downloadsArray[i].index == arg) {
      downloadsArray[i].item.pause();
    }
  }
});

ipcMain.on('request-cancel-download', (event, arg) => {
  var i;
  for(i = 0; i < downloadsArray.length; i++) {
    if(downloadsArray[i].index == arg) {
      downloadsArray[i].item.cancel();
    }
  }
});

ipcMain.on('request-remove-download', (event, arg) => {
  var i;
  for(i = 0; i < downloadsArray.length; i++) {
    if(downloadsArray[i].index == arg) {
      downloadsArray.splice(i, 1);
    }
  }
  saveDownloads();
});

ipcMain.on('request-quit-app', (event, arg) => {
  app.quit();
});

ipcMain.on('request-exit-app-anyway', (event, arg) => {
  app.exit();
});

ipcMain.on('request-minimize-window', (event, arg) => {
  mainWindow.minimize();
});

ipcMain.on('request-maximize-window', (event, arg) => {
  mainWindow.maximize();
});

ipcMain.on('request-unmaximize-window', (event, arg) => {
  mainWindow.unmaximize();
});

ipcMain.on('request-change-theme', (event, arg) => {
  themeColor = arg;
  mainWindow.webContents.send('action-change-theme', arg);
  saveTheme();
});

ipcMain.on('request-change-border-radius', (event, arg) => {
  borderRadius = arg;
  mainWindow.webContents.send('action-change-border-radius', arg);
  saveBorderRadius();
});

ipcMain.on('request-toggle-fullscreen', (event, arg) => {
  toggleFullscreen();
});

ipcMain.on('request-close-welcome', (event, arg) => {
  welcomeWindow.close();
});

/*
.########.##.....##.##....##..######..########.####..#######..##....##..######.
.##.......##.....##.###...##.##....##....##.....##..##.....##.###...##.##....##
.##.......##.....##.####..##.##..........##.....##..##.....##.####..##.##......
.######...##.....##.##.##.##.##..........##.....##..##.....##.##.##.##..######.
.##.......##.....##.##..####.##..........##.....##..##.....##.##..####.......##
.##.......##.....##.##...###.##....##....##.....##..##.....##.##...###.##....##
.##........#######..##....##..######.....##....####..#######..##....##..######.
*/

function toggleFullscreen() {
  if(mainWindow.isFullScreen()) {
    mainWindow.setFullScreen(false);
  } else {
    mainWindow.setFullScreen(true);
  }
  mainWindow.webContents.send('action-toggle-fullscreen', mainWindow.isFullScreen());
}

function checkForUpdates() {
  autoUpdater.checkForUpdates();
}

function showWelcomeWindow() {
  welcomeWindow = new BrowserWindow({
    width: 480, height: 360,
    frame: false,
    show: false,
    modal: true,
    parent: mainWindow,
    icon: app.getAppPath() + '\\imgs\\icon.ico',
    minimizable: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    },
    backgroundColor: 'rgb(0, 0, 0)'
  }); 

  welcomeWindow.setMenu(null);

  welcomeWindow.on('focus', () => {
    welcomeWindow.webContents.send('action-focus-window');
  });
  welcomeWindow.on('blur', () => {
    welcomeWindow.webContents.send('action-blur-window');
  });

  welcomeWindow.loadFile(app.getAppPath() + '\\welcome.html');

  welcomeWindow.webContents.once('did-finish-load', () => {
    // welcomeWindow.webContents.openDevTools();
    welcomeWindow.show();
  });
}

/*
.########.....###....########....###........######.....###....##.....##.########..######.
.##.....##...##.##......##......##.##......##....##...##.##...##.....##.##.......##....##
.##.....##..##...##.....##.....##...##.....##........##...##..##.....##.##.......##......
.##.....##.##.....##....##....##.....##.....######..##.....##.##.....##.######....######.
.##.....##.#########....##....#########..........##.#########..##...##..##.............##
.##.....##.##.....##....##....##.....##....##....##.##.....##...##.##...##.......##....##
.########..##.....##....##....##.....##.....######..##.....##....###....########..######.
*/

function saveAllData() {
  saveDownloads();
  // saveBookmarks();
  saveTheme();
  saveBorderRadius();
}

function saveDownloads() {
  var fs = require('fs');
  fs.writeFileSync(app.getPath('userData') + "\\json\\curdownloadnum.json", curDownloadNum);
  fs.writeFileSync(app.getPath('userData') + "\\json\\downloads.json", JSON.stringify(downloadsArray));
  console.log("saved DOWNLOADS:");
  console.log(downloadsArray);
}

function saveBorderRadius() {
  var fs = require('fs');
  fs.writeFileSync(app.getPath('userData') + "\\json\\radius.json", borderRadius);
  console.log("saved BORDERRADIUS: " + borderRadius);
}

function saveTheme() {
  var fs = require('fs');
  fs.writeFileSync(app.getPath('userData') + "\\json\\theme.json", themeColor);
  console.log("saved THEMECOLOR: " + themeColor);
}

function saveBounds() {
  var fs = require('fs');

  let Data = {
    x: mainWindow.getBounds().x,
    y: mainWindow.getBounds().y,
    width: mainWindow.getBounds().width,
    height: mainWindow.getBounds().height,
    maximize: mainWindow.isMaximized()
  }

  fs.writeFileSync(app.getPath('userData') + "\\json\\bounds.json", JSON.stringify(Data));
}

/*
.########.....###....########....###.......##........#######.....###....########.
.##.....##...##.##......##......##.##......##.......##.....##...##.##...##.....##
.##.....##..##...##.....##.....##...##.....##.......##.....##..##...##..##.....##
.##.....##.##.....##....##....##.....##....##.......##.....##.##.....##.##.....##
.##.....##.#########....##....#########....##.......##.....##.#########.##.....##
.##.....##.##.....##....##....##.....##....##.......##.....##.##.....##.##.....##
.########..##.....##....##....##.....##....########..#######..##.....##.########.
*/

function loadAllData() {
  var fs = require("fs");

  if(fs.existsSync(app.getPath('userData') + "\\json")) {
    loadWelcome();
    loadBounds();
    loadTheme();
    loadBorderRadius();
    loadDownloads();
  } else {
    fs.mkdirSync(app.getPath('userData') + "\\json");
    saveAllData();
  }
}

function loadDownloads() {
  var fs = require("fs");

  try {
    curDownloadNum = fs.readFileSync(app.getPath('userData') + "\\json\\curdownloadnum.json");

    var jsonstr = fs.readFileSync(app.getPath('userData') + "\\json\\downloads.json");
    var arr = JSON.parse(jsonstr);

    var start = arr.length - 5;
    if(start < 0) {
      start = 0;
    }

    for (var i = start; i < arr.length; i++) {
      let Item = {
        index: arr[i].index,
        url: arr[i].url,
        name: arr[i].name,
        path: arr[i].path
      };
      downloadsArray.push(Item);
      mainWindow.webContents.send('action-create-stopped-download', Item);
    }
  } catch(err) {
    mainWindow.webContents.send('action-notif', { type: "error", text: "Downloads read file error!" });
  }
}

function loadWelcome() {
  var fs = require("fs");

  try {
    welcomeOn = fs.readFileSync(app.getPath('userData') + "\\json\\welcome.json");
    if(welcomeOn == 1) {
      showWelcomeWindow();
    }
  } catch (e) {
    showWelcomeWindow();
  }
}

function loadBounds() {
  var fs = require("fs");

  try {
    let Data = JSON.parse(fs.readFileSync(app.getPath('userData') + "\\json\\bounds.json"));

    if(Data.maximize == true) {
      mainWindow.maximize();
    } else {
      mainWindow.setBounds({
        x: Data.x,
        y: Data.y,
        width: Data.width,
        height: Data.height
      });
    }
  } catch (e) {

  }
}

function loadTheme() {
  var fs = require("fs");

  try {
    themeColor = fs.readFileSync(app.getPath('userData') + "\\json\\theme.json");
    mainWindow.webContents.send('action-change-theme', themeColor);
  } catch (e) {

  }
}

function loadBorderRadius() {
  var fs = require("fs");

  try {
    borderRadius = fs.readFileSync(app.getPath('userData') + "\\json\\radius.json");
    mainWindow.webContents.send('action-change-border-radius', borderRadius);
  } catch (e) {

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
