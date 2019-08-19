const bytesToSize = require(__dirname + '/../../bytesToSize.js');

const TextNotification = require(__dirname + '/TextNotification.js');

class ProgressNotification extends TextNotification {
    constructor(id, autoClose, text) {
        super(id, autoClose, text);

        let img = document.createElement('img');
        img.classList.add('notif-icon', 'theme-icon');
        img.name = 'download-16';
        super.getNode().appendChild(img);

        var bar = document.createElement('div');
        bar.classList.add('notif-bar');
        bar.innerHTML = "<div style='width: 0px;'></div>";
        super.getNode().getElementsByClassName('notif-body')[0].appendChild(bar);
    }

    setProgress(percent, transferred, total) {
        var bar = this.getNode().getElementsByClassName('notif-bar')[0];

        bar.innerHTML = "<div></div>"
    
        var line = bar.getElementsByTagName('div')[0];
        line.style.width = (percent / 100 * bar.clientWidth) + "px";
    
        if(transferred != null && total != null) {
            bar.innerHTML += "<label>" + percent + "% (" + bytesToSize(transferred) + "/" + bytesToSize(total) + ")</label>";
        } else {
            bar.innerHTML += "<label>" + percent + "%</label>";
        }

        super.refreshTimeout();
    }
}

module.exports = ProgressNotification;