const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");
const fs = require("fs");
const ppath = require('persist-path')('Ferny');

function loadBorderRadius() {
    var borderRadius = '4';

    try {
      borderRadius = fs.readFileSync(ppath + "/json/radius.json");
    } catch (e) {
      saveFileToJsonFolder('radius', borderRadius);
    }

    return borderRadius.toString();
}

module.exports = loadBorderRadius;