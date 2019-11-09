"use strict";

const EventEmitter = require("events");

const TextNotification = require(__dirname + '/Notifications/TextNotification.js');
const StatusNotification = require(__dirname + '/Notifications/StatusNotification.js');
const QuestNotification = require(__dirname + '/Notifications/QuestNotification.js');
const ZoomNotification = require(__dirname + '/Notifications/ZoomNotification.js');

class NotificationManager extends EventEmitter {
    maxNotifCount = 1;

    notifPanel = null;
    notifArray = [];
    notifCounter = 0;

    constructor(notifPanel) {
        super();

        this.notifPanel = notifPanel;
        this.notifPanel.classList.add('notif-panel');
    }

    appendNotif(notif) {
        this.notifArray.push(notif);
        this.notifPanel.appendChild(notif.getNode());
        notif.on("close", (notification) => {
            this.destroyNotifById(notification.getId());
        });

        if(this.notifArray.length > this.maxNotifCount) {
            for(let i = 0; i < this.notifArray.length - this.maxNotifCount; i++) {
                this.notifArray[i].close();
            }
        }

        this.emit("notif-added", notif, this);
        return null;
    }

    addTextNotif(text) {
        this.appendNotif(new TextNotification(this.notifCounter++, true, text));
    }

    addStatusNotif(text, type) {
        this.appendNotif(new StatusNotification(this.notifCounter++, true, text, type));
    }

    addQuestNotif(text, buttons) {
        this.appendNotif(new QuestNotification(this.notifCounter++, false, text, buttons));
    }

    addZoomNotif(zoom) {
        this.appendNotif(new ZoomNotification(this.notifCounter++, true, "Zoom factor changed to " + zoom + "%"));
    }

    refreshZoomNotif(zoom) {
        let bool = true;
        for(let i = 0; i < this.notifArray.length; i++) {
            if(this.notifArray[i].constructor.name == "ZoomNotification") {
                bool = false;
                this.notifArray[i].setText("Zoom factor changed to " + zoom + "%");
                break;
            }
        }
        if(bool) {
            this.addZoomNotif(zoom);
        }
    }

    destroyNotifById(id) {
        for(let i = 0; i < this.notifArray.length; i++) {
            if(this.notifArray[i].getId() == id) {
                this.notifPanel.removeChild(this.notifArray[i].getNode());
                this.notifArray.splice(i, 1);
                break;
            }
        }
    }
}

module.exports = NotificationManager;