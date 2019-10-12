const ppath = require("persist-path")("Ferny");
const fs = require("fs");

const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");

function loadLastTab() {
    return new Promise((resolve, reject) => {
        let defaultValue = "overlay";
        let possibleValues = ["overlay", "new-tab", "new-tab-overlay", "quit"];
        try {
            fs.readFile(ppath + "/json/lasttab.json", (err, data) => {
                data = data.toString();
                if(err) {
                    resolve(defaultValue);
                } else {
                    if(possibleValues.includes(data)) {
                        resolve(data);
                    } else {
                        resolve(defaultValue);
                    }
                }
            });
        } catch (e) {
            saveFileToJsonFolder(null, "lasttab", defaultValue).then((bool) => {
                resolve(defaultValue);
            })
        }
    });
}

module.exports = loadLastTab;