function toggleMenu() {
  var btns = document.getElementsByClassName('navbar-btn');
  var links = document.getElementById('navbar-links');
  var menuIcon = document.getElementById('navbar-menu-btn').getElementsByTagName('img')[0];
  console.log(menuIcon);

  if(links.style.display == "block") {
    for(var i = 0; i < btns.length; i++) {
      btns[i].style.display = "none";
    }

    links.style.display = "none";
    menuIcon.src = "imgs/icons/menu.png";
  } else {
    for(var i = 0; i < btns.length; i++) {
      btns[i].style.display = "block";
    }

    links.style.display = "block";
    menuIcon.src = "imgs/icons/close.png";
  }
}
