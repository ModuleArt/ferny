const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");
const ppath = require('persist-path')('Ferny');
const fs = require("fs");

function loadWinControls() {
    var winControls = {
        frame: false,
        hideMenu: true,
        color: true
    };

    try {
        var jsonstr = fs.readFileSync(ppath + "/json/wincontrols.json");
        winControls = JSON.parse(jsonstr);
    } catch (e) {
        var platform = process.platform;

        if(platform == "win32") {
            saveFileToJsonFolder('wincontrols', JSON.stringify(winControls));
        } else if(platform == "linux") {
            winControls.frame = true;
            saveFileToJsonFolder('wincontrols', JSON.stringify(winControls));
        }
    }

    return winControls;
}

module.exports = loadWinControls;