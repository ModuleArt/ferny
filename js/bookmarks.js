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
const dragula = require("dragula");
const ppath = require('persist-path')('Ferny');
const fs = require("fs");
const getAvColor = require('color.js');

const folderDrag = dragula([document.getElementById('folders')], {
  moves: function(el, container, handle) {
    return handle.classList.contains('name');
  },
  direction: "vertical"
});
folderDrag.on('drop', function(el, target, source, sibling) {
  saveFolders();
});

const bookmarkDrag = dragula([document.getElementById('all-bookmarks')], {
  direction: "vertical"
});
bookmarkDrag.on('drag', function(el, target, source, sibling) {
  el.getElementsByClassName('bookmark-menu')[0].classList.remove('active');
});
bookmarkDrag.on('drop', function(el, target, source, sibling) {
  saveBookmarks();
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
const loadTheme = require("../modules/loadTheme.js");
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

function closeAllEditors() {
  cancelSearch();

  document.getElementById('bookmark-editor').style.display = "none";
  document.getElementById('folder-editor').style.display = "none";
  document.getElementById('bookmark-creator').style.display = "none";
  document.getElementById('folder-creator').style.display = "none";
  document.getElementById('search-panel').style.display = "none";

  document.getElementById('search-btn').classList.remove('active');
  document.getElementById('new-bookmark-btn').classList.remove('active');
  document.getElementById('new-folder-btn').classList.remove('active');
}

function notif(text, type) {
  let Data = {
    text: text,
    type: type
  };
  ipcRenderer.send('request-add-status-notif', Data)
}

function scrollToTop() {
  document.body.scrollIntoView({
	  	behavior: 'smooth'
	});
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

function showSearchPanel() {
  closeAllEditors();

  document.getElementById('search-panel').style.display = "";
  document.getElementById('search-btn').classList.add('active');
  document.getElementById('search').select();
}

function searchKeyUp() {
  if(document.getElementById("search").value.length > 0) {
    var search = document.getElementById("search").value.toLowerCase();
    var elements = document.getElementsByClassName('bookmark');
    for(var i = 0; i < elements.length; i++) {
      var text = elements[i].getElementsByTagName('label')[0].innerHTML.toLowerCase() + " " + elements[i].name.toLowerCase();
      if(text.indexOf(search) != -1) {
        elements[i].style.display = "inline-block";
      } else {
        elements[i].style.display = "none";
      }
    }
  } else {
    var elements = document.getElementsByClassName('bookmark');
    for(var i = 0; i < elements.length; i++) {
      elements[i].style.display = "inline-block";
    }
  }
}

function cancelSearch() {
  document.getElementById('search').value = "";
  searchKeyUp();
}

/*
.########...#######...#######..##....##.##.....##....###....########..##....##..######.
.##.....##.##.....##.##.....##.##...##..###...###...##.##...##.....##.##...##..##....##
.##.....##.##.....##.##.....##.##..##...####.####..##...##..##.....##.##..##...##......
.########..##.....##.##.....##.#####....##.###.##.##.....##.########..#####.....######.
.##.....##.##.....##.##.....##.##..##...##.....##.#########.##...##...##..##.........##
.##.....##.##.....##.##.....##.##...##..##.....##.##.....##.##....##..##...##..##....##
.########...#######...#######..##....##.##.....##.##.....##.##.....##.##....##..######.
*/

function openBookmarkInBackground(inBackBtn) {
  ipcRenderer.send('tabManager-addTab', inNewTabBtn.parentNode.parentNode.name, false);
}

function copyBookmark(copyBtn) {
  clipboard.writeText(copyBtn.parentNode.parentNode.name);
}

function editBookmark(bookmark) {
  showBookmarkEditor();

  document.getElementById('edit-bookmark-name').value = bookmark.getElementsByTagName('label')[0].innerHTML;
  document.getElementById('edit-bookmark-url').value = bookmark.name;
  document.getElementById('edit-bookmark-folder').value = bookmark.parentNode.parentNode.getElementsByTagName('label')[0].innerHTML;

  document.getElementById('remove-bookmark-btn').onclick = function() {
    removeBookmark(bookmark);
    closeAllEditors();
  }

  document.getElementById('save-bookmark-btn').onclick = function() {
    var bool = false;
    var folders = document.getElementById('folders').getElementsByClassName('folder');
    for(var i = 0; i < folders.length; i++) {
      if(folders[i].getElementsByTagName('label')[0].innerHTML == document.getElementById('edit-bookmark-folder').value) {
        bool = true;
        break;
      }
    }
    
    if(bool) {
      removeBookmark(bookmark);
      createBookmark(document.getElementById('edit-bookmark-name').value, document.getElementById('edit-bookmark-url').value, document.getElementById('edit-bookmark-folder').value);
      closeAllEditors();
      saveBookmarks();
    } else {
      notif("There is no such folder", "error");
    }
  }
}

function showBookmarkEditor() {
  closeAllEditors();

  document.getElementById('bookmark-editor').style.display = "";
  document.getElementById('edit-bookmark-name').select();
  scrollToTop();
}

function showBookmarkCreator() {
  closeAllEditors();

  document.getElementById('bookmark-creator').style.display = "";
  document.getElementById('new-bookmark-btn').classList.add('active');
  document.getElementById('bookmark-name').select();
  scrollToTop();
}

function newBookmark() {
  var name = document.getElementById('bookmark-name').value;
  var url = document.getElementById('bookmark-url').value;
  var folder = document.getElementById('bookmark-folder').value;

  var bool = false;
  var folders = document.getElementById('folders').getElementsByClassName('folder');
  for(var i = 0; i < folders.length; i++) {
    if(folders[i].getElementsByTagName('label')[0].innerHTML == folder) {
      bool = true;
      break;
    }
  }
  
  if(bool) {
    createBookmark(name, url, folder);
    saveBookmarks();
    closeAllEditors();
  } else {
    notif("There is no such folder", "error");
  }
}

function appendBookmark(name, url, folderEl) {
  let div = document.createElement('button');
  div.classList.add('bookmark');
  div.title = name + "\n" + url;
  div.name = url;

  div.onclick = function(e) {
    ipcRenderer.send('tabManager-addTab', url, true);
  };

  div.addEventListener('contextmenu', (e) => {
    e.preventDefault();

    if(div.getElementsByClassName('bookmark-menu')[0].classList.contains('active')) {
      div.getElementsByClassName('bookmark-menu')[0].classList.remove('active');
    } else {
      var bookmarks = document.getElementsByClassName('bookmark');
      for(var i = 0; i < bookmarks.length; i++) {
        bookmarks[i].getElementsByClassName('bookmark-menu')[0].classList.remove('active');
      }
      div.getElementsByClassName('bookmark-menu')[0].classList.add('active');
    }
  }, false);

  div.onauxclick = (event) => {
    event.preventDefault();
    if(event.which == 2) {
      ipcRenderer.send('tabManager-addTab', true, false);
    }
  }

  div.innerHTML = `
    <img class="bookmark-icon" src="` + 'http://www.google.com/s2/favicons?domain=' + url + `">
    <label class="bookmark-title">` + name + `</label>
    <label class="bookmark-preview">` + url + `</label>
    <center class="bookmark-menu">
      <button class='nav-btn' title="Open in background" onclick="openBookmarkInBackground(this)">
        <img class="theme-icon" name="tab-16">
        <label>Background</label>
      </button>
      <button class='nav-btn' title="Copy URL" onclick="copyBookmark(this)">
        <img class="theme-icon" name="copy-16">
        <label>Copy</label>
      </button>
      <button class='nav-btn' title="Edit" onclick="editBookmark(this.parentNode.parentNode)">
        <img class="theme-icon" name="edit-16">
        <label>Edit</label>
      </button>
    </center>`;

  div.getElementsByClassName('bookmark-menu')[0].addEventListener("click", (e) => {
    e.stopPropagation();
    div.getElementsByClassName('bookmark-menu')[0].classList.remove('active');
  });

  var color = new getAvColor(div.getElementsByTagName('img')[0]);
  color.mostUsed(result => {
    div.style.backgroundColor = rgbToRgbaString(result[0]);
  });

  var options = document.createElement('button');
  options.classList.add('bookmark-options');
  options.innerHTML = "<img name='options-12' class='theme-icon'>"
  options.onclick = function(e) {
    e.stopPropagation();

    if(div.getElementsByClassName('bookmark-menu')[0].classList.contains('active')) {
      div.getElementsByClassName('bookmark-menu')[0].classList.remove('active');
    } else {
      var bookmarks = document.getElementsByClassName('bookmark');
      for(var i = 0; i < bookmarks.length; i++) {
        bookmarks[i].getElementsByClassName('bookmark-menu')[0].classList.remove('active');
      }
      div.getElementsByClassName('bookmark-menu')[0].classList.add('active');
    }
  };
  options.title = "Toggle options";

  div.appendChild(options);

  folderEl.getElementsByTagName('div')[0].appendChild(div);

  updateTheme();
}

function updateTheme() {
  loadTheme().then(function(theme) {
    applyTheme(theme);
  });
}

function createBookmark(name, url, folder) {
  if(folder == null || folder == "" || folder == "undefined") {
    folder = "All bookmarks";
  }
  var folders = document.getElementById('folders').getElementsByClassName('folder');
  for(var i = 0; i < folders.length; i++) {
    var n = folders[i].getElementsByTagName('label')[0].innerHTML;
    if(n == folder) {
      appendBookmark(name, url, folders[i]);
      break;
    }
  }
}

function removeBookmark(bookmark) {
  bookmark.parentNode.removeChild(bookmark);
  saveBookmarks();
}

function loadBookmarks() {
  try {
    var folders = document.getElementById('folders').getElementsByClassName('folder');
    for(var i = 0; i < folders.length; i++) {
      folders[i].getElementsByTagName('div')[0].innerHTML = "";
    }
    fs.readFile(ppath + "/json/bookmarks.json", function(err, data) {
      var arr = JSON.parse(data);
      for (var i = 0; i < arr.length; i++) {
        createBookmark(arr[i].name, arr[i].url, arr[i].folder);
      }
    });
  } catch (e) {

  }
}

function saveBookmarks() {
  var bookmarksArray = [];

  var bookmarks = document.getElementById('folders').getElementsByClassName('bookmark');

  for(var i = 0; i < bookmarks.length; i++) {
    let Data = {
      url: bookmarks[i].name,
      name: bookmarks[i].getElementsByTagName('label')[0].innerHTML,
      folder: bookmarks[i].parentNode.parentNode.getElementsByTagName('label')[0].innerHTML
    };
    bookmarksArray.push(Data);
  }

  saveFileToJsonFolder('bookmarks', JSON.stringify(bookmarksArray));
}

/*
.########..#######..##.......########..########.########...######.
.##.......##.....##.##.......##.....##.##.......##.....##.##....##
.##.......##.....##.##.......##.....##.##.......##.....##.##......
.######...##.....##.##.......##.....##.######...########...######.
.##.......##.....##.##.......##.....##.##.......##...##.........##
.##.......##.....##.##.......##.....##.##.......##....##..##....##
.##........#######..########.########..########.##.....##..######.
*/

function newBookmarkInFolder(folder) {
  showBookmarkCreator();

  document.getElementById('bookmark-folder').value = folder.getElementsByClassName('name')[0].innerHTML;
}

function editFolder(folder) {
  showFolderEditor();

  document.getElementById('edit-folder-name').value = folder.getElementsByClassName('name')[0].innerHTML;

  document.getElementById('remove-folder-btn').onclick = function() {
    ipcRenderer.send('request-add-quest-notif', { 
      text: "Are you sure to remove this folder?", 
      ops: [{ 
        text:'Delete', 
        icon:'delete-16', 
        click:'removeFolder("' + folder.getElementsByClassName('name')[0].innerHTML + '")' 
      }] 
    });
    closeAllEditors();
  }

  document.getElementById('save-folder-btn').onclick = function() {
    var bool = false;
    var folders = document.getElementById('folders').getElementsByClassName('folder');
    for(var i = 0; i < folders.length; i++) {
      if(folders[i].getElementsByTagName('label')[0].innerHTML == document.getElementById('edit-folder-name').value) {
        bool = true;
        break;
      }
    }
    
    if(bool) {
      notif("This folder name is already taken", "error");
    } else {
      folder.getElementsByClassName('name')[0].innerHTML = document.getElementById('edit-folder-name').value;

      closeAllEditors();
      saveFolders();
      saveBookmarks();
    }
  }
}

function showFolderEditor() {
  closeAllEditors();

  document.getElementById('folder-editor').style.display = "";
  document.getElementById('edit-folder-name').select();
  scrollToTop();
}

function showFolderCreator() {
  closeAllEditors();

  document.getElementById('folder-creator').style.display = "";
  document.getElementById('new-folder-btn').classList.add('active');
  document.getElementById('folder-name').select();
}

function newFolder() {
  var name = document.getElementById('folder-name').value;

  if(name == null || name == "") {
    notif("First enter the folder name", "warning");
  } else {
    var bool = false;
    var folders = document.getElementById('folders').getElementsByClassName('folder');
    for(var i = 0; i < folders.length; i++) {
      if(folders[i].getElementsByTagName('label')[0].innerHTML == name) {
        bool = true;
        break;
      }
    }
    
    if(bool) {
      notif("This folder name is already taken", "error")
    } else {
      createFolder(name);
      saveFolders();
      closeAllEditors();
    }
  }
}

function createFolder(name) {
  var folders = document.getElementById('folders');
  
  var div = document.createElement('div');
  div.classList.add('folder');
  div.innerHTML = `
    <label class="name">` + name + `</label>
    <button title="Create bookmark here" onclick="newBookmarkInFolder(this.parentNode)" class="nav-btn add-bookmark-btn">
      <img name="add-bookmark-16" class="theme-icon">
    </button>
    <button title="Edit folder" onclick="editFolder(this.parentNode)" class="nav-btn edit-btn">
      <img name="edit-folder-16" class="theme-icon">
    </button>
    <div class="bookmarks"></div>`;

  folders.appendChild(div);

  bookmarkDrag.containers.push(div.getElementsByTagName('div')[0]);

  updateTheme();
}

function loadFolders() {
  try {
    fs.readFile(ppath + "/json/folders.json", function(err, data) {
      var arr = JSON.parse(data);
      for (var i = 0; i < arr.length; i++) {
        createFolder(arr[i].name);
      }
    });
  } catch (e) {

  }
}

function saveFolders() {
  var folderArray = [];
  var folders = document.getElementById('folders').getElementsByClassName('folder');
  for(var i = 0; i < folders.length; i++) {
    if(folders[i].getElementsByTagName('label')[0].innerHTML != "All bookmarks") {
      let Data = {
        name: folders[i].getElementsByTagName('label')[0].innerHTML
      };
      folderArray.push(Data);
    }
  }
  saveFileToJsonFolder('folders', JSON.stringify(folderArray));
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

ipcRenderer.on('action-remove-folder', (event, arg) => {
  var arr = document.getElementsByClassName('folder');
  for(var i = 0; i < arr.length; i++) {
    if(arr[i].getElementsByClassName('name')[0].innerHTML == arg) {
      arr[i].parentNode.removeChild(arr[i]);
    }
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

  loadFolders();
  loadBookmarks();
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
