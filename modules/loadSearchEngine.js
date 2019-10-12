const ppath = require("persist-path")("Ferny");
const fs = require("fs");

const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");

function loadSearchEngine() {
    return new Promise((resolve, reject) => {
        let defaultValue = "duckduckgo";
        let possibleValues = ["duckduckgo", "google", "bing", "wikipedia", "yahoo", "yandex", "mailru", 
            "baidu", "naver", "qwant", "youtube", "youtube", "ecosia", "twitter", "amazon", "twitch"];
        try {
            fs.readFile(ppath + "/json/search-engine.json", (err, data) => {
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
            saveFileToJsonFolder(null, "search-engine", defaultValue).then((bool) => {
                resolve(defaultValue);
            })
        }
    });
}

module.exports = loadSearchEngine;