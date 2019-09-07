const fs = require("fs");
const ppath = require('persist-path')('Ferny');

function saveFileToJsonFolder(subfolder, fileName, data) {
    return new Promise((resolve, reject) => {
        checkDirExists(ppath).then(() => {
            checkDirExists(ppath + "/json").then(() => {
                if(subfolder == null) {
                    fs.writeFile(ppath + "/json/" + fileName + ".json", data, (err) => {
                        if(!err) {
                            resolve(true);
                        }
                    });
                } else {
                    checkDirExists(ppath + "/json/" + subfolder).then(() => {
                        fs.writeFile(ppath + "/json/" + subfolder + "/" + fileName + ".json", data, (err) => {
                            if(!err) {
                                resolve(true);
                            }
                        });
                    });
                }
            });
        });
    });
}

function checkDirExists(path) {
    return new Promise((resolve, reject) => {
        fs.exists(path, (exists) => {
            if(exists) {
                resolve();
            } else {
                fs.mkdir(path, (err) => {
                    if(err) {
                        throw err;
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
}

module.exports = saveFileToJsonFolder;
