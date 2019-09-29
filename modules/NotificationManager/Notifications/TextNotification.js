const BlankNotification = require(__dirname + "/BlankNotification.js");

class TextNotification extends BlankNotification {
    text = "";

    constructor(id, autoClose, text) {
        super(id, autoClose);

        this.text = text;

        super.getNode().getElementsByClassName("notif-body")[0].innerHTML = `<label class='notif-text'>${this.text}</label>`;
    }

    setText(text) {
        this.getNode().getElementsByClassName("notif-text")[0].innerHTML = text;
        super.refreshTimeout();
    }
}

module.exports = TextNotification;