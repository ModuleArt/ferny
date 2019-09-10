const saveFileToJsonFolder = require("../modules/saveFileToJsonFolder.js");

function saveBounds() {
    let Data = {
      x: mainWindow.getBounds().x,
      y: mainWindow.getBounds().y,
      width: mainWindow.getBounds().width,
      height: mainWindow.getBounds().height,
      maximize: mainWindow.isMaximized()
    }
    saveFileToJsonFolder(null, 'bounds', JSON.stringify(Data));
}

module.exports = saveBounds;