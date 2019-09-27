function setIconsStyle(str) {
    var icons = document.getElementsByClassName("theme-icon");
  
    for(var i = 0; i < icons.length; i++) {
        icons[i].src = "../imgs/theme-icons/" + str + "/" + icons[i].name + ".png";
        icons[i].style.opacity = "1";
    }
}

function applyTheme(theme) {
    document.documentElement.style.setProperty("--color-back", theme.colorBack);
    document.documentElement.style.setProperty("--color-element", theme.colorElement);
    document.documentElement.style.setProperty("--color-border", theme.colorBorder);
    document.documentElement.style.setProperty("--color-second", theme.colorSecond);
    document.documentElement.style.setProperty("--color-top", theme.colorTop);

    document.documentElement.style.setProperty("--shadow-focus", theme.shadowFocus);
    document.documentElement.style.setProperty("--opacity-over", theme.opacityOver);
    document.documentElement.style.setProperty("--px-radius", theme.pxRadius);

    setIconsStyle(theme.icons);
}

module.exports = applyTheme;