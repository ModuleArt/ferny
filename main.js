/*
.##.....##....###....####.##....##
.###...###...##.##....##..###...##
.####.####..##...##...##..####..##
.##.###.##.##.....##..##..##.##.##
.##.....##.#########..##..##..####
.##.....##.##.....##..##..##...###
.##.....##.##.....##.####.##....##
*/

const { ipcMain, app, Menu, MenuItem, BrowserWindow, dialog, systemPreferences } = require('electron');
const { autoUpdater } = require("electron-updater")
const os = require('os');
const prependFile = require('prepend-file');
const fs = require("fs");
const ppath = require('persist-path')('Ferny');

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
  { label: 'New tab', icon: app.getAppPath() + '\\imgs\\icons16\\create.png', accelerator: 'CmdOrCtrl+T', click: () => { mainWindow.webContents.send('action-tab-newtab'); } },
  //  { label: 'New private tab', accelerator: 'CmdOrCtrl+Shift+T', click: () => {  }, enabled: false },
  { type: 'separator' },
  { label: 'Active tab', icon: app.getAppPath() + '\\imgs\\icons16\\tab.png', submenu: [
    { label: 'Back', accelerator: 'Alt+Left', icon: app.getAppPath() + '\\imgs\\icons16\\back.png', click: () => { mainWindow.webContents.send('action-tab-back'); } },
    { label: 'Forward', accelerator: 'Alt+Right', icon: app.getAppPath() + '\\imgs\\icons16\\forward.png', click: () => { mainWindow.webContents.send('action-tab-forward'); } },
    { label: 'Reload', icon: app.getAppPath() + '\\imgs\\icons16\\reload.png', accelerator: 'F5', click: () => { mainWindow.webContents.send('action-tab-reload'); } },
    { type: 'separator' },
    { label: 'Duplicate', icon: app.getAppPath() + '\\imgs\\icons16\\copy.png', accelerator: 'CmdOrCtrl+Shift+D', click: () => { mainWindow.webContents.send('action-tab-duplicatetab'); } },
    { label: 'Copy URL', icon: app.getAppPath() + '\\imgs\\icons16\\copy-link.png', accelerator: 'CmdOrCtrl+Shift+C', click: () => { mainWindow.webContents.send('action-tab-copyurl'); } },
    { label: 'Go home', icon: app.getAppPath() + '\\imgs\\icons16\\home.png', accelerator: 'CmdOrCtrl+Shift+H', click: () => { mainWindow.webContents.send('action-tab-gohome'); } },
    { type: 'separator' },
    { label: 'Picture in picture', icon: app.getAppPath() + '\\imgs\\icons16\\picture-in.png', accelerator: 'CmdOrCtrl+Shift+P', click: () => { mainWindow.webContents.send('action-tab-picturein'); } },
    // { type: 'separator' },
    // { label: 'Mute site', accelerator: 'CmdOrCtrl+Shift+M', click: () => {  }, enabled: false },
    { type: 'separator' },
    { label: 'Close to the right', icon: app.getAppPath() + '\\imgs\\icons16\\swipe-right.png', click: () => { mainWindow.webContents.send('action-tab-closeright'); } },
    { label: 'Close others', icon: app.getAppPath() + '\\imgs\\icons16\\broom.png', accelerator: 'CmdOrCtrl+Shift+W', click: () => { mainWindow.webContents.send('action-tab-closeothers'); } },
    { label: 'Close tab', icon: app.getAppPath() + '\\imgs\\icons16\\close.png', accelerator: 'CmdOrCtrl+W', click: () => { mainWindow.webContents.send('action-tab-closetab'); } }
 ] },
 { type: 'separator' },
 { label: 'Bookmarks', icon: app.getAppPath() + '\\imgs\\icons16\\bookmarks.png', submenu: [
   { label: 'Bookmark manager', icon: app.getAppPath() + '\\imgs\\icons16\\bookmarks.png', accelerator: 'CmdOrCtrl+B', click: () => { mainWindow.webContents.send('action-open-bookmarks'); } },
   { type: 'separator' },
   { label: 'Bookmark this page', icon: app.getAppPath() + '\\imgs\\icons16\\star.png', accelerator: 'CmdOrCtrl+Shift+B', click: () => { mainWindow.webContents.send('action-bookmark-this-page'); } },
   { label: 'Bookmark all tabs', click: () => {  }, enabled: false }
 ] },
 // { label: 'Reading list', accelerator: 'CmdOrCtrl+R', click: () => {  }, enabled: false },
 { label: 'History', accelerator: 'CmdOrCtrl+H', icon: app.getAppPath() + '\\imgs\\icons16\\history.png', click: () => { mainWindow.webContents.send('action-open-history'); } },
 { label: 'Downloads', accelerator: 'CmdOrCtrl+D', icon: app.getAppPath() + '\\imgs\\icons16\\download.png', click: () => { mainWindow.webContents.send('action-open-downloads'); } },
 // { label: 'Closed tabs', accelerator: 'CmdOrCtrl+Q', click: () => {  }, enabled: false },
 { type: 'separator' },
 { label: 'Zoom', icon: app.getAppPath() + '\\imgs\\icons16\\zoom.png', submenu: [
   { label: 'Zoom out', icon: app.getAppPath() + '\\imgs\\icons16\\zoom-out.png', accelerator: 'CmdOrCtrl+-', click: () => { mainWindow.webContents.send('action-zoom-zoomout'); } },
   { label: 'Zoom in', icon: app.getAppPath() + '\\imgs\\icons16\\zoom-in.png', accelerator: 'CmdOrCtrl+=', click: () => { mainWindow.webContents.send('action-zoom-zoomin'); } },
   { type: 'separator' },
   { label: 'Actual size', icon: app.getAppPath() + '\\imgs\\icons16\\actual-size.png', accelerator: 'CmdOrCtrl+0', click: () => { mainWindow.webContents.send('action-zoom-actualsize'); } },
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
   { label: 'Find in page', icon: app.getAppPath() + '\\imgs\\icons16\\find-in-page.png', accelerator: 'CmdOrCtrl+F', click: () => { mainWindow.webContents.send('action-page-findinpage'); } },
   { type: 'separator' },
   { label: 'Certificate info', icon: app.getAppPath() + '\\imgs\\icons16\\certificate.png', accelerator: 'CmdOrCtrl+I', click: () => { mainWindow.webContents.send('action-page-certificate'); } },
   { type: 'separator' },
  //  { label: 'Print page', accelerator: 'CmdOrCtrl+P', click: () => {  }, enabled: false },
  //  { label: 'Save page as', icon: app.getAppPath() + '\\imgs\\icons16\\save.png', accelerator: 'CmdOrCtrl+S', click: () => { mainWindow.webContents.send('action-page-saveas'); } },
  //  { label: 'Create page shortcut', accelerator: 'CmdOrCtrl+Shift+S', click: () => {  }, enabled: false },
    { label: 'Open file', icon: app.getAppPath() + '\\imgs\\icons16\\open.png', accelerator: 'CmdOrCtrl+O', click: () => { openFileDialog(); } },
   { type: 'separator' },
   { label: 'View page source', icon: app.getAppPath() + '\\imgs\\icons16\\code.png', accelerator: 'CmdOrCtrl+U', click: () => { mainWindow.webContents.send('action-page-viewsource'); } },
   { label: 'Developer tools', icon: app.getAppPath() + '\\imgs\\icons16\\tools.png', accelerator: 'F12', click: () => { mainWindow.webContents.send('action-page-devtools'); } }
 ] },
 { type: 'separator' },
 { label: 'Settings', icon: app.getAppPath() + '\\imgs\\icons16\\settings.png', accelerator: 'CmdOrCtrl+,', click: () => { mainWindow.webContents.send('action-open-settings'); } },
 { label: 'Help', icon: app.getAppPath() + '\\imgs\\icons16\\help.png', submenu: [
   { label: 'Check for updates', icon: app.getAppPath() + '\\imgs\\icons16\\reload.png', accelerator: 'CmdOrCtrl+Shift+U', click: () => { checkForUpdates(); } },
   { type: 'separator' },
   { label: 'About', icon: app.getAppPath() + '\\imgs\\icons16\\about.png', accelerator: 'F2', click: () => { mainWindow.webContents.send('action-app-about'); } },
   { label: 'Hotkeys', icon: app.getAppPath() + '\\imgs\\icons16\\keyboard.png', accelerator: 'F1', click: () => { showKeyBindsWindow(); } },
   { label: 'Welcome', icon: app.getAppPath() + '\\imgs\\icons16\\startup.png', accelerator: 'F7', click: () => { showWelcomeWindow(); } },
   { type: 'separator' },
   { label: 'Report an issue', icon: app.getAppPath() + '\\imgs\\icons16\\bug.png', accelerator: 'CmdOrCtrl+Shift+I', click: () => { mainWindow.webContents.send('action-open-url-in-new-tab', 'https://github.com/ModuleArt/ferny/issues'); } }
 ]},
 { label: 'More', icon: app.getAppPath() + '\\imgs\\icons16\\more.png', submenu: [
  // { label: 'Clear browsing data', accelerator: 'CmdOrCtrl+Shift+Delete', click: () => {  }, enabled: false },
  // { type: 'separator' },
  { label: 'Toggle sidebar', icon: app.getAppPath() + '\\imgs\\icons16\\sidebar.png', accelerator: 'F3', click: () => { mainWindow.webContents.send('action-toggle-sidebar'); } },
  { label: 'Focus address bar', icon: app.getAppPath() + '\\imgs\\icons16\\zoom.png', accelerator: 'F6', click: () => { mainWindow.webContents.send('action-page-focussearch'); } },
  { label: 'Close active panel', icon: app.getAppPath() + '\\imgs\\icons16\\close.png', accelerator: 'Esc', click: () => { mainWindow.webContents.send('action-esc'); } },
  { type: 'separator' },
  { label: 'Developer [Danger]', icon: app.getAppPath() + '\\imgs\\icons16\\developer.png', submenu: [
    { label: 'Developer mode (Sidebar)', icon: app.getAppPath() + '\\imgs\\icons16\\sidebar.png', accelerator: 'CmdOrCtrl+Shift+F11', click: () => { mainWindow.webContents.send('action-sidebar-devtools'); } },
    { label: 'Developer mode (Browser)', icon: app.getAppPath() + '\\imgs\\icons16\\web.png', accelerator: 'CmdOrCtrl+Shift+F12', click: () => { mainWindow.webContents.openDevTools(); } }
  ] },
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
var keyBindsWindow = null;
var pageInfoWindow = null;

var downloadsArray = [];
var curDownloadNum = 0;

var startPage = "https://duckduckgo.com/";
var searchEngine = "duckduckgo";

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

  // autoUpdater.autoDownload = false;
  // autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.logger = require("electron-log");
  autoUpdater.logger.transports.file.level = "info";

  autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('action-notif', { type: "info", text: "Checking for updates..." });
  });

  autoUpdater.on('error', (error) => {
    mainWindow.webContents.send('action-notif', { type: "error", text: "Update error: " + error });
  });

  autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('action-notif', { type: "success", text: "App is up to date!" });
  });

  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('action-loader', { text: "Downloading update: v" + info.version, id: "update-0" });
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('action-quest', { text: "Update is downloaded!", ops: [{ text:'Install now', icon:'check', click:'installUpdate();' }] });
  });

  autoUpdater.on('download-progress', (progress, bytesPerSecond, percent, total, transferred) => {
    console.log(progress);
    console.log(percent);
    mainWindow.webContents.send('action-update-loader', { percent: percent, id: 'update-0' });
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
    width: 1280, height: 720,
    minWidth: 480, minHeight: 240,
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
  mainWindow.loadFile(app.getAppPath() + '\\html\\browser.html');

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

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('action-maximize-window');
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('action-unmaximize-window');
  });

  mainWindow.webContents.once('did-finish-load', () => {
    loadAllData();
    mainWindow.show();

    if (process.platform == 'win32' && process.argv.length >= 2) {
      var openFilePath = process.argv[1];
      mainWindow.webContents.send('action-open-url', openFilePath);
    }
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

/*
.########...#######..##......##.##....##.##........#######.....###....########...######.
.##.....##.##.....##.##..##..##.###...##.##.......##.....##...##.##...##.....##.##....##
.##.....##.##.....##.##..##..##.####..##.##.......##.....##..##...##..##.....##.##......
.##.....##.##.....##.##..##..##.##.##.##.##.......##.....##.##.....##.##.....##..######.
.##.....##.##.....##.##..##..##.##..####.##.......##.....##.#########.##.....##.......##
.##.....##.##.....##.##..##..##.##...###.##.......##.....##.##.....##.##.....##.##....##
.########...#######...###..###..##....##.########..#######..##.....##.########...######.
*/

  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    curDownloadNum++;

    let curnum = curDownloadNum;

    let Item = {
      index: curnum,
      item: item,
      url: item.getURL(),
      name: item.getFilename(),
      path: "",
      time: item.getStartTime()
    };

    downloadsArray.push(Item);
    saveDownloads();

    let Data = {
      index: curnum,
      url: item.getURL(),
      name: item.getFilename(),
      time: item.getStartTime()
    };

    console.log(item.getStartTime());

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

// ipcMain.on('request-save-as-page', (event, arg) => {
//   let saveAsWindow = new BrowserWindow({
//     show: false
//   });

//   saveAsWindow.loadURL(arg);
  
//   saveAsWindow.webContents.on('did-finish-load', () => {
//     saveAsWindow.show();
//     dialog.showSaveDialog(saveAsWindow, { title: "Save page as" }, (filename, bookmark) => {
//       if(typeof(filename) != "undefined") {
//         saveAsWindow.webContents.savePage(filename, 'HTMLComplete', (error) => {
//           if (error) {  
//             console.log('error');
//           } else {
//             console.log('success');
//           }
//         });
//       } else {
//         console.log('undefined');
//       }
//     });
//   });
// });

ipcMain.on('request-webview-zoomin', (event, arg) => {
  mainWindow.webContents.send('action-zoom-zoomin');
});

ipcMain.on('request-webview-zoomout', (event, arg) => {
  mainWindow.webContents.send('action-zoom-zoomout');
});

ipcMain.on('request-webview-contextmenu', (event, arg) => {
  console.log(arg);
  let webviewMenu = Menu.buildFromTemplate([
    { label: 'Type: ' + arg.type, enabled: false },
    { type: 'separator' },
    { label: 'Back', accelerator: 'Alt+Left', icon: app.getAppPath() + '\\imgs\\icons16\\back.png', click: () => { mainWindow.webContents.send('action-tab-back'); } },
    { label: 'Forward', accelerator: 'Alt+Right', icon: app.getAppPath() + '\\imgs\\icons16\\forward.png', click: () => { mainWindow.webContents.send('action-tab-forward'); } },
    { label: 'Reload', accelerator: 'F5', icon: app.getAppPath() + '\\imgs\\icons16\\reload.png', click: () => { mainWindow.webContents.send('action-tab-reload'); } },
    { type: 'separator' },
    { label: 'View page source', icon: app.getAppPath() + '\\imgs\\icons16\\code.png', accelerator: 'CmdOrCtrl+U', click: () => { mainWindow.webContents.send('action-page-viewsource'); } },
    { label: 'Inspect element', icon: app.getAppPath() + '\\imgs\\icons16\\inspect.png', click: () => { mainWindow.webContents.send('action-page-inspect', arg); } }
  ]);
  webviewMenu.popup(mainWindow);
});

ipcMain.on('request-info-contextmenu', (event, arg) => {
  let infoMenu = Menu.buildFromTemplate([
    { label: 'Certificate info', accelerator: 'CmdOrCtrl+I', icon: app.getAppPath() + '\\imgs\\icons16\\certificate.png', click: () => { mainWindow.webContents.send('action-page-certificate'); } }
  ]);
  infoMenu.popup(mainWindow);
});

ipcMain.on('request-home-button-contextmenu', (event, arg) => {
  let homeMenu = Menu.buildFromTemplate([
    { label: 'Home page settings', icon: app.getAppPath() + '\\imgs\\icons16\\settings.png', click: () => { mainWindow.webContents.send('action-open-settings', 'home-page'); } }
  ]);
  homeMenu.popup(mainWindow);
});

ipcMain.on('request-folder-contextmenu', (event, arg) => {
  let folderMenu = Menu.buildFromTemplate([
    { label: 'Bookmarks settings', icon: app.getAppPath() + '\\imgs\\icons16\\settings.png', click: () => { mainWindow.webContents.send('action-open-settings', 'bookmarks'); } },
    { label: 'Bookmark manager', accelerator: 'CmdOrCtrl+B', icon: app.getAppPath() + '\\imgs\\icons16\\bookmarks.png', click: () => { mainWindow.webContents.send('action-open-bookmarks'); } }
  ]);
  folderMenu.popup(mainWindow);
});

ipcMain.on('request-bookmark-contextmenu', (event, arg) => {
  let bookmarkMenu = Menu.buildFromTemplate([
    { label: 'Open in new tab', icon: app.getAppPath() + '\\imgs\\icons16\\tab.png', click: () => { mainWindow.webContents.send('action-open-url-in-new-tab', arg.url); } },
    { label: 'Copy URL', icon: app.getAppPath() + '\\imgs\\icons16\\copy-link.png', click: () => { mainWindow.webContents.send('action-copy-text', arg.url); } },
    { type: "separator" },
    { label: 'Edit', icon: app.getAppPath() + '\\imgs\\icons16\\edit.png', click: () => { mainWindow.webContents.send('action-edit-bookmark', arg); } },
    { type: "separator" },
    { label: 'Bookmarks settings', icon: app.getAppPath() + '\\imgs\\icons16\\settings.png', click: () => { mainWindow.webContents.send('action-open-settings', 'bookmarks'); } },
    { label: 'Bookmark manager', accelerator: 'CmdOrCtrl+B', icon: app.getAppPath() + '\\imgs\\icons16\\bookmarks.png', click: () => { mainWindow.webContents.send('action-open-bookmarks',); } }
  ]);
  bookmarkMenu.popup(mainWindow);
});

ipcMain.on('request-update-bookmarks-bar', (event, arg) => {
  mainWindow.webContents.send('action-update-bookmarks-bar');
});

ipcMain.on('request-update-home-page', (event, arg) => {
  mainWindow.webContents.send('action-update-home-page');
});

ipcMain.on('request-set-bookmarks-bar', (event, arg) => {
  try {
    var jsonstr = fs.readFileSync(ppath + "\\json\\bookmarksbar.json");
    let Data = JSON.parse(jsonstr);

    if(arg.on == null) {
      arg.on = Data.on;
    }
    if(arg.layout == null) {
      arg.layout = Data.layout;
    }

    mainWindow.webContents.send('action-set-bookmarks-bar', arg);
    if(!fs.existsSync(ppath + "\\json")) {
      fs.mkdirSync(ppath + "\\json");
    } 
    fs.writeFileSync(ppath + "\\json\\bookmarksbar.json", JSON.stringify(arg));

    console.log(arg);
  } catch (e) {

  }
});

ipcMain.on('request-show-certificate-info', (event, arg) => {
  showPageInfoWindow(arg);
});

ipcMain.on('request-add-history-item', (event, arg) => {
  let Data = {
    url: arg,
    time: Math.floor(Date.now() / 1000)
  };

  try {
    prependFile(ppath + "\\json\\history.json", JSON.stringify(Data) + "\n", function (err) {
      if (err) throw err;
    });
  } catch (error) {
    if(!fs.existsSync(ppath + "\\json")) {
      fs.mkdirSync(ppath + "\\json");
    } 
    fs.writeFileSync(ppath + "\\json\\history.json", "");
    fs.appendFileSync(ppath + "\\json\\history.json", JSON.stringify(Data), function (err) {
      if (err) throw err;
    });
  }

  mainWindow.webContents.send('action-add-history-item', Data);
});


ipcMain.on('request-install-update', (event, arg) => {
  autoUpdater.quitAndInstall();
});

ipcMain.on('request-set-search-engine', (event, arg) => {
  searchEngine = arg;
  saveSearchEngine();
  mainWindow.webContents.send('action-set-search-engine', arg);
});

ipcMain.on('request-show-welcome-screen', (event, arg) => {
  showWelcomeWindow();
});

ipcMain.on('request-notif', (event, arg) => {
  mainWindow.webContents.send('action-notif', arg);
});

ipcMain.on('request-open-url', (event, arg) => {
  mainWindow.webContents.send('action-open-url', arg);
});

ipcMain.on('request-open-url-in-new-tab', (event, arg) => {
  mainWindow.webContents.send('action-open-url-in-new-tab', arg);
});

ipcMain.on('request-open-settings', (event, arg) => {
  mainWindow.webContents.send('action-open-settings', arg);
  welcomeWindow.setClosable(true);
  welcomeWindow.close();
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
    { label: 'Back', icon: app.getAppPath() + '\\imgs\\icons16\\back.png', accelerator: 'Alt+Left', click: () => { mainWindow.webContents.send('action-tabcontext-back', arg); } },
    { label: 'Forward', icon: app.getAppPath() + '\\imgs\\icons16\\forward.png', accelerator: 'Alt+Right', click: () => { mainWindow.webContents.send('action-tabcontext-forward', arg); } },
    { label: 'Reload', icon: app.getAppPath() + '\\imgs\\icons16\\reload.png', accelerator: 'F5', click: () => { mainWindow.webContents.send('action-tabcontext-reload', arg); } },
    { type: 'separator' },
    { label: 'Duplicate', icon: app.getAppPath() + '\\imgs\\icons16\\copy.png', accelerator: 'CmdOrCtrl+Shift+D', click: () => { mainWindow.webContents.send('action-tabcontext-duplicatetab', arg); } },
    { label: 'Copy URL', icon: app.getAppPath() + '\\imgs\\icons16\\copy-link.png', accelerator: 'CmdOrCtrl+Shift+C', click: () => { mainWindow.webContents.send('action-tabcontext-copyurl', arg); } },
    { label: 'Go home', icon: app.getAppPath() + '\\imgs\\icons16\\home.png', accelerator: 'CmdOrCtrl+Shift+H', click: () => { mainWindow.webContents.send('action-tabcontext-gohome', arg); } },
    { type: 'separator' },
    { label: 'Picture in picture', icon: app.getAppPath() + '\\imgs\\icons16\\picture-in.png', accelerator: 'CmdOrCtrl+Shift+P', click: () => { mainWindow.webContents.send('action-tabcontext-picturein', arg); } },
    // { type: 'separator' },
    // { label: 'Mute site', accelerator: 'CmdOrCtrl+Shift+M', click: () => {  }, enabled: false },
    { type: 'separator' },
    { label: 'Close to the right', icon: app.getAppPath() + '\\imgs\\icons16\\swipe-right.png', click: () => { mainWindow.webContents.send('action-tabcontext-closeright', arg); } },
    { label: 'Close others', icon: app.getAppPath() + '\\imgs\\icons16\\broom.png', accelerator: 'CmdOrCtrl+Shift+W', click: () => { mainWindow.webContents.send('action-tabcontext-closeothers', arg); } },
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
      break;
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
  mainWindow.webContents.send('action-change-theme', arg);

  if(!fs.existsSync(ppath + "\\json")) {
    fs.mkdirSync(ppath + "\\json");
  } 

  fs.writeFileSync(ppath + "\\json\\theme.json", arg);
});

ipcMain.on('request-change-border-radius', (event, arg) => {
  mainWindow.webContents.send('action-change-border-radius', arg);

  if(!fs.existsSync(ppath + "\\json")) {
    fs.mkdirSync(ppath + "\\json");
  } 

  fs.writeFileSync(ppath + "\\json\\radius.json", arg);
});

ipcMain.on('request-toggle-fullscreen', (event, arg) => {
  toggleFullscreen();
});

ipcMain.on('request-close-welcome', (event, arg) => {
  welcomeWindow.close();
});

ipcMain.on('request-close-keybinds', (event, arg) => {
  keyBindsWindow.close();
});

ipcMain.on('request-close-pageinfo', (event, arg) => {
  pageInfoWindow.close();
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
    width: 480, height: 350,
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

  welcomeWindow.loadFile(app.getAppPath() + '\\html\\welcome.html');

  welcomeWindow.webContents.once('did-finish-load', () => {
    // welcomeWindow.webContents.openDevTools();
    welcomeWindow.show();
  });
}

function showKeyBindsWindow() {
  keyBindsWindow = new BrowserWindow({
    width: 480, height: 480,
    minWidth: 480, minHeight: 180,
    frame: false,
    show: false,
    modal: true,
    parent: mainWindow,
    icon: app.getAppPath() + '\\imgs\\icon.ico',
    minimizable: false,
    webPreferences: {
      nodeIntegration: true
    },
    backgroundColor: 'rgb(0, 0, 0)'
  }); 

  keyBindsWindow.setMenu(null);

  keyBindsWindow.on('focus', () => {
    keyBindsWindow.webContents.send('action-focus-window');
  });
  keyBindsWindow.on('blur', () => {
    keyBindsWindow.webContents.send('action-blur-window');
  });

  keyBindsWindow.loadFile(app.getAppPath() + '\\html\\keybinds.html');

  keyBindsWindow.webContents.once('did-finish-load', () => {
    // keyBindsWindow.webContents.openDevTools();
    keyBindsWindow.show();
  });
}

function showPageInfoWindow(certificate) {
  pageInfoWindow = new BrowserWindow({
    width: 480, height: 480,
    minWidth: 480, minHeight: 180,
    frame: false,
    show: false,
    modal: true,
    parent: mainWindow,
    icon: app.getAppPath() + '\\imgs\\icon.ico',
    minimizable: false,
    webPreferences: {
      nodeIntegration: true
    },
    backgroundColor: 'rgb(0, 0, 0)'
  }); 

  pageInfoWindow.setMenu(null);

  pageInfoWindow.on('focus', () => {
    pageInfoWindow.webContents.send('action-focus-window');
  });
  pageInfoWindow.on('blur', () => {
    pageInfoWindow.webContents.send('action-blur-window');
  });

  pageInfoWindow.loadFile(app.getAppPath() + '\\html\\pageinfo.html');

  pageInfoWindow.webContents.once('did-finish-load', () => {
    // pageInfoWindow.webContents.openDevTools();
    pageInfoWindow.show();
    pageInfoWindow.webContents.send('action-load-certificate', certificate);
  });
}

function openFileDialog() {
  dialog.showOpenDialog(mainWindow, { 
    properties: [ 'multiSelections' ]
  }, (filePaths) => {
    if(filePaths) {
      for(var i = 0; i < filePaths.length; i++) {
        mainWindow.webContents.send('action-open-url-in-new-tab', filePaths[i]);
      }
    }
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
  saveStartPage();
}

function saveDownloads() {
  if(!fs.existsSync(ppath + "\\json")) {
    fs.mkdirSync(ppath + "\\json");
  } 

  fs.writeFileSync(ppath + "\\json\\curdownloadnum.json", curDownloadNum);
  fs.writeFileSync(ppath + "\\json\\downloads.json", JSON.stringify(downloadsArray));
  console.log("saved DOWNLOADS: " + downloadsArray.length);
}

function saveStartPage() {
  if(!fs.existsSync(ppath + "\\json")) {
    fs.mkdirSync(ppath + "\\json");
  } 

  fs.writeFileSync(ppath + "\\json\\startpage.json", startPage);
  console.log("saved STARTPAGE: " + startPage);
}

function saveSearchEngine() {
  if(!fs.existsSync(ppath + "\\json")) {
    fs.mkdirSync(ppath + "\\json");
  } 

  fs.writeFileSync(ppath + "\\json\\searchengine.json", searchEngine);
  console.log("saved SEARCHENGINE: " + searchEngine);
}

function saveBounds() {
  let Data = {
    x: mainWindow.getBounds().x,
    y: mainWindow.getBounds().y,
    width: mainWindow.getBounds().width,
    height: mainWindow.getBounds().height,
    maximize: mainWindow.isMaximized()
  }

  if(!fs.existsSync(ppath + "\\json")) {
    fs.mkdirSync(ppath + "\\json");
  } 

  fs.writeFileSync(ppath + "\\json\\bounds.json", JSON.stringify(Data));
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
  if(fs.existsSync(ppath + "\\json")) {
    loadWelcome();
    loadBounds();
    loadStartPage();
    loadSearchEngine();
    loadDownloads();
  } else {
    fs.mkdirSync(ppath + "\\json");
    saveAllData();
  }
}

function loadSearchEngine() {
  try {
    searchEngine = fs.readFileSync(ppath + "\\json\\searchengine.json");
  } catch (e) {
    saveSearchEngine();
  }

  mainWindow.webContents.send('action-set-search-engine', searchEngine);
}

function loadDownloads() {
  try {
    curDownloadNum = fs.readFileSync(ppath + "\\json\\curdownloadnum.json");

    var jsonstr = fs.readFileSync(ppath + "\\json\\downloads.json");
    var arr = JSON.parse(jsonstr);

    for (var i = 0; i < arr.length; i++) {
      let Item = {
        index: arr[i].index,
        url: arr[i].url,
        name: arr[i].name,
        path: arr[i].path,
        time: arr[i].time
      };
      downloadsArray.push(Item);
    }
  } catch(err) {
    saveDownloads();
  }
}

function loadWelcome() {
  try {
    var welcomeOn = fs.readFileSync(ppath + "\\json\\welcome.json");
    if(welcomeOn == 1) {
      showWelcomeWindow();
    }
  } catch (e) {
    fs.writeFileSync(ppath + "\\json\\welcome.json", 1);
    showWelcomeWindow();
  }
}

function loadBounds() {
  try {
    let Data = JSON.parse(fs.readFileSync(ppath + "\\json\\bounds.json"));

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
    saveBounds();
  }
}

function loadStartPage() {
  try {
    startPage = fs.readFileSync(ppath + "\\json\\startpage.json");
  } catch (e) {
    saveStartPage();
  }

  mainWindow.webContents.send('action-set-start-page', startPage);
  mainWindow.webContents.send('action-open-url-in-new-tab', startPage);
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
