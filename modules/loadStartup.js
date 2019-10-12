const ppath = require("persist-path")("Ferny");
const fs = require("fs");

const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");

function loadStartup() {
    return new Promise((resolve, reject) => {
        let defaultValue = "overlay";
        let possibleValues = ["overlay", "new-tab"];
        try {
            fs.readFile(ppath + "/json/startup.json", (err, data) => {
                if(err) {
                    resolve(defaultValue);
                } else {
                    data = data.toString();
                    if(possibleValues.includes(data)) {
                        resolve(data);
                    } else {
                        resolve(defaultValue);
                    }
                }
            });
        } catch (e) {
            saveFileToJsonFolder(null, "startup", defaultValue).then((bool) => {
                resolve(defaultValue);
            })
        }
    });
}

module.exports = loadStartup;