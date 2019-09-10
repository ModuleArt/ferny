const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");
const loadFileFromJsonFolder = require("../modules/loadFileFromJsonFolder.js");

const fs = require("fs");
const ppath = require('persist-path')('Ferny');
const path = require('path');

function loadTheme(name) {
    return new Promise(function(resolve, reject) {
        let theme = "1-classic";

        if(name == null) {
            name = theme;
        }

        loadFileFromJsonFolder(null, "theme").then((data) => {
            if(data.toString().length > 0) {
                name = data.toString();
            } 
            name = path.join(__dirname, "/../themes/", name + ".json").replace("\n", "");
            fs.readFile(name, (err, objStr) => {
                resolve(JSON.parse(objStr));
            });
        });
    }); 
}

module.exports = loadTheme;