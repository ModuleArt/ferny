const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");
const ppath = require('persist-path')('Ferny');
const fs = require("fs");

function loadHomePage() {
    return new Promise(function(resolve, reject) {
        let Data = {
            url: "https://duckduckgo.com",
            on: 0
        };
        
        try {
            let jsonstr = fs.readFileSync(ppath + "/json/home.json");
            Data = JSON.parse(jsonstr);
        } catch (e) {
            saveFileToJsonFolder(null, 'home', JSON.stringify(Data))
        }
      
        resolve(Data);
    });
}

module.exports = loadHomePage;