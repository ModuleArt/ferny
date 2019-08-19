const rgbToRgbaString = require(__dirname + '/../../rgbToRgbaString.js');
const bytesToSize = require(__dirname + '/../../bytesToSize.js');

const ProgressNotification = require(__dirname + '/ProgressNotification.js');

class UpdateNotification extends ProgressNotification {
    constructor(id, autoClose, text) {
        super(id, autoClose, text);

        super.getNode().getElementsByClassName('notif-container')[0].style.backgroundColor = rgbToRgbaString("rgb(11, 232, 129)");

        var btn = document.createElement('button');
        btn.classList.add('nav-btn');
        btn.innerHTML = "<img name='cancel-16' class='theme-icon'><label>Cancel update</label>";
        btn.onclick = function () {
            eval("cancelUpdate");
            this.emit("close", this);
        };
        super.getNode().getElementsByClassName('notif-body')[0].appendChild(btn);
    }

    setProgress(percent, transferred, total, speed) {
        super.setProgress(percent, transferred, total);
        
        this.getNode().getElementsByClassName('notif-bar')[0].innerHTML += "<label>Speed: " + bytesToSize(speed) + "/s</label>";

        if(percent == 100) {
            this.emit("close", this);
        }
    }
}

module.exports = UpdateNotification;