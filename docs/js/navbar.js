function toggleMenu() {
  // var btns = document.getElementsByClassName('navbar-btn');
  // var links = document.getElementById('navbar-links');
  // var menuIcon = document.getElementById('navbar-menu-btn').getElementsByTagName('img')[0];
  // console.log(menuIcon);

  // if(links.style.display == "block") {
  //   for(var i = 0; i < btns.length; i++) {
  //     btns[i].style.display = "none";
  //   }

  //   links.style.display = "none";
  //   menuIcon.src = "imgs/icons/menu.png";
  // } else {
  //   for(var i = 0; i < btns.length; i++) {
  //     btns[i].style.display = "block";
  //   }

  //   links.style.display = "block";
  //   menuIcon.src = "imgs/icons/close.png";
  // }

  var menuIcon = document.getElementById('navbar-menu-btn').getElementsByTagName('img')[0];
  var navbar = document.getElementById('navbar');

  if(navbar.classList.contains('show')) {
    navbar.classList.remove('show');
    menuIcon.src = "imgs/icons/menu.png";
  } else {
    navbar.classList.add('show');
    menuIcon.src = "imgs/icons/close.png";
  }
}
