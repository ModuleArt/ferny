const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");
const ppath = require('persist-path')('Ferny');
const fs = require("fs");

function loadSearchEngine() {
    return new Promise(function(resolve, reject) {
        try {
            fs.readFile(ppath + "/json/searchengine.json", function(err, data) {
                resolve(data);
            });
        } catch (e) {
            saveFileToJsonFolder(null, "searchengine", "duckduckgo").then((bool) => {
                resolve("duckduckgo");
            })
        }
    });
}

module.exports = loadSearchEngine;