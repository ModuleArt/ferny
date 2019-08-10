const fs = require("fs");
const ppath = require('persist-path')('Ferny');

function saveFileToJsonFolder(fileName, data) {
    if(!fs.existsSync(ppath)) {
        fs.mkdirSync(ppath);
    }
    if(!fs.existsSync(ppath + "/json")) {
        fs.mkdirSync(ppath + "/json");
    } 
    fs.writeFileSync(ppath + "/json/" + fileName + ".json", data);
}

module.exports = saveFileToJsonFolder;
