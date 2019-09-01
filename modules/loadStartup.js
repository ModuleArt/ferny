const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");
const ppath = require('persist-path')('Ferny');
const fs = require("fs");

function loadStartup() {
    return new Promise(function(resolve, reject) {
        try {
            fs.readFile(ppath + "/json/startup.json", function(err, data) {
                resolve(data);
            });
        } catch (e) {
            saveFileToJsonFolder(null, "startup", "overlay").then((bool) => {
                resolve("overlay");
            })
        }
    });
}

module.exports = loadStartup;