const ppath = require("persist-path")("Ferny");
const fs = require("fs");

const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");

function loadWinControls() {
    return new Promise(function(resolve, reject) {
        let defaultValue = {
            systemTitlebar: false
        };
        try {
            fs.readFile(ppath + "/json/wincontrols.json", (err, data) => {
                if(err) {
                    resolve(defaultValue);
                } else {
                    resolve(JSON.parse(data));
                }
            });
        } catch (e) {
            saveFileToJsonFolder(null, "wincontrols", JSON.stringify(defaultValue)).then((bool) => {
                resolve(defaultValue);
            });
        }
    });
}

module.exports = loadWinControls;