const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");
const fs = require("fs");
const ppath = require('persist-path')('Ferny');
const path = require('path');

function loadTheme(name) {
    return new Promise(function(resolve, reject) {
        let theme = "coupertino";
  
        if(name == null) {
            try {
                fs.readFile(ppath + "/json/theme.json", function(err, data) {
                    if(err) throw err;
                    
                    let file = data.toString().replace("\n", "") + ".json";
                    fs.readFile(path.join(__dirname, "..", "/themes/" + file), function(err, data) {
                        let themeJson = JSON.parse(data);
                        resolve(themeJson);
                    });
                });
            } catch (e) {
                saveFileToJsonFolder("theme", theme);
                
                let file = name.toString().replace("\n", "") + ".json";
                fs.readFile(path.join(__dirname, "..", "/themes/" + file), function(err, data) {
                    if(err) throw err;
                    
                    let themeJson = JSON.parse(data);
                    resolve(themeJson);
                });
            }
        } else {
            let file = name.toString().replace("\n", "") + ".json";
            fs.readFile(path.join(__dirname, "..", "/themes/" + file), function(err, data) {
                if(err) throw err;

                let themeJson = JSON.parse(data);
                resolve(themeJson);
            });
        }
    }); 
}

module.exports = loadTheme;