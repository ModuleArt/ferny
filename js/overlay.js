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
  updateTheme();
});

bookmarkManager.on("bookmark-added", () => {
  updateTheme();
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
  historyManager.clearHistory();
}

function deleteSelectedHistory() {
  historyManager.deleteSelectedHistory();
}

/*
 # #####   ####               ####  ######   ##   #####   ####  #    #
 # #    # #    #             #      #       #  #  #    # #    # #    #
 # #    # #         #####     ####  #####  #    # #    # #      ######
 # #####  #                       # #      ###### #####  #      #    #
 # #      #    #             #    # #      #    # #   #  #    # #    #
 # #       ####               ####  ###### #    # #    #  ####  #    #
*/

ipcRenderer.on("searchManager-goToSearch", (event, text) => {
  searchManager.goToSearch(text);
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