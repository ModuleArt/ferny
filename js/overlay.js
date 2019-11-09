/*
  ####   ####  #    #  ####  #####
 #    # #    # ##   # #        #
 #      #    # # #  #  ####    #
 #      #    # #  # #      #   #
 #    # #    # #   ## #    #   #
  ####   ####  #    #  ####    #
*/

const { ipcRenderer, shell } = require("electron");

const loadTheme = require("../modules/loadTheme.js");
const applyTheme = require("../modules/applyTheme.js");

const BookmarkManager = require("../modules/BookmarkManager/BookmarkManager.js");
const SearchManager = require("../modules/SearchManager/SearchManager.js");
const HistoryManager = require("../modules/HistoryManager/HistoryManager.js");
const DownloadManager = require("../modules/DownloadManager/DownloadManager.js");

/*
  ####  ######   ##   #####   ####  #    #
 #      #       #  #  #    # #    # #    #
  ####  #####  #    # #    # #      ######
      # #      ###### #####  #      #    #
 #    # #      #    # #   #  #    # #    #
  ####  ###### #    # #    #  ####  #    #
*/

let searchManager = new SearchManager(
  document.getElementById('search-input'), 
  document.getElementById('search-suggest'), 
  document.getElementById('search-suggest-container'),
  document.getElementById('search-engines'),
  document.getElementById('clear-search-btn')
);

/*
 #####   ####   ####  #    # #    #   ##   #####  #    #  ####
 #    # #    # #    # #   #  ##  ##  #  #  #    # #   #  #
 #####  #    # #    # ####   # ## # #    # #    # ####    ####
 #    # #    # #    # #  #   #    # ###### #####  #  #        #
 #    # #    # #    # #   #  #    # #    # #   #  #   #  #    #
 #####   ####   ####  #    # #    # #    # #    # #    #  ####
*/

let bookmarkManager = new BookmarkManager(document.getElementById("bookmarks-container"));

bookmarkManager.on("folder-added", () => {
  ipcRenderer.send("main-addStatusNotif", { text: "Folder added", type: "success" });
});

bookmarkManager.on("folder-appended", () => {
  updateTheme();
});

bookmarkManager.on("ask-for-delete-folder", (id, name) => {
  ipcRenderer.send("main-addQuestNotif", { 
    text: `Are you sure to delete "` + name + `" folder?`, 
    ops: [{ 
      text: "Delete", icon: "delete-16", click: "removeFolder('" + id + "')" 
    }] 
  });
});

bookmarkManager.on("folder-deleted", () => {
  ipcRenderer.send("main-addStatusNotif", { text: "Folder deleted", type: "error" });
});

bookmarkManager.on("folder-edited", () => {
  ipcRenderer.send("main-addStatusNotif", { text: "Folder edited", type: "info" });
});

bookmarkManager.on("bookmark-added", () => {
  ipcRenderer.send("main-addStatusNotif", { text: "Bookmark added", type: "success" });
});

bookmarkManager.on("bookmark-appended", () => {
  updateTheme();
});

bookmarkManager.on("bookmark-deleted", () => {
  ipcRenderer.send("main-addStatusNotif", { text: "Bookmark deleted", type: "error" });
});

bookmarkManager.on("bookmark-edited", () => {
  ipcRenderer.send("main-addStatusNotif", { text: "Bookmark edited", type: "info" });
});

bookmarkManager.on("bookmark-editor-toggled", () => {
  updateTheme();
});

bookmarkManager.on("folder-editor-toggled", () => {
  updateTheme();
});

bookmarkManager.on("update-bookmarked", (exists, id) => {
  ipcRenderer.send("main-updateBookmarkedButton", exists, id);
});

/*
 #    # #  ####  #####  ####  #####  #   #
 #    # # #        #   #    # #    #  # #
 ###### #  ####    #   #    # #    #   #
 #    # #      #   #   #    # #####    #
 #    # # #    #   #   #    # #   #    #
 #    # #  ####    #    ####  #    #   #
*/

let historyManager = new HistoryManager(document.getElementById("history-container"));

historyManager.on("history-item-added", () => {
  updateTheme();
});

historyManager.on("clear-history", () => {
  ipcRenderer.send("main-addQuestNotif", { 
    text: "Are you sure to clear all history?", 
    ops: [{ 
      text: "Clear", icon: "delete-16", click: "clearHistory()" 
    }] 
  });
});

historyManager.on("history-cleared", () => {
  ipcRenderer.send("main-addStatusNotif", { text: "History cleared", type: "success" });
});

historyManager.on("history-already-cleared", () => {
  ipcRenderer.send("main-addStatusNotif", { text: "History already cleared", type: "info" });
});

/*
 #####   ####  #    # #    # #       ####    ##   #####   ####
 #    # #    # #    # ##   # #      #    #  #  #  #    # #
 #    # #    # #    # # #  # #      #    # #    # #    #  ####
 #    # #    # # ## # #  # # #      #    # ###### #    #      #
 #    # #    # ##  ## #   ## #      #    # #    # #    # #    #
 #####   ####  #    # #    # ######  ####  #    # #####   ####
*/

let downloadManager = new DownloadManager(document.getElementById("downloads-container"));

downloadManager.on("download-status-changed", () => {
  updateTheme();
});

downloadManager.on("clear-downloads", () => {
  ipcRenderer.send("main-addQuestNotif", { 
    text: "Are you sure to clear all downloads?", 
    ops: [{ 
      text: "Clear", icon: "delete-16", click: "clearDownloads()" 
    }] 
  });
});

downloadManager.on("downloads-cleared", () => {
  ipcRenderer.send("main-addStatusNotif", { text: "Downloads cleared", type: "success" });
});

downloadManager.on("downloads-already-cleared", () => {
  ipcRenderer.send("main-addStatusNotif", { text: "Downloads already cleared", type: "info" });
});

/*
 ###### #    # #    #  ####               ####  ###### ##### ##### # #    #  ####   ####
 #      #    # ##   # #    #             #      #        #     #   # ##   # #    # #
 #####  #    # # #  # #         #####     ####  #####    #     #   # # #  # #       ####
 #      #    # #  # # #                       # #        #     #   # #  # # #  ###      #
 #      #    # #   ## #    #             #    # #        #     #   # #   ## #    # #    #
 #       ####  #    #  ####               ####  ######   #     #   # #    #  ####   ####
*/

function openSettings() {
  ipcRenderer.send("action-open-settings");
}

/*
 ###### #    # #    #  ####               ####  ######   ##   #####   ####  #    #
 #      #    # ##   # #    #             #      #       #  #  #    # #    # #    #
 #####  #    # # #  # #         #####     ####  #####  #    # #    # #      ######
 #      #    # #  # # #                       # #      ###### #####  #      #    #
 #      #    # #   ## #    #             #    # #      #    # #   #  #    # #    #
 #       ####  #    #  ####               ####  ###### #    # #    #  ####  #    #
*/

function goSearch() {
  searchManager.navigateSuggest(document.getElementById("search-input").value);
}

function clearSearch() {
  searchManager.clearSearch();
}

/*
 ###### #    # #    #  ####              #####   ####   ####  #    # #    #   ##   #####  #    #  ####
 #      #    # ##   # #    #             #    # #    # #    # #   #  ##  ##  #  #  #    # #   #  #
 #####  #    # # #  # #         #####    #####  #    # #    # ####   # ## # #    # #    # ####    ####
 #      #    # #  # # #                  #    # #    # #    # #  #   #    # ###### #####  #  #        #
 #      #    # #   ## #    #             #    # #    # #    # #   #  #    # #    # #   #  #   #  #    #
 #       ####  #    #  ####              #####   ####   ####  #    # #    # #    # #    # #    #  ####
*/

function newFolder() {
  bookmarkManager.newFolder();
}

function newBookmark() {
  bookmarkManager.getDefaultFolder().newBookmark();
}

function toggleArrange() {
  bookmarkManager.toggleArrange();
}

/*
 ###### #    # #    #  ####              ##### #    # ###### #    # ######  ####
 #      #    # ##   # #    #               #   #    # #      ##  ## #      #
 #####  #    # # #  # #         #####      #   ###### #####  # ## # #####   ####
 #      #    # #  # # #                    #   #    # #      #    # #           #
 #      #    # #   ## #    #               #   #    # #      #    # #      #    #
 #       ####  #    #  ####                #   #    # ###### #    # ######  ####
*/

function updateTheme() {
  loadTheme().then(({ theme, dark }) => {
    applyTheme(theme, dark);
  });
}

/*
 ###### #    # #    #  ####              #    # #  ####  #####  ####  #####  #   #
 #      #    # ##   # #    #             #    # # #        #   #    # #    #  # #
 #####  #    # # #  # #         #####    ###### #  ####    #   #    # #    #   #
 #      #    # #  # # #                  #    # #      #   #   #    # #####    #
 #      #    # #   ## #    #             #    # # #    #   #   #    # #   #    #
 #       ####  #    #  ####              #    # #  ####    #    ####  #    #   #
*/

function clearHistory() {
  historyManager.askClearHistory();
}

function deleteSelectedHistory() {
  historyManager.deleteSelectedHistory();
}

function loadMoreHistory() {
  historyManager.setLimiter(false);
}

function collapseHistory() {
  historyManager.setLimiter(true);
}

/*
 ###### #    # #    #  ####              #####   ####  #    # #    # #       ####    ##   #####   ####
 #      #    # ##   # #    #             #    # #    # #    # ##   # #      #    #  #  #  #    # #
 #####  #    # # #  # #         #####    #    # #    # #    # # #  # #      #    # #    # #    #  ####
 #      #    # #  # # #                  #    # #    # # ## # #  # # #      #    # ###### #    #      #
 #      #    # #   ## #    #             #    # #    # ##  ## #   ## #      #    # #    # #    # #    #
 #       ####  #    #  ####              #####   ####  #    # #    # ######  ####  #    # #####   ####
*/

function showItemInFolder(path) {
  shell.showItemInFolder(path);
}

function openItem(path) {
  shell.openItem(path);
}

function pauseDownload(id) {
  ipcRenderer.send("downloadManager-pauseDownload", id);
}

function cancelDownload(id) {
  ipcRenderer.send("downloadManager-cancelDownload", id);
}

function resumeDownload(id) {
  ipcRenderer.send("downloadManager-resumeDownload", id);
}

function retryDownload(url) {
  ipcRenderer.send("tabManager-addTab", url, false);
}

function clearDownloads() {
  downloadManager.askClearDownloads();
}

function loadMoreDownloads() {
  downloadManager.setLimiter(false);
}

function collapseDownloads() {
  downloadManager.setLimiter(true);
}

/*                                                                                           
  ###### #    # #    #  ####              #####   ##   #####      ####  #####   ####  #    # #####   ####  
  #      #    # ##   # #    #               #    #  #  #    #    #    # #    # #    # #    # #    # #      
  #####  #    # # #  # #         #####      #   #    # #####     #      #    # #    # #    # #    #  ####  
  #      #    # #  # # #                    #   ###### #    #    #  ### #####  #    # #    # #####       # 
  #      #    # #   ## #    #               #   #    # #    #    #    # #   #  #    # #    # #      #    # 
  #       ####  #    #  ####                #   #    # #####      ####  #    #  ####   ####  #       ####  
*/

function switchTabGroup(number) {
  ipcRenderer.send("tabManager-switchTabGroup", number);
}

/*
 # #####   ####               ####  ######   ##   #####   ####  #    #
 # #    # #    #             #      #       #  #  #    # #    # #    #
 # #    # #         #####     ####  #####  #    # #    # #      ######
 # #####  #                       # #      ###### #####  #      #    #
 # #      #    #             #    # #      #    # #   #  #    # #    #
 # #       ####               ####  ###### #    # #    #  ####  #    #
*/

ipcRenderer.on("searchManager-goToSearch", (event, text, cursorPos) => {
  searchManager.goToSearch(text, cursorPos);
});

ipcRenderer.on("searchManager-performSearch", (event, text) => {
  searchManager.performSearch(text);
});

ipcRenderer.on("searchManager-setSearchEngine", (event, engine) => {
  searchManager.setSearchEngine(engine);
});

/*
 # #####   ####               ####  #    # ###### #####  #        ##   #   #
 # #    # #    #             #    # #    # #      #    # #       #  #   # #
 # #    # #         #####    #    # #    # #####  #    # #      #    #   #
 # #####  #                  #    # #    # #      #####  #      ######   #
 # #      #    #             #    #  #  #  #      #   #  #      #    #   #
 # #       ####               ####    ##   ###### #    # ###### #    #   #
*/

ipcRenderer.on("overlay-scrollToId", (event, id) => {
  document.getElementById(id).scrollIntoView({
    behavior: "smooth"
  });
});

/*
 # #####   ####              #####   ####   ####  #    # #    #   ##   #####  #    #  ####
 # #    # #    #             #    # #    # #    # #   #  ##  ##  #  #  #    # #   #  #
 # #    # #         #####    #####  #    # #    # ####   # ## # #    # #    # ####    ####
 # #####  #                  #    # #    # #    # #  #   #    # ###### #####  #  #        #
 # #      #    #             #    # #    # #    # #   #  #    # #    # #   #  #   #  #    #
 # #       ####              #####   ####   ####  #    # #    # #    # #    # #    #  ####
*/

ipcRenderer.on("bookmarkManager-addBookmark", (event, name, url) => {
  bookmarkManager.getDefaultFolder().addBookmark(name, url);
});

ipcRenderer.on("bookmarkManager-removeFolder", (event, id) => {
  bookmarkManager.getFolderById(id).delete();
});

ipcRenderer.on("bookmarkManager-addFolderWithBookmarks", (event, folderName, bookmarks) => {
  bookmarkManager.addFolderWithBookmarks(folderName, bookmarks);
});

ipcRenderer.on("bookmarkManager-checkIfBookmarked", (event, url) => {
  bookmarkManager.checkIfBookmarked(url);
});

ipcRenderer.on("bookmarkManager-showBookmarkOptions", (event, id) => {
  bookmarkManager.showBookmarkOptions(id);
});

/*
 # #####   ####              #    # #  ####  #####  ####  #####  #   #
 # #    # #    #             #    # # #        #   #    # #    #  # #
 # #    # #         #####    ###### #  ####    #   #    # #    #   #
 # #####  #                  #    # #      #   #   #    # #####    #
 # #      #    #             #    # # #    #   #   #    # #   #    #
 # #       ####              #    # #  ####    #    ####  #    #   #
*/

ipcRenderer.on("historyManager-insertBeforeHistoryItem", (event, url) => {
  historyManager.insertBeforeHistoryItem(url);
});

ipcRenderer.on("historyManager-clearHistory", (event, text) => {
  historyManager.clearHistory();
});

/*
 # #####   ####              ##### #    # ###### #    # ######  ####
 # #    # #    #               #   #    # #      ##  ## #      #
 # #    # #         #####      #   ###### #####  # ## # #####   ####
 # #####  #                    #   #    # #      #    # #           #
 # #      #    #               #   #    # #      #    # #      #    #
 # #       ####                #   #    # ###### #    # ######  ####
*/

ipcRenderer.on("overlay-updateTheme", (event) => {
  updateTheme();
});

/*
 # #####   ####              #####   ####  #    # #    # #       ####    ##   #####   ####
 # #    # #    #             #    # #    # #    # ##   # #      #    #  #  #  #    # #
 # #    # #         #####    #    # #    # #    # # #  # #      #    # #    # #    #  ####
 # #####  #                  #    # #    # # ## # #  # # #      #    # ###### #    #      #
 # #      #    #             #    # #    # ##  ## #   ## #      #    # #    # #    # #    #
 # #       ####              #####   ####  #    # #    # ######  ####  #    # #####   ####
*/

ipcRenderer.on("downloadManager-createDownload", (event, download) => {
  downloadManager.appendDownload(true, download.id, download.name, download.url, download.time);
});

ipcRenderer.on("downloadManager-setDownloadStatusInterrupted", (event, download) => {
  downloadManager.getDownloadById(download.id).setStatusInterrupted();
});

ipcRenderer.on("downloadManager-setDownloadStatusPause", (event, download) => {
  downloadManager.getDownloadById(download.id).setStatusPause(download.bytes, download.total);
});

ipcRenderer.on("downloadManager-setDownloadProcess", (event, download) => {
  downloadManager.getDownloadById(download.id).setProcess(download.bytes, download.total);
});

ipcRenderer.on("downloadManager-setDownloadStatusDone", (event, download) => {
  downloadManager.getDownloadById(download.id).setStatusDone(download.path);
});

ipcRenderer.on("downloadManager-setDownloadStatusFailed", (event, download) => {
  downloadManager.getDownloadById(download.id).setStatusFailed();
});

ipcRenderer.on("downloadManager-clearDownloads", (event, text) => {
  downloadManager.clearDownloads();
});

/*                                                             
  # #####   ####              #####   ##   #####      ####  #####   ####  #    # #####   ####  
  # #    # #    #               #    #  #  #    #    #    # #    # #    # #    # #    # #      
  # #    # #         #####      #   #    # #####     #      #    # #    # #    # #    #  ####  
  # #####  #                    #   ###### #    #    #  ### #####  #    # #    # #####       # 
  # #      #    #               #   #    # #    #    #    # #   #  #    # #    # #      #    # 
  # #       ####                #   #    # #####      ####  #    #  ####   ####  #       ####  
*/

ipcRenderer.on("overlay-switchTabGroup", (event, tabGroupId) => {
  let groups = [
    document.getElementById("group-0"),
    document.getElementById("group-1"),
    document.getElementById("group-2")
  ];

  let group = document.getElementById("group-" + tabGroupId);

  for(let i = 0; i < groups.length; i++) {
    if(groups[i] == group) {
      groups[i].classList.add("active");
    } else {
      groups[i].classList.remove("active");
    }
  }
});

/*
 # #    # # #####
 # ##   # #   #
 # # #  # #   #
 # #  # # #   #
 # #   ## #   #
 # #    # #   #
*/

function init() {
  updateTheme();

  document.getElementById("search-input").focus();

  document.body.onmousedown = function(e) { 
    if (e.button === 1) {
      return false; 
    }
  }
}

document.onreadystatechange = () => {
  if (document.readyState == "complete") {
      init();
  }
}

/*
 ##### #    # ######    ###### #    # #####
   #   #    # #         #      ##   # #    #
   #   ###### #####     #####  # #  # #    #
   #   #    # #         #      #  # # #    #
   #   #    # #         #      #   ## #    #
   #   #    # ######    ###### #    # #####
*/