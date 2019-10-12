const ppath = require("persist-path")("Ferny");
const fs = require("fs");

const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");

function loadTabClosed() {
    return new Promise((resolve, reject) => {
        let defaultValue = "overlay";
        let possibleValues = ["overlay", "next-tab", "prev-tab"];
        try {
            fs.readFile(ppath + "/json/tabclosed.json", (err, data) => {
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
            saveFileToJsonFolder(null, "tabclosed", defaultValue).then((bool) => {
                resolve(defaultValue);
            });
        }
    });
}

module.exports = loadTabClosed;