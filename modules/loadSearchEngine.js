const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");
const ppath = require('persist-path')('Ferny');
const fs = require("fs");

function loadSearchEngine() {
    return new Promise(function(resolve, reject) {
        try {
            fs.readFile(ppath + "/json/search-engine.json", function(err, data) {
                resolve(data.toString());
            });
        } catch (e) {
            saveFileToJsonFolder(null, "search-engine", "duckduckgo").then((bool) => {
                resolve("duckduckgo");
            })
        }
    });
}

module.exports = loadSearchEngine;