function setIconsStyle(str) {
    var icons = document.getElementsByClassName("theme-icon");
  
    for(var i = 0; i < icons.length; i++) {
        icons[i].src = "../imgs/theme-icons/" + str + "/" + icons[i].name + ".png";
        icons[i].classList.add("loaded");
    }
}

function applyTheme(theme, dark) {
    document.documentElement.style.setProperty("--px-radius", theme.pxRadius);

    if(dark) {
        document.documentElement.style.setProperty("--color-back", theme.dark.colorBack);
        document.documentElement.style.setProperty("--color-element", theme.dark.colorElement);
        document.documentElement.style.setProperty("--color-border", theme.dark.colorBorder);
        document.documentElement.style.setProperty("--color-second", theme.dark.colorSecond);
        document.documentElement.style.setProperty("--color-top", theme.dark.colorTop);
        document.documentElement.style.setProperty("--color-titlebar", theme.dark.colorTitlebar);
        document.documentElement.style.setProperty("--color-accent", theme.dark.colorAccent);
    
        document.documentElement.style.setProperty("--shadow-focus", theme.dark.shadowFocus);
        document.documentElement.style.setProperty("--opacity-over", theme.dark.opacityOver);

        setIconsStyle(theme.dark.icons);
    } else {
        document.documentElement.style.setProperty("--color-back", theme.light.colorBack);
        document.documentElement.style.setProperty("--color-element", theme.light.colorElement);
        document.documentElement.style.setProperty("--color-border", theme.light.colorBorder);
        document.documentElement.style.setProperty("--color-second", theme.light.colorSecond);
        document.documentElement.style.setProperty("--color-top", theme.light.colorTop);
        document.documentElement.style.setProperty("--color-titlebar", theme.light.colorTitlebar);
        document.documentElement.style.setProperty("--color-accent", theme.light.colorAccent);
    
        document.documentElement.style.setProperty("--shadow-focus", theme.light.shadowFocus);
        document.documentElement.style.setProperty("--opacity-over", theme.light.opacityOver);

        setIconsStyle(theme.light.icons);
    }
}

module.exports = applyTheme;