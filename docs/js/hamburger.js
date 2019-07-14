function toggleMenu() {
  var menuIcon = document.getElementById('hamburger').getElementsByTagName('img')[0];
  var header = document.getElementById('header');

  if(header.classList.contains('show')) {
    header.classList.remove('show');
    menuIcon.src = "imgs/icons/menu.png";
  } else {
    header.classList.add('show');
    menuIcon.src = "imgs/icons/close.png";
  }
}
