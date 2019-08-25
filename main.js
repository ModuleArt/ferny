/*
.##.....##....###....####.##....##
.###...###...##.##....##..###...##
.####.####..##...##...##..####..##
.##.###.##.##.....##..##..##.##.##
.##.....##.#########..##..##..####
.##.....##.##.....##..##..##...###
.##.....##.##.....##.####.##....##
*/

const { ipcMain, app, Menu, MenuItem, BrowserWindow, dialog, clipboard } = require('electron');
const { autoUpdater } = require("electron-updater")
const os = require('os');
const prependFile = require('prepend-file');
const fs = require("fs");
const ppath = require('persist-path')('Ferny');

/*
.##.....##..#######..########..##.....##.##.......########..######.
.###...###.##.....##.##.....##.##.....##.##.......##.......##....##
.####.####.##.....##.##.....##.##.....##.##.......##.......##......
.##.###.##.##.....##.##.....##.##.....##.##.......######....######.
.##.....##.##.....##.##.....##.##.....##.##.......##.............##
.##.....##.##.....##.##.....##.##.....##.##.......##.......##....##
.##.....##..#######..########...#######..########.########..######.
*/

const saveFileToJsonFolder = require(app.getAppPath() + "/modules/saveFileToJsonFolder.js");
const loadTheme = require(app.getAppPath() + "/modules/loadTheme.js");
const loadWinControls = require(app.getAppPath() + "/modules/loadWinControls.js");

const TabManager = require(app.getAppPath() + "/modules/TabManager/TabManager.js");
const Overlay = require(app.getAppPath() + "/modules/Overlay/Overlay.js");

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
  { label: 'New tab', icon: app.getAppPath() + '/imgs/icons16/create.png', accelerator: 'CmdOrCtrl+T', click: () => { mainWindow.webContents.send('action-tab-newtab'); } },
  //  { label: 'New private tab', accelerator: 'CmdOrCtrl+Shift+T', click: () => {  }, enabled: false },
  { label: 'Active tab', icon: app.getAppPath() + '/imgs/icons16/tab.png', submenu: [
    { label: 'Back', accelerator: 'Alt+Left', icon: app.getAppPath() + '/imgs/icons16/back.png', click: () => { mainWindow.webContents.send('action-tab-back'); } },
    { label: 'Forward', accelerator: 'Alt+Right', icon: app.getAppPath() + '/imgs/icons16/forward.png', click: () => { mainWindow.webContents.send('action-tab-forward'); } },
    { label: 'Reload', icon: app.getAppPath() + '/imgs/icons16/reload.png', accelerator: 'F5', click: () => { mainWindow.webContents.send('action-tab-reload'); } },
    { type: 'separator' },
    { label: 'Duplicate', icon: app.getAppPath() + '/imgs/icons16/copy.png', accelerator: 'CmdOrCtrl+Shift+D', click: () => { mainWindow.webContents.send('action-tab-duplicatetab'); } },
    { label: 'Copy URL', icon: app.getAppPath() + '/imgs/icons16/copy-link.png', accelerator: 'CmdOrCtrl+Shift+C', click: () => { mainWindow.webContents.send('action-tab-copyurl'); } },
    { label: 'Go home', icon: app.getAppPath() + '/imgs/icons16/home.png', accelerator: 'CmdOrCtrl+Shift+H', click: () => { mainWindow.webContents.send('action-tab-gohome'); } },
    // { type: 'separator' },
    // { label: 'Picture in picture', icon: app.getAppPath() + '/imgs/icons16/picture-in.png', accelerator: 'CmdOrCtrl+Shift+P', click: () => { mainWindow.webContents.send('action-tab-picturein'); } },
    // { type: 'separator' },
    // { label: 'Mute site', accelerator: 'CmdOrCtrl+Shift+M', click: () => {  }, enabled: false },
    { type: 'separator' },
    { label: 'Reload ignoring cache', accelerator: 'CmdOrCtrl+F5', click: () => { mainWindow.webContents.send('action-tab-ignorecache'); } },
    { type: 'separator' },
    { label: 'Close to the right', icon: app.getAppPath() + '/imgs/icons16/swipe-right.png', click: () => { mainWindow.webContents.send('action-tab-closeright'); } },
    { label: 'Close others', accelerator: 'CmdOrCtrl+Shift+W', click: () => { mainWindow.webContents.send('action-tab-closeothers'); } },
    { label: 'Close tab', icon: app.getAppPath() + '/imgs/icons16/close.png', accelerator: 'CmdOrCtrl+W', click: () => { mainWindow.webContents.send('action-tab-closetab'); } }
  ] },
  { type: 'separator' },
  { label: 'Bookmarks', icon: app.getAppPath() + '/imgs/icons16/bookmarks.png', submenu: [
    { label: 'Bookmark manager', icon: app.getAppPath() + '/imgs/icons16/bookmarks.png', accelerator: 'CmdOrCtrl+B', click: () => { mainWindow.webContents.send('action-open-bookmarks'); } },
    { type: 'separator' },
    { label: 'Bookmark this page', icon: app.getAppPath() + '/imgs/icons16/star.png', accelerator: 'CmdOrCtrl+Shift+B', click: () => { mainWindow.webContents.send('action-bookmark-this-page'); } },
    { label: 'Bookmark all tabs', click: () => { mainWindow.webContents.send('action-add-quest-notif', { text: "Are you sure to bookmark all tabs?", ops: [{ text:'Bookmark', icon:'add-bookmark-16', click:'bookmarkAllTabs()' }] }); } }
  ] },
// { label: 'Reading list', accelerator: 'CmdOrCtrl+R', click: () => {  }, enabled: false },
  { label: 'History', accelerator: 'CmdOrCtrl+H', icon: app.getAppPath() + '/imgs/icons16/history.png', click: () => { mainWindow.webContents.send('action-open-history'); } },
  { label: 'Downloads', accelerator: 'CmdOrCtrl+D', icon: app.getAppPath() + '/imgs/icons16/download.png', click: () => { mainWindow.webContents.send('action-open-downloads'); } },
// { label: 'Closed tabs', accelerator: 'CmdOrCtrl+Q', click: () => {  }, enabled: false },
  { type: 'separator' },
  { label: 'Zoom', icon: app.getAppPath() + '/imgs/icons16/zoom.png', submenu: [
    { label: 'Zoom out', icon: app.getAppPath() + '/imgs/icons16/zoom-out.png', accelerator: 'CmdOrCtrl+-', click: () => { mainWindow.webContents.send('action-zoom-zoomout'); } },
    { label: 'Zoom in', icon: app.getAppPath() + '/imgs/icons16/zoom-in.png', accelerator: 'CmdOrCtrl+=', click: () => { mainWindow.webContents.send('action-zoom-zoomin'); } },
    { type: 'separator' },
    { label: 'Actual size', icon: app.getAppPath() + '/imgs/icons16/actual-size.png', accelerator: 'CmdOrCtrl+0', click: () => { mainWindow.webContents.send('action-zoom-actualsize'); } },
    { type: 'separator' },
    { label: 'Fullscreen', icon: app.getAppPath() + '/imgs/icons16/fullscreen.png', accelerator: 'F11', click: () => { toggleFullscreen(); } },
  ] },
  { label: 'Edit', icon: app.getAppPath() + '/imgs/icons16/edit.png', submenu: [
    { label: 'Cut', icon: app.getAppPath() + '/imgs/icons16/cut.png', accelerator: 'CmdOrCtrl+X', click: () => { mainWindow.webContents.send('action-edit-cut'); } },
    { label: 'Copy', icon: app.getAppPath() + '/imgs/icons16/copy.png', accelerator: 'CmdOrCtrl+C', click: () => { mainWindow.webContents.send('action-edit-copy'); } },
    { label: 'Paste', icon: app.getAppPath() + '/imgs/icons16/paste.png', accelerator: 'CmdOrCtrl+V', click: () => { mainWindow.webContents.send('action-edit-paste'); } },
    { type: 'separator' },
    { label: 'Paste and match style', icon: app.getAppPath() + '/imgs/icons16/paste-special.png', accelerator: 'CmdOrCtrl+Shift+V', click: () => { mainWindow.webContents.send('action-edit-pastematchstyle'); } },
    { type: 'separator' },
    { label: 'Undo', icon: app.getAppPath() + '/imgs/icons16/undo.png', accelerator: 'CmdOrCtrl+Z', click: () => { mainWindow.webContents.send('action-edit-undo'); } },
    { label: 'Redo', icon: app.getAppPath() + '/imgs/icons16/redo.png', accelerator: 'CmdOrCtrl+Shift+Z', click: () => { mainWindow.webContents.send('action-edit-redo'); } },
    { type: 'separator' },
    { label: 'Select all', icon: app.getAppPath() + '/imgs/icons16/select-all.png', accelerator: 'CmdOrCtrl+A', click: () => { mainWindow.webContents.send('action-edit-selectall'); } },
    { type: 'separator' },
    { label: 'Delete', icon: app.getAppPath() + '/imgs/icons16/delete.png', accelerator: 'Backspace', click: () => { mainWindow.webContents.send('action-edit-delete'); } },
  ] },
  { label: 'Page', icon: app.getAppPath() + '/imgs/icons16/page.png', submenu: [
    { label: 'Find in page', icon: app.getAppPath() + '/imgs/icons16/find-in-page.png', accelerator: 'CmdOrCtrl+F', click: () => { mainWindow.webContents.send('action-page-findinpage'); } },
    { type: 'separator' },
    { label: 'Certificate info', icon: app.getAppPath() + '/imgs/icons16/certificate.png', accelerator: 'CmdOrCtrl+I', click: () => { mainWindow.webContents.send('action-page-certificate'); } },
    { type: 'separator' },
//  { label: 'Print page', accelerator: 'CmdOrCtrl+P', click: () => {  }, enabled: false },
//  { label: 'Save page as', icon: app.getAppPath() + '/imgs/icons16/save.png', accelerator: 'CmdOrCtrl+S', click: () => { mainWindow.webContents.send('action-page-saveas'); } },
//  { label: 'Create page shortcut', accelerator: 'CmdOrCtrl+Shift+S', click: () => {  }, enabled: false },
    { label: 'Open file', icon: app.getAppPath() + '/imgs/icons16/open.png', accelerator: 'CmdOrCtrl+O', click: () => { openFileDialog(); } },
    { type: 'separator' },
    { label: 'View page source', icon: app.getAppPath() + '/imgs/icons16/code.png', accelerator: 'CmdOrCtrl+U', click: () => { mainWindow.webContents.send('action-page-viewsource'); } },
    { label: 'Developer tools', icon: app.getAppPath() + '/imgs/icons16/tools.png', accelerator: 'F12', click: () => { mainWindow.webContents.send('action-page-devtools'); } }
  ] },
  { type: 'separator' },
  { label: 'Settings', icon: app.getAppPath() + '/imgs/icons16/settings.png', accelerator: 'CmdOrCtrl+,', click: () => { mainWindow.webContents.send('action-open-settings'); } },
  { label: 'Help', icon: app.getAppPath() + '/imgs/icons16/help.png', submenu: [
    { label: 'Check for updates', icon: app.getAppPath() + '/imgs/icons16/reload.png', accelerator: 'CmdOrCtrl+Shift+U', click: () => { checkForUpdates(); } },
    { type: 'separator' },
    { label: 'About', icon: app.getAppPath() + '/imgs/icons16/about.png', accelerator: 'F2', click: () => { mainWindow.webContents.send('action-app-about'); } },
    { label: 'Hotkeys', icon: app.getAppPath() + '/imgs/icons16/keyboard.png', accelerator: 'F1', click: () => { showKeyBindsWindow(); } },
    { label: 'Welcome', icon: app.getAppPath() + '/imgs/icons16/startup.png', accelerator: 'F7', click: () => { showWelcomeWindow(); } },
    { type: 'separator' },
    { label: 'Report an issue', icon: app.getAppPath() + '/imgs/icons16/bug.png', accelerator: 'CmdOrCtrl+Shift+I', click: () => { mainWindow.webContents.send('action-open-url-in-new-tab', 'https://github.com/ModuleArt/ferny/issues'); } }
  ] },
  { label: 'More', icon: app.getAppPath() + '/imgs/icons16/more.png', submenu: [
    { label: 'Clear browsing data', icon: app.getAppPath() + '/imgs/icons16/broom.png', accelerator: 'CmdOrCtrl+Shift+Delete', click: () => { mainWindow.webContents.send('action-open-settings', 'clear-browsing-data'); } },
    { type: 'separator' },
    { label: 'Toggle sidebar', icon: app.getAppPath() + '/imgs/icons16/sidebar.png', accelerator: 'F3', click: () => { mainWindow.webContents.send('action-toggle-sidebar'); } },
    { label: 'Focus address bar', icon: app.getAppPath() + '/imgs/icons16/zoom.png', accelerator: 'F6', click: () => { mainWindow.webContents.send('action-page-focussearch'); } },
    { label: 'Close active panel', icon: app.getAppPath() + '/imgs/icons16/close.png', accelerator: 'Esc', click: () => { mainWindow.webContents.send('action-esc'); } },
    { type: 'separator' },
    { label: 'Switch tab', icon: app.getAppPath() + '/imgs/icons16/numerical.png', submenu: [
      { label: 'Next tab', icon: app.getAppPath() + '/imgs/icons16/next.png', accelerator: 'CmdOrCtrl+Tab', click: () => { mainWindow.webContents.send('action-next-tab'); } },
      { label: 'Previous tab', icon: app.getAppPath() + '/imgs/icons16/prev.png', accelerator: 'CmdOrCtrl+Shift+Tab', click: () => { mainWindow.webContents.send('action-prev-tab'); } },
      { type: 'separator' },
      { label: 'Tab 1', accelerator: 'CmdOrCtrl+1', click: () => { mainWindow.webContents.send('action-switch-tab', 1); } },
      { label: 'Tab 2', accelerator: 'CmdOrCtrl+2', click: () => { mainWindow.webContents.send('action-switch-tab', 2); } },
      { label: 'Tab 3', accelerator: 'CmdOrCtrl+3', click: () => { mainWindow.webContents.send('action-switch-tab', 3); } },
      { label: 'Tab 4', accelerator: 'CmdOrCtrl+4', click: () => { mainWindow.webContents.send('action-switch-tab', 4); } },
      { label: 'Tab 5', accelerator: 'CmdOrCtrl+5', click: () => { mainWindow.webContents.send('action-switch-tab', 5); } },
      { label: 'Tab 6', accelerator: 'CmdOrCtrl+6', click: () => { mainWindow.webContents.send('action-switch-tab', 6); } },
      { label: 'Tab 7', accelerator: 'CmdOrCtrl+7', click: () => { mainWindow.webContents.send('action-switch-tab', 7); } },
      { label: 'Tab 8', accelerator: 'CmdOrCtrl+8', click: () => { mainWindow.webContents.send('action-switch-tab', 8); } },
      { label: 'Tab 9', accelerator: 'CmdOrCtrl+9', click: () => { mainWindow.webContents.send('action-switch-tab', 9); } },
    ] },
    { type: 'separator' },
    { label: 'Developer [Danger]', icon: app.getAppPath() + '/imgs/icons16/developer.png', submenu: [
      { label: 'Developer mode (Main window)', icon: app.getAppPath() + '/imgs/icons16/web.png', accelerator: 'CmdOrCtrl+Shift+F12', click: () => { mainWindow.webContents.openDevTools(); } },
      { label: 'Developer mode (Sidebar)', icon: app.getAppPath() + '/imgs/icons16/sidebar.png', accelerator: 'CmdOrCtrl+Shift+F11', click: () => { mainWindow.webContents.send('action-sidebar-devtools'); } }    
    ] }
  ] },
  { type: 'separator' },
  { label: 'Quit Ferny', icon: app.getAppPath() + '/imgs/icons16/exit.png', accelerator: 'CmdOrCtrl+Shift+Q', click: () => { app.quit(); } }
]);

let mainWindow = null;
let welcomeWindow = null;
let keyBindsWindow = null;

let downloadsArray = [];
let curDownloadNum = 0;

let updateCancellationToken = null;

let tabManager = null;
let overlay = null;

/*
....###....########..########.
...##.##...##.....##.##.....##
..##...##..##.....##.##.....##
.##.....##.########..########.
.#########.##........##.......
.##.....##.##........##.......
.##.....##.##........##.......
*/

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  autoUpdater.logger = require("electron-log");
  autoUpdater.logger.transports.file.level = "info";

  autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('action-add-status-notif', { type: "info", text: "Checking for updates..." });
  });

  autoUpdater.on('error', (error) => {
    mainWindow.webContents.send('action-add-status-notif', { type: "error", text: "Update error: " + error });
  });

  autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('action-add-status-notif', { type: "success", text: "App is up to date!" });
  });

  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('action-add-status-notif', { type: "success", text: "Update is available. Download started..." });
    mainWindow.webContents.send('action-add-update-notif', info.releaseName);
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('action-add-quest-notif', { text: "Update is downloaded!", ops: [{ text:'Install now', icon:'check-16', click:'installUpdate();' }] });
  });

  autoUpdater.on('download-progress', (progress) => {
    if(progress != null) {
      mainWindow.webContents.send('action-refresh-update-notif', { 
        percent: progress.percent, 
        transferred: progress.transferred, 
        total: progress.total,
        speed: progress.bytesPerSecond
      });
    }
  });

  showMainWindow();
  loadWelcome();
  loadDownloads();
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

ipcMain.on('request-set-color-tabs', (event, arg) => {
  setColorTabs(arg);
});

ipcMain.on('request-webview-contextmenu', (event, arg) => {
  if(arg.params.isEditable) {
    let webviewMenu = Menu.buildFromTemplate([
      { label: 'Cut', icon: app.getAppPath() + '/imgs/icons16/cut.png', accelerator: 'CmdOrCtrl+X', enabled: arg.params.editFlags.canCut, click: () => { 
        mainWindow.webContents.send('action-webview-contextmenu', { action: 'cut', id: arg.id }); } },
      { label: 'Copy', icon: app.getAppPath() + '/imgs/icons16/copy.png', accelerator: 'CmdOrCtrl+C', enabled: arg.params.editFlags.canCopy, click: () => { 
        mainWindow.webContents.send('action-webview-contextmenu', { action: 'copy', id: arg.id }); } },
      { label: 'Paste', icon: app.getAppPath() + '/imgs/icons16/paste.png', accelerator: 'CmdOrCtrl+V', enabled: arg.params.editFlags.canPaste, click: () => { 
        mainWindow.webContents.send('action-webview-contextmenu', { action: 'paste', id: arg.id }); } },
      { type: 'separator' },
      { label: 'Paste and match style', icon: app.getAppPath() + '/imgs/icons16/paste-special.png', accelerator: 'CmdOrCtrl+Shift+V', enabled: arg.params.editFlags.canPaste, click: () => { 
        mainWindow.webContents.send('action-webview-contextmenu', { action: 'paste-match-style', id: arg.id }); } },
      { type: 'separator' },
      { label: 'Undo', icon: app.getAppPath() + '/imgs/icons16/undo.png', accelerator: 'CmdOrCtrl+Z', enabled: arg.params.editFlags.canUndo, click: () => { 
        mainWindow.webContents.send('action-webview-contextmenu', { action: 'undo', id: arg.id }); } },
      { label: 'Redo', icon: app.getAppPath() + '/imgs/icons16/redo.png', accelerator: 'CmdOrCtrl+Shift+Z', enabled: arg.params.editFlags.canRedo, click: () => {
        mainWindow.webContents.send('action-webview-contextmenu', { action: 'redo', id: arg.id }); } },
      { type: 'separator' },
      { label: 'Select all', icon: app.getAppPath() + '/imgs/icons16/select-all.png', accelerator: 'CmdOrCtrl+A', enabled: arg.params.editFlags.canSelectAll, click: () => { 
        mainWindow.webContents.send('action-webview-contextmenu', { action: 'select-all', id: arg.id }); } },
      { type: 'separator' },
      { label: 'Delete', icon: app.getAppPath() + '/imgs/icons16/delete.png', accelerator: 'Backspace', enabled: arg.params.editFlags.canDelete, click: () => { 
        mainWindow.webContents.send('action-webview-contextmenu', { action: 'delete', id: arg.id }); } }
    ]);
    webviewMenu.popup(mainWindow);
  } else {
    if(arg.params.linkURL.length > 0) {
      let webviewMenu = Menu.buildFromTemplate([
        { label: 'Open link in new tab', icon: app.getAppPath() + '/imgs/icons16/tab.png', click: () => { 
          mainWindow.webContents.send('action-open-url-in-new-tab', arg.params.linkURL); } },
        { type: 'separator' },
        { label: 'Copy link address', icon: app.getAppPath() + '/imgs/icons16/copy.png', click: () => { 
          clipboard.writeText(arg.params.linkURL); } } 
      ]);
      webviewMenu.popup(mainWindow);
    } else {
      let webviewMenu = Menu.buildFromTemplate([
        { label: 'Copy', icon: app.getAppPath() + '/imgs/icons16/copy.png', accelerator: 'CmdOrCtrl+C', enabled: arg.params.editFlags.canCopy, click: () => { 
          mainWindow.webContents.send('action-webview-contextmenu', { action: 'copy', id: arg.id }); } },
        { type: 'separator' },
        { label: 'Select all', icon: app.getAppPath() + '/imgs/icons16/select-all.png', accelerator: 'CmdOrCtrl+A', enabled: arg.params.editFlags.canSelectAll, click: () => { 
          mainWindow.webContents.send('action-webview-contextmenu', { action: 'select-all', id: arg.id }); } }
      ]);
      webviewMenu.popup(mainWindow);
    }
  }
});

ipcMain.on('request-cancel-update', (event, arg) => {
  cancelUpdate();
});

ipcMain.on('request-set-start-page', (event, arg) => {
  mainWindow.webContents.send('action-set-start-page', arg);
});

ipcMain.on('request-check-open-with', (event, arg) => {
  if (process.platform == 'win32' && process.argv.length >= 2) {
    var openFilePath = process.argv[1];
    mainWindow.webContents.send('action-open-url-in-new-tab', openFilePath);
  }
});

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

ipcMain.on('request-clear-browsing-data', (event, arg) => {
  const ses = mainWindow.webContents.session;

  if(arg.cache) {
    ses.clearCache().then(function() {
      mainWindow.webContents.send('action-add-status-notif', { text: "Cache cleared", type: "success" });
    });

    ses.getCacheSize().then(function(value) {
      let Data = {
        cacheSize: value
      };
    
      event.sender.send('action-set-cache-size', Data);
    });
  }

  if(arg.storage) {
    ses.clearStorageData().then(function() {
      mainWindow.webContents.send('action-add-status-notif', { text: "Storage cleared", type: "success" });
    });
  }
});

ipcMain.on('request-set-cache-size', (event, arg) => {
  const ses = mainWindow.webContents.session;

  ses.getCacheSize().then(function(value) {
    let Data = {
      cacheSize: value
    };
  
    event.sender.send('action-set-cache-size', Data);
  });
});

ipcMain.on('request-webview-zoomin', (event, arg) => {
  mainWindow.webContents.send('action-zoom-zoomin');
});

ipcMain.on('request-webview-zoomout', (event, arg) => {
  mainWindow.webContents.send('action-zoom-zoomout');
});

ipcMain.on('request-info-contextmenu', (event, arg) => {
  let infoMenu = Menu.buildFromTemplate([
    { label: 'Certificate info', accelerator: 'CmdOrCtrl+I', icon: app.getAppPath() + '/imgs/icons16/certificate.png', click: () => { mainWindow.webContents.send('action-page-certificate'); } }
  ]);
  infoMenu.popup(mainWindow);
});

ipcMain.on('request-home-button-contextmenu', (event, arg) => {
  let homeMenu = Menu.buildFromTemplate([
    { label: 'Home page settings', icon: app.getAppPath() + '/imgs/icons16/settings.png', click: () => { mainWindow.webContents.send('action-open-settings', 'home-page'); } }
  ]);
  homeMenu.popup(mainWindow);
});

ipcMain.on('request-folder-contextmenu', (event, arg) => {
  let folderMenu = Menu.buildFromTemplate([
    { label: 'Edit folder', icon: app.getAppPath() + '/imgs/icons16/edit.png', click: () => { mainWindow.webContents.send('action-edit-folder', arg); } },
    { type: "separator" },
    { label: 'Bookmarks settings', icon: app.getAppPath() + '/imgs/icons16/settings.png', click: () => { mainWindow.webContents.send('action-open-settings', 'bookmarks'); } },
    { label: 'Bookmark manager', accelerator: 'CmdOrCtrl+B', icon: app.getAppPath() + '/imgs/icons16/bookmarks.png', click: () => { mainWindow.webContents.send('action-open-bookmarks'); } }
  ]);
  folderMenu.popup(mainWindow);
});

ipcMain.on('request-bookmark-contextmenu', (event, arg) => {
  let bookmarkMenu = Menu.buildFromTemplate([
    { label: 'Open in new tab', icon: app.getAppPath() + '/imgs/icons16/tab.png', click: () => { mainWindow.webContents.send('action-open-url-in-new-tab', arg.url); } },
    { label: 'Copy URL', icon: app.getAppPath() + '/imgs/icons16/copy-link.png', click: () => { mainWindow.webContents.send('action-copy-text', arg.url); } },
    { type: "separator" },
    { label: 'Edit bookmark', icon: app.getAppPath() + '/imgs/icons16/edit.png', click: () => { mainWindow.webContents.send('action-edit-bookmark', arg); } },
    { type: "separator" },
    { label: 'Bookmarks settings', icon: app.getAppPath() + '/imgs/icons16/settings.png', click: () => { mainWindow.webContents.send('action-open-settings', 'bookmarks'); } },
    { label: 'Bookmark manager', accelerator: 'CmdOrCtrl+B', icon: app.getAppPath() + '/imgs/icons16/bookmarks.png', click: () => { mainWindow.webContents.send('action-open-bookmarks',); } }
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
    fs.readFile(ppath + "/json/bookmarksbar.json", function(err, data) {
      let Data = JSON.parse(data);

      if(arg.on == null) {
        arg.on = Data.on;
      }
      if(arg.layout == null) {
        arg.layout = Data.layout;
      }

      mainWindow.webContents.send('action-set-bookmarks-bar', arg);
      saveFileToJsonFolder('bookmarksbar', JSON.stringify(arg));
    });
  } catch (e) {

  }
});

ipcMain.on('request-add-history-item', (event, arg) => {
  let Data = {
    url: arg,
    time: Math.floor(Date.now() / 1000)
  };

  try {
    prependFile(ppath + "/json/history.json", JSON.stringify(Data) + "\n", function (err) {
      if (err) throw err;
    });
  } catch (error) {
    saveFileToJsonFolder('history', JSON.stringify(Data));
  }

  mainWindow.webContents.send('action-add-history-item', Data);
});


ipcMain.on('request-install-update', (event, arg) => {
  autoUpdater.quitAndInstall();
});

ipcMain.on('request-set-search-engine', (event, arg) => {
  mainWindow.webContents.send('action-set-search-engine', arg);
});

ipcMain.on('request-show-welcome-screen', (event, arg) => {
  showWelcomeWindow();
});

ipcMain.on('request-add-status-notif', (event, arg) => {
  mainWindow.webContents.send('action-add-status-notif', arg);
});

ipcMain.on('request-add-quest-notif', (event, arg) => {
  mainWindow.webContents.send('action-add-quest-notif', arg);
});

ipcMain.on('request-load-certificate', (event, arg) => {
  mainWindow.webContents.send('action-load-certificate', arg);
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

ipcMain.on('action-clear-downloads', (event, arg) => {
  downloadsArray = [];
  saveDownloads();
  mainWindow.webContents.send('action-clear-downloads');
});

ipcMain.on('request-set-about', (event, arg) => {
  let Data = {
    version: app.getVersion(),
    arch: os.arch(),
    platform: process.platform
  };

  event.sender.send('action-set-about', Data);
});

ipcMain.on('request-check-for-updates', (event, arg) => {
  checkForUpdates();
});

ipcMain.on('request-tabs-list', (event, arg) => {
  let m = new Menu();

  if(arg.length > 0) {
    for(let i = 0; i < arg.length; i++) {
      let num = i + 1;
      if (i < 9) {
        let mi = new MenuItem({
          type: 'checkbox',
          label: arg[i].label,
          checked: arg[i].active,
          accelerator: "CmdOrCtrl+" + num,
          click: () => { mainWindow.webContents.send('action-activate-tab', i); }
        });
        m.append(mi);
      } else {
        let mi = new MenuItem({
          type: 'checkbox',
          label: arg[i].label + " [" + num + "]",
          checked: arg[i].active,
          click: () => { mainWindow.webContents.send('action-activate-tab', i); }
        });
        m.append(mi);
      }
    }
  } else {
    let createItem = new MenuItem({ 
      label: 'New Tab', 
      icon: app.getAppPath() + '/imgs/icons16/create.png', 
      accelerator: 'CmdOrCtrl+T', 
      click: () => { mainWindow.webContents.send('action-tab-newtab'); } 
    });
    m.append(createItem);
  }  
  
  let sep = new MenuItem({ type: 'separator' });
  m.append(sep);
  let nextItem = new MenuItem({ 
    label: 'Next tab', 
    icon: app.getAppPath() + '/imgs/icons16/next.png', 
    accelerator: 'CmdOrCtrl+Tab', 
    click: () => { mainWindow.webContents.send('action-next-tab'); } 
  });
  m.append(nextItem);
  let prevItem = new MenuItem({ 
    label: 'Previous tab', 
    icon: app.getAppPath() + '/imgs/icons16/prev.png', 
    accelerator: 'CmdOrCtrl+Shift+Tab', 
    click: () => { mainWindow.webContents.send('action-prev-tab'); } 
  });
  m.append(prevItem);

  m.popup(mainWindow);
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
  for(var i = 0; i < downloadsArray.length; i++) {
    if(downloadsArray[i].index == arg) {
      downloadsArray[i].item.resume();
    }
  }
});

ipcMain.on('request-pause-download', (event, arg) => {
  for(var i = 0; i < downloadsArray.length; i++) {
    if(downloadsArray[i].index == arg) {
      downloadsArray[i].item.pause();
    }
  }
});

ipcMain.on('request-cancel-download', (event, arg) => {
  for(var i = 0; i < downloadsArray.length; i++) {
    if(downloadsArray[i].index == arg) {
      downloadsArray[i].item.cancel();
    }
  }
});

ipcMain.on('request-remove-download', (event, arg) => {
  for(var i = 0; i < downloadsArray.length; i++) {
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
  saveBounds();
  if(updateCancellationToken != null) {
    updateCancellationToken.cancel();
  }
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

ipcMain.on('request-open-license-file', (event, arg) => {
  mainWindow.webContents.send('action-open-url-in-new-tab', app.getAppPath() + "/LICENSE");
});

/*
 # #####   ####               ####  #    # ###### #####  #        ##   #   #
 # #    # #    #             #    # #    # #      #    # #       #  #   # #
 # #    # #         #####    #    # #    # #####  #    # #      #    #   #
 # #####  #                  #    # #    # #      #####  #      ######   #
 # #      #    #             #    #  #  #  #      #   #  #      #    #   #
 # #       ####               ####    ##   ###### #    # ###### #    #   #
*/

ipcMain.on('overlay-show', (event) => {
  overlay.show();
});

ipcMain.on('overlay-showButtonMenu', (event) => {
  overlay.showButtonMenu();
});

/*
 # #####   ####              #####   ##   #####     #    #   ##   #    #   ##    ####  ###### #####
 # #    # #    #               #    #  #  #    #    ##  ##  #  #  ##   #  #  #  #    # #      #    #
 # #    # #         #####      #   #    # #####     # ## # #    # # #  # #    # #      #####  #    #
 # #####  #                    #   ###### #    #    #    # ###### #  # # ###### #  ### #      #####
 # #      #    #               #   #    # #    #    #    # #    # #   ## #    # #    # #      #   #
 # #       ####                #   #    # #####     #    # #    # #    # #    #  ####  ###### #    #
*/

ipcMain.on('tabManager-init', (event) => {
  tabManager = new TabManager(mainWindow, app.getAppPath());

  tabManager.on("active-tab-closed", () => {
    overlay.show();
  });

  tabManager.on("tab-activated", () => {
    mainWindow.webContents.send("overlay-toggleButton", false);
  });

  tabManager.on("last-tab-closed", () => {
    
  });

  tabManager.on("add-status-notif", (text, type) => {
    mainWindow.webContents.send("add-status-notif", { text: text, type: type });
  });
});

ipcMain.on('tabManager-newTab', (event) => {
  tabManager.newTab();
});

ipcMain.on('tabManager-addTab', (event, url, active) => {
  tabManager.addTab(url, active);
});

ipcMain.on('tabManager-activateTab', (event, id) => {
  tabManager.getTabById(id).activate();
});

ipcMain.on('tabManager-closeTab', (event, id) => {
  tabManager.getTabById(id).close();
});

ipcMain.on('tabManager-goBack', (event) => {
  tabManager.getActiveTab().goBack();
});

ipcMain.on('tabManager-goForward', (event) => {
  tabManager.getActiveTab().goForward();
});

ipcMain.on('tabManager-reload', (event) => {
  tabManager.getActiveTab().reload();
});

ipcMain.on('tabManager-stop', (event) => {
  tabManager.getActiveTab().stop();
});

ipcMain.on('tabManager-navigate', (event, url) => {
  tabManager.getActiveTab().navigate(url);
});

ipcMain.on('tabManager-showPreview', (event, id) => {
  tabManager.getTabById(id).showPreview();
});

ipcMain.on('tabManager-hidePreview', (event, id) => {
  tabManager.getTabById(id).hidePreview();
});

ipcMain.on('tabManager-showTabList', (event) => {
  tabManager.showTabList();
});

ipcMain.on('tabManager-showTabMenu', (event, id) => {
  tabManager.getTabById(id).showMenu();
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

function setColorTabs(bool) {
  mainWindow.webContents.send('action-set-color-tabs', bool);
}

function showMainWindow() {
  let Data = {
    x: null,
    y: null,
    width: 1000,
    height: 720,
    maximize: false
  };

  try {
    Data = JSON.parse(fs.readFileSync(ppath + "/json/bounds.json"));
  } catch (e) {
    saveFileToJsonFolder('bounds', JSON.stringify(Data));
  }

  if(Data.maximize) {
    Data.x = null;
    Data.y = null;
    Data.width = 1000;
    Data.height = 600;
  }

  loadTheme().then(function(theme) {
    mainWindow = new BrowserWindow({
      x: Data.x, y: Data.y,
      width: Data.width, height: Data.height,
      minWidth: 520, minHeight: 300,
      frame: loadWinControls().frame,
      autoHideMenuBar: loadWinControls().hideMenu,
      show: false,
      icon: app.getAppPath() + '/imgs/icon.ico',
      webPreferences: {
        nodeIntegration: true,
        webviewTag: true
      },
      backgroundColor: theme.colorBack
    });
    mainWindow.setMenu(sideMenu);
  
    // mainWindow.webContents.openDevTools();
    mainWindow.loadFile(app.getAppPath() + '/html/browser.html');
  
    mainWindow.webContents.on('context-menu', (event, params) => {
      if(params.isEditable) {
        let searchMenu = Menu.buildFromTemplate([
          { label: 'Cut', icon: app.getAppPath() + '/imgs/icons16/cut.png', accelerator: 'CmdOrCtrl+X', enabled: params.editFlags.canCut, click: () => { 
            mainWindow.webContents.cut(); } },
          { label: 'Copy', icon: app.getAppPath() + '/imgs/icons16/copy.png', accelerator: 'CmdOrCtrl+C', enabled: params.editFlags.canCopy, click: () => { 
            mainWindow.webContents.copy(); } },
          { label: 'Paste', icon: app.getAppPath() + '/imgs/icons16/paste.png', accelerator: 'CmdOrCtrl+V', enabled: params.editFlags.canPaste, click: () => { 
            mainWindow.webContents.paste(); } },
          { type: 'separator' },
          { label: 'Paste and search', icon: app.getAppPath() + '/imgs/icons16/zoom.png', enabled: params.editFlags.canPaste, click: () => { 
            mainWindow.webContents.send('action-navigate-suggest', clipboard.readText()); } },
          { type: 'separator' },
          { label: 'Undo', icon: app.getAppPath() + '/imgs/icons16/undo.png', accelerator: 'CmdOrCtrl+Z', enabled: params.editFlags.canUndo, click: () => { 
            mainWindow.webContents.undo(); } },
          { label: 'Redo', icon: app.getAppPath() + '/imgs/icons16/redo.png', accelerator: 'CmdOrCtrl+Shift+Z', enabled: params.editFlags.canRedo, click: () => {
            mainWindow.webContents.redo(); } },
          { type: 'separator' },
          { label: 'Select all', icon: app.getAppPath() + '/imgs/icons16/select-all.png', accelerator: 'CmdOrCtrl+A', enabled: params.editFlags.canSelectAll, click: () => { 
            mainWindow.webContents.selectAll(); } },
          { type: 'separator' },
          { label: 'Delete', icon: app.getAppPath() + '/imgs/icons16/delete.png', accelerator: 'Backspace', enabled: params.editFlags.canDelete, click: () => { 
            mainWindow.webContents.delete(); } }
        ]);
        searchMenu.popup(mainWindow);
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
      tabManager.getActiveTab().activate();
    });
  
    mainWindow.on('unmaximize', () => {
      mainWindow.webContents.send('action-unmaximize-window');
      tabManager.getActiveTab().activate();
    });
  
    mainWindow.once('ready-to-show', () => {
      initOverlay();
      mainWindow.show();
      if(Data.maximize) {
        mainWindow.maximize();
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
  
      var update = false;
      
      if(updateCancellationToken != null) {
        update = true;
      }
  
      if(update) {
        mainWindow.webContents.send('action-add-quest-notif', { text: "App update is in progress! Exit anyway?", ops: [{ text:'Exit', icon:'exit-16', click:'exitAppAnyway()' }] });
      } else {
        if(download) {
          mainWindow.webContents.send('action-add-quest-notif', { text: "Download is in progress! Exit anyway?", ops: [{ text:'Exit', icon:'exit-16', click:'exitAppAnyway()' }] });
        } else {
          saveBounds();
          app.exit();
        }
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
}

function toggleFullscreen() {
  if(mainWindow.isFullScreen()) {
    mainWindow.setFullScreen(false);
  } else {
    mainWindow.setFullScreen(true);
  }
  mainWindow.webContents.send('action-toggle-fullscreen', mainWindow.isFullScreen());
}

function checkForUpdates() {
  autoUpdater.checkForUpdates().then((downloadPromise) => {
    updateCancellationToken = downloadPromise.cancellationToken;
  });
}

function cancelUpdate() {
  updateCancellationToken.cancel();
}

function showWelcomeWindow() {
  mainWindow.webContents.send('action-esc');
  
  loadTheme().then(function(theme) {
    welcomeWindow = new BrowserWindow({
      width: 480, height: 350,
      frame: loadWinControls().frame,
      show: false,
      modal: true,
      parent: mainWindow,
      icon: app.getAppPath() + '/imgs/icon.ico',
      minimizable: false,
      maximizable: false,
      resizable: false,
      webPreferences: {
        nodeIntegration: true
      },
      backgroundColor: theme.colorBack
    }); 
  
    welcomeWindow.setMenu(null);
  
    welcomeWindow.on('focus', () => {
      welcomeWindow.webContents.send('action-focus-window');
    });
  
    welcomeWindow.on('blur', () => {
      welcomeWindow.webContents.send('action-blur-window');
    });
  
    welcomeWindow.loadFile(app.getAppPath() + '/html/welcome.html');
  
    welcomeWindow.once('ready-to-show', () => {
      // welcomeWindow.webContents.openDevTools();
      welcomeWindow.show();
    });
  });
}

function showKeyBindsWindow() {
  loadTheme().then(function(theme) {
    keyBindsWindow = new BrowserWindow({
      width: 480, height: 480,
      minWidth: 480, minHeight: 180,
      frame: loadWinControls().frame,
      show: false,
      modal: true,
      parent: mainWindow,
      icon: app.getAppPath() + '/imgs/icon.ico',
      minimizable: false,
      maximizable: false,
      webPreferences: {
        nodeIntegration: true
      },
      backgroundColor: theme.colorBack
    }); 
  
    keyBindsWindow.setMenu(null);
  
    keyBindsWindow.on('focus', () => {
      keyBindsWindow.webContents.send('action-focus-window');
    });
    keyBindsWindow.on('blur', () => {
      keyBindsWindow.webContents.send('action-blur-window');
    });
  
    keyBindsWindow.loadFile(app.getAppPath() + '/html/keybinds.html');
  
    keyBindsWindow.once('ready-to-show', () => {
      // keyBindsWindow.webContents.openDevTools();
      keyBindsWindow.show();
    });
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
 ###### #    # #    #  ####               ####  #    # ###### #####  #        ##   #   #
 #      #    # ##   # #    #             #    # #    # #      #    # #       #  #   # #
 #####  #    # # #  # #         #####    #    # #    # #####  #    # #      #    #   #
 #      #    # #  # # #                  #    # #    # #      #####  #      ######   #
 #      #    # #   ## #    #             #    #  #  #  #      #   #  #      #    #   #
 #       ####  #    #  ####               ####    ##   ###### #    # ###### #    #   #
*/

function initOverlay() {
  overlay = new Overlay(mainWindow, app.getAppPath());

  overlay.on("show", () => {
    tabManager.unactivateAllTabs();
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

function saveDownloads() {
  saveFileToJsonFolder('curdownloadnum', curDownloadNum);
  saveFileToJsonFolder('downloads', JSON.stringify(downloadsArray));
  console.log("saved DOWNLOADS: " + downloadsArray.length);
}

function saveBounds() {
  let Data = {
    x: mainWindow.getBounds().x,
    y: mainWindow.getBounds().y,
    width: mainWindow.getBounds().width,
    height: mainWindow.getBounds().height,
    maximize: mainWindow.isMaximized()
  }
  saveFileToJsonFolder('bounds', JSON.stringify(Data));
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

function loadDownloads() {
  try {
    curDownloadNum = fs.readFileSync(ppath + "/json/curdownloadnum.json");

    var jsonstr = fs.readFileSync(ppath + "/json/downloads.json");
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
    var welcomeOn = fs.readFileSync(ppath + "/json/welcome.json");
    if(welcomeOn == 1) {
      showWelcomeWindow();
    }
  } catch (e) {
    saveFileToJsonFolder('welcome', 1);
    showWelcomeWindow();
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
