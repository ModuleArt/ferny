/*
.########..########..#######..##.....##.####.########..########
.##.....##.##.......##.....##.##.....##..##..##.....##.##......
.##.....##.##.......##.....##.##.....##..##..##.....##.##......
.########..######...##.....##.##.....##..##..########..######..
.##...##...##.......##..##.##.##.....##..##..##...##...##......
.##....##..##.......##....##..##.....##..##..##....##..##......
.##.....##.########..#####.##..#######..####.##.....##.########
*/

const { ipcRenderer } = require('electron');
const dragula = require("dragula");
var drag = dragula([document.getElementById('bookmarks')], { direction: "horizontal" });

/*
.########.##.....##.##....##..######..########.####..#######..##....##..######.
.##.......##.....##.###...##.##....##....##.....##..##.....##.###...##.##....##
.##.......##.....##.####..##.##..........##.....##..##.....##.####..##.##......
.######...##.....##.##.##.##.##..........##.....##..##.....##.##.##.##..######.
.##.......##.....##.##..####.##..........##.....##..##.....##.##..####.......##
.##.......##.....##.##...###.##....##....##.....##..##.....##.##...###.##....##
.##........#######..##....##..######.....##....####..#######..##....##..######.
*/

/*
 ## ### ### ###  ## ###  ## ##  ### ###
# # # # # # ##  # # #   # # # # #   ##
### ### ### ### ### #   ### # # ### ###
    #   #
*/

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
function changeBorderRadius(size) {
  document.documentElement.style.setProperty('--px-radius', size + 'px');
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

/*

#           #               #
### ### ### # # ###  ## ### # #  ##
# # # # # # ##  ### # # #   ##   #
### ### ### # # # # ### #   # # ##
*/

function closeBookmarkEditor() {
  document.getElementById('edit-bookmark').style.display = "none";
}
function loadBookmarks() {
  var fs = require("fs");
  var ppath = require('persist-path')('ArrowBrowser');

  try {
    document.getElementById('bookmarks').innerHTML = "";
    var jsonstr = fs.readFileSync(ppath + "\\json\\bookmarks.json");
    var arr = JSON.parse(jsonstr);
    var i;
    for (i = 0; i < arr.length; i++) {
      let Data = {
        index: arr[i].index,
        url: arr[i].url,
        name: arr[i].name
      };
      createBookmark(arr[i].name, arr[i].url);
    }
  } catch (e) {

  }
}
function removeBookmark(deleteBtn) {
  document.getElementById('bookmarks').removeChild(deleteBtn.parentNode.parentNode);
  saveBookmarks();
}
function editBookmark(editBtn) {
  document.getElementById('edit-bookmark').style.display = "";

  document.getElementById('bookmark-name').value = editBtn.parentNode.parentNode.getElementsByTagName('label')[0].innerHTML;
  document.getElementById('bookmark-url').value = editBtn.parentNode.parentNode.title;

  document.getElementById('save-btn').onclick = function() {
    editBtn.parentNode.parentNode.getElementsByTagName('label')[0].innerHTML = document.getElementById('bookmark-name').value;
    editBtn.parentNode.parentNode.title = document.getElementById('bookmark-url').value;
    editBtn.parentNode.parentNode.getElementsByTagName('img')[0].src = 'http://www.google.com/s2/favicons?domain=' + document.getElementById('bookmark-url').value;;
    closeBookmarkEditor();
    saveBookmarks();
  }
}
function openBookmarkInNewTab(inNewTabBtn) {
  window.open(inNewTabBtn.parentNode.parentNode.title, '_blank');
}
function copyBookmark(copyBtn) {
  var input = document.createElement('input');
  input.value = copyBtn.parentNode.parentNode.title;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
}
function createBookmark(name, url) {
  let div = document.createElement('a');
  div.classList.add('bookmark');
  div.title = url;

  div.onclick = function(e) {
    // window.location.href = url;
    ipcRenderer.send('request-open-url', url);
  };

  div.addEventListener('contextmenu', (e) => {
    e.preventDefault();

    closeBookmarkEditor();

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

  div.addEventListener('auxclick', (e) => {
    e.preventDefault();
     if(e.which == 2) {
       window.open(div.title, '_blank');
     }
  }, false);

  div.innerHTML = `
      <img class="bookmark-icon" src="` + 'http://www.google.com/s2/favicons?domain=' + url + `">
    <label>` + name + `</label>
    <center class="bookmark-menu">
      <img class="bookmark-menu-btn theme-icon" name="tab" title="Open in new tab" onclick="openBookmarkInNewTab(this)">
      <img class="bookmark-menu-btn theme-icon" name="copy" title="Copy URL" onclick="copyBookmark(this)">
      <img class="bookmark-menu-btn theme-icon" name="edit" title="Edit" onclick="editBookmark(this)">
      <img class="bookmark-menu-btn theme-icon" name="delete" title="Delete" onclick="removeBookmark(this)">
    </center>`;

  div.getElementsByClassName('bookmark-menu')[0].addEventListener("click", (e) => {
    e.stopPropagation();
    div.getElementsByClassName('bookmark-menu')[0].classList.remove('active');
  });

  var options = document.createElement('img');
  options.classList.add('bookmark-options', 'theme-icon');
  options.name = "options";
  options.onclick = function(e) {
    e.stopPropagation();

    closeBookmarkEditor();

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
  options.title = "Options";

  div.appendChild(options);

  document.getElementById('bookmarks').appendChild(div);

  loadTheme();

  return div.getElementsByClassName('bookmark-menu-btn')[2];
}
function newBookmark() {
  editBookmark(createBookmark("Google", "https://google.com"));
  loadTheme();
  saveBookmarks();
}
function saveBookmarks() {
  var fs = require('fs');
  var ppath = require('persist-path')('ArrowBrowser');

  var bookmarksArray = [];

  var bookmarks = document.getElementById('bookmarks').childNodes;

  for(var i = 0; i < bookmarks.length; i++) {
    console.log(bookmarks[i].getElementsByTagName('label')[0].innerHTML);
    let Data = {
      url: bookmarks[i].title,
      name: bookmarks[i].getElementsByTagName('label')[0].innerHTML
    };
    bookmarksArray.push(Data);
  }

  fs.writeFileSync(ppath + "\\json\\bookmarks.json", JSON.stringify(bookmarksArray));
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

ipcRenderer.on('action-update-bookmarks', (event, arg) => {
  loadBookmarks();
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
  loadBookmarks();
  loadTheme();
  loadBorderRadius();

  drag.on('drop', function(el, target, source, sibling) {
    saveBookmarks();
  });

  document.getElementById("search").addEventListener("keyup", function(event) {
    if(document.getElementById("search").value.length > 0) {
      var search = document.getElementById("search").value;
      var elements = document.getElementsByClassName('bookmark');
      for(var i = 0; i < elements.length; i++) {
        var text = elements[i].getElementsByTagName('label')[0].innerHTML + " " + elements[i].title;
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