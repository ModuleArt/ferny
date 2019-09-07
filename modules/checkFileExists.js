const fs = require("fs");

function checkFileExists(path) {
    return new Promise((resolve, reject) => {
        fs.exists(path, (exists) => {
            if(exists) {
                resolve();
            }
        });
    });
}

module.exports = checkFileExists;