const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");
const fs = require("fs");
const ppath = require('persist-path')('Ferny');
const path = require('path');

function loadTheme(name) {
    return new Promise(function(resolve, reject) {
        let theme = "1-classic";

        if(name == null) {
            name = theme;
        }
  
        fs.readFile(ppath + "/json/theme.json", function(err, data) {
            if(err) {
                saveFileToJsonFolder(null, "theme", name);
            
                let file = name.toString().replace("\n", "") + ".json";
                fs.readFile(path.join(__dirname, "..", "/themes/" + file), function(err, data) {
                    let themeJson = JSON.parse(data);
                    resolve(themeJson);
                });
            } else {
                let file = data.toString().replace("\n", "") + ".json";
                fs.readFile(path.join(__dirname, "..", "/themes/" + file), function(err, data) {
                    let themeJson = JSON.parse(data);
                    resolve(themeJson);
                });
            }
        });
    }); 
}

module.exports = loadTheme;