const fs = require("fs");
const ppath = require('persist-path')('Ferny');

function saveFileToJsonFolder(fileName, data) {
    return new Promise(function(resolve, reject) {
        fs.exists(ppath, function(exists) {
            if(!exists) {
                fs.mkdir(ppath);
            }
        });
    
        fs.exists(ppath + "/json", function(exists) {
            if(!exists) {
                fs.mkdir(ppath + "/json");
            }
        });
    
        fs.writeFile(ppath + "/json/" + fileName + ".json", data, function(err) {
            if(err) throw err;
            resolve(true);
        });
    });
}

module.exports = saveFileToJsonFolder;
