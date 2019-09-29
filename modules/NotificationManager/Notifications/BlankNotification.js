const EventEmitter = require("events");

class BlankNotification extends EventEmitter {
    id = null;
    node = null;
    timeout = null;
    autoClose = false;

    constructor(id, autoClose) {
        super();

        this.id = id;
        this.autoClose = autoClose;

        this.node = document.createElement("div");
        this.node.classList.add("notif");
        this.node.innerHTML = `
            <div class="notif-container">
                <div class='notif-body'></div>
            </div>
        `;
        this.node.onauxclick = (event) => {
            event.preventDefault();
            if(event.which === 2) {
                this.close();
            }
        };

        let closeButton = document.createElement("button");
        closeButton.onclick = () => {
            this.close.call(this);
        }
        closeButton.title = "Close";
        closeButton.classList.add("notif-close");
        closeButton.innerHTML = `<img class='theme-icon' name='cancel-12'>`;

        this.node.appendChild(closeButton);

        this.refreshTimeout();
    }

    getId() {
        return this.id;
    }

    getNode() {
        return this.node;
    }

    refreshTimeout() {
        clearTimeout(this.timeout);
        if(this.autoClose) {
            this.timeout = setTimeout(() => {
                this.close.call(this);
            }, 5000);
        }
        return null;
    }

    close() {
        this.node.classList.add("closed");
        setTimeout(() => {
            this.emit("close", this);
        }, 250);
        return null;
    }
}

module.exports = BlankNotification;