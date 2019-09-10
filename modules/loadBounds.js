const loadFileFromJsonFolder = require("../modules/loadFileFromJsonFolder.js");

function loadBounds() {
    return new Promise(function(resolve, reject) {
        let Data = {
            x: null,
            y: null,
            width: 1000,
            height: 600,
            maximize: false
        };

        loadFileFromJsonFolder(null, "bounds").then((data) => {
            if(data.toString().length > 0) {
                Data = JSON.parse(data);
            }
            resolve(Data);
        });
    }); 
}

module.exports = loadBounds;