const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");
const ppath = require('persist-path')('Ferny');
const fs = require("fs");

function loadTabClosed() {
    return new Promise(function(resolve, reject) {
        try {
            fs.readFile(ppath + "/json/tabclosed.json", function(err, data) {
                resolve(data);
            });
        } catch (e) {
            saveFileToJsonFolder(null, "tabclosed", "overlay").then((bool) => {
                resolve("overlay");
            });
        }
    });
}

module.exports = loadTabClosed;