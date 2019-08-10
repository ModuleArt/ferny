const isDarkColor = require("is-dark-color");

var backgroundColor = null;

function applyBgColor(color) {
    if(color == null) {
      color = backgroundColor;
    } else {
      backgroundColor = color;
    }

    document.documentElement.style.setProperty('--color-back', color);

    if(isDarkColor(color)) {
        setIconsStyle('light');
    
        document.documentElement.style.setProperty('--color-top', 'white');
        document.documentElement.style.setProperty('--color-over', 'rgba(0, 0, 0, 0.3)');
    } else {
        setIconsStyle('dark');
    
        document.documentElement.style.setProperty('--color-top', 'black');
        document.documentElement.style.setProperty('--color-over', 'rgba(0, 0, 0, 0.1)');
    }
}

function setIconsStyle(str) {
    var icons = document.getElementsByClassName('theme-icon');
  
    for(var i = 0; i < icons.length; i++) {
        icons[i].src = "../themes/" + str + "/icons/" + icons[i].name + ".png";
        icons[i].style.opacity = "1";
    }
}

module.exports = applyBgColor;