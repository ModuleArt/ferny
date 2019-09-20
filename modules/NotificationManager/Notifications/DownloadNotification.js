const rgbToRgbaString = require(__dirname + '/../../rgbToRgbaString.js');

const ProgressNotification = require(__dirname + '/ProgressNotification.js');

class DownloadNotification extends ProgressNotification {
    downloadId = null;

    constructor(id, autoClose, text, downloadId) {
        super(id, autoClose, text);

        this.downloadId = downloadId;

        super.getNode().getElementsByClassName('notif-container')[0].style.backgroundColor = rgbToRgbaString("rgb(15, 188, 249)");
    }

    getDownloadId() {
        return this.downloadId;
    }
}

module.exports = DownloadNotification;