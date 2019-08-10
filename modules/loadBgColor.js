const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");
const fs = require("fs");
const ppath = require('persist-path')('Ferny');

function loadBgColor() {
    let themeColor = '#ffffff';
  
    try {
      themeColor = fs.readFileSync(ppath + "/json/theme.json");
    } catch (e) {
      saveFileToJsonFolder("theme", themeColor);
    }

    return themeColor.toString();
}

module.exports = loadBgColor;