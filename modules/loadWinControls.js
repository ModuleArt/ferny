const ppath = require("persist-path")("Ferny");
const fs = require("fs");

const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");

function loadWinControls() {
    return new Promise(function(resolve, reject) {
        try {
            fs.readFile(ppath + "/json/wincontrols.json", (err, data) => {
                if(err || data.length <= 0) {
                    resolve({
                        systemTitlebar: false
                    });
                } else {
                    resolve(JSON.parse(data));
                }
            });
        } catch (e) {
            saveFileToJsonFolder(null, "wincontrols", JSON.stringify({ 
                systemTitlebar: false
             })).then((bool) => {
                resolve({
                    systemTitlebar: false
                });
            });
        }
    });
}

module.exports = loadWinControls;