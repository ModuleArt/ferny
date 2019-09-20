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

function buttonOff(button) {
  button.classList.remove('show');
}

function buttonToggle(button) {
  button.classList.toggle('show');
}

function toggleUpdate(div) {
  div.parentNode.classList.toggle('expand');
}

function moreUpdates() {
  document.getElementById('more-updates').style.display = "none";
  var updates = document.getElementsByClassName('update');
  for(var i = 0; i < updates.length; i++) {
    if(!updates[i].classList.contains('show')) {
      updates[i].classList.add('show');
    }
  }
}
