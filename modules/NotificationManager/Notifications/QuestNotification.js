const rgbToRgbaString = require(__dirname + "/../../rgbToRgbaString.js");

const TextNotification = require(__dirname + "/TextNotification.js");

class QuestNotification extends TextNotification {
    constructor(id, autoClose, text, buttons) {
        super(id, autoClose, text);

        let img = document.createElement("img");
        img.classList.add("notif-icon", "theme-icon");
        img.name = "about-16";
        super.getNode().getElementsByClassName("notif-container")[0].style.backgroundColor = rgbToRgbaString("rgb(255, 168, 1)");

        super.getNode().appendChild(img);

        let buttonsContainer = document.createElement("div");
        buttonsContainer.classList.add("notif-buttons");
        super.getNode().appendChild(buttonsContainer);

        for(let i = 0; i < buttons.length; i++) {
            let btn = document.createElement("buttons");
            btn.classList.add("nav-btn");
            btn.innerHTML = `<img name='${buttons[i].icon}' class='theme-icon'><label>${buttons[i].text}</label>`;
            btn.onclick = () => {
                eval(buttons[i].click);
                super.close();
            }
            buttonsContainer.appendChild(btn);
        }
    }
}

module.exports = QuestNotification;