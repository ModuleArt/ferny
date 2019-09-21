/*
  ####   ####  #    #  ####  #####
 #    # #    # ##   # #        #
 #      #    # # #  #  ####    #
 #      #    # #  # #      #   #
 #    # #    # #   ## #    #   #
  ####   ####  #    #  ####    #
*/

const { ipcRenderer } = require("electron");

const loadTheme = require("../modules/loadTheme.js");
const applyTheme = require("../modules/applyTheme.js");

const BookmarkManager = require("../modules/BookmarkManager/BookmarkManager.js");
const SearchManager = require("../modules/SearchManager/SearchManager.js");
const HistoryManager = require("../modules/HistoryManager/HistoryManager.js");

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

let bookmarkManager = new BookmarkManager(document.getElementById('bookmarks-container'));

bookmarkManager.on("folder-added", () => {
  ipcRenderer.send("request-add-status-notif", { text: "Folder added", type: "success" });
});

bookmarkManager.on("folder-appended", () => {
  updateTheme();
});

bookmarkManager.on("ask-for-delete-folder", (id, name) => {
  ipcRenderer.send("request-add-quest-notif", { 
    text: `Are you sure to delete "` + name + `" folder?`, 
    ops: [{ 
      text: "Delete", icon: "delete-16", click: "removeFolder('" + id + "')" 
    }] 
  });
});

bookmarkManager.on("folder-deleted", () => {
  ipcRenderer.send("request-add-status-notif", { text: "Folder deleted", type: "error" });
});

bookmarkManager.on("folder-edited", () => {
  ipcRenderer.send("request-add-status-notif", { text: "Folder edited", type: "info" });
});


bookmarkManager.on("bookmark-added", () => {
  ipcRenderer.send("request-add-status-notif", { text: "Bookmark added", type: "success" });
});

bookmarkManager.on("bookmark-appended", () => {
  updateTheme();
});

bookmarkManager.on("bookmark-deleted", () => {
  ipcRenderer.send("request-add-status-notif", { text: "Bookmark deleted", type: "error" });
});

bookmarkManager.on("bookmark-edited", () => {
  ipcRenderer.send("request-add-status-notif", { text: "Bookmark edited", type: "info" });
});

bookmarkManager.on("bookmark-editor-toggled", () => {
  updateTheme();
});

bookmarkManager.on("folder-editor-toggled", () => {
  updateTheme();
});

/*
 #    # #  ####  #####  ####  #####  #   #
 #    # # #        #   #    # #    #  # #
 ###### #  ####    #   #    # #    #   #
 #    # #      #   #   #    # #####    #
 #    # # #    #   #   #    # #   #    #
 #    # #  ####    #    ####  #    #   #
*/

let historyManager = new HistoryManager(document.getElementById('history-container'));

historyManager.on("history-item-added", () => {
  updateTheme();
});

historyManager.on("clear-history", () => {
  ipcRenderer.send("request-add-quest-notif", { 
    text: "Are you sure to clear all history?", 
    ops: [{ 
      text: "Clear", icon: "delete-16", click: "clearHistory()" 
    }] 
  });
});

historyManager.on("history-cleared", () => {
  ipcRenderer.send("request-add-status-notif", { text: "History cleared", type: "success" });
});

historyManager.on("history-already-cleared", () => {
  ipcRenderer.send("request-add-status-notif", { text: "History already cleared", type: "info" });
});

/*
 ###### #    # #    #  ####               ####  ######   ##   #####   ####  #    #
 #      #    # ##   # #    #             #      #       #  #  #    # #    # #    #
 #####  #    # # #  # #         #####     ####  #####  #    # #    # #      ######
 #      #    # #  # # #                       # #      ###### #####  #      #    #
 #      #    # #   ## #    #             #    # #      #    # #   #  #    # #    #
 #       ####  #    #  ####               ####  ###### #    # #    #  ####  #    #
*/

function goSearch() {
  searchManager.navigateSuggest(document.getElementById('search-input').value);
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
  loadTheme().then(function(theme) {
    applyTheme(theme);
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
  bookmarkManager.removeFolder(id);
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

ipcRenderer.on("action-change-theme", (event, theme) => {
  applyTheme(theme);
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

  document.getElementById('search-input').focus();
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