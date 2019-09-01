const EventEmitter = require("events");
const { ipcRenderer, clipboard } = require("electron");

class Bookmark extends EventEmitter {
    id = null;
    name = null;
    url = null;
    node = null;
    position = null;

    constructor(id, name, url) {
        super();

        this.id = id;
        this.name = name;
        this.url = url;

        this.node = document.createElement('button');
        this.node.classList.add('bookmark');
        this.node.title = name + "\n" + url;
        this.node.innerHTML = `
            <img class='bookmark-icon' src="http://www.google.com/s2/favicons?domain=` + url + `">
            <label class='bookmark-name'>` + name + `</label>
            <label class='bookmark-preview'>` + url + `</label>
        `;
        this.node.onclick = () => {
            this.open();
        }
        this.node.onauxclick = (event) => {
            event.preventDefault();
            if(event.which == 2) {
                ipcRenderer.send("tabManager-addTab", url, false);
            }
        }
        this.node.oncontextmenu = () => {
            this.toggleOptions();
        }
        this.node.onkeyup = (event) => {
            event.preventDefault();
        }

        let optionsBtn = document.createElement('button');
        optionsBtn.classList.add('bookmark-options');
        optionsBtn.title = "Toggle options";
        optionsBtn.innerHTML = `<img name="options-12" class="theme-icon">`;
        optionsBtn.onclick = (event) => {
            event.stopPropagation();
            this.toggleOptions();
        }
        this.node.appendChild(optionsBtn);

        let bookmarkMenu = document.createElement('div');
        bookmarkMenu.classList.add('bookmark-menu');
        this.node.appendChild(bookmarkMenu);

        let copyBtn = document.createElement('button');
        copyBtn.classList.add('nav-btn');
        copyBtn.title = "Copy URL";
        copyBtn.innerHTML = `<img name="copy-16" class="theme-icon"><label>Copy</label>`;
        copyBtn.onclick = (event) => {
            event.stopPropagation();
            this.copyURL();
        }
        bookmarkMenu.appendChild(copyBtn);

        let editBtn = document.createElement('button');
        editBtn.classList.add('nav-btn');
        editBtn.title = "Edit bookmark";
        editBtn.innerHTML = `<img name="edit-16" class="theme-icon"><label>Edit</label>`;
        editBtn.onclick = (event) => {
            event.stopPropagation();
            this.toggleEditor();
        }
        bookmarkMenu.appendChild(editBtn);

        let deleteBtn = document.createElement('button');
        deleteBtn.classList.add('nav-btn');
        deleteBtn.title = "Delete bookmark";
        deleteBtn.innerHTML = `<img name="delete-16" class="theme-icon">`;
        deleteBtn.onclick = (event) => {
            event.stopPropagation();
            this.delete();
        }
        bookmarkMenu.appendChild(deleteBtn);
    }

    getData() {
        return {
            id: this.id,
            name: this.name,
            url: this.url
        }
    }

    open() {
        ipcRenderer.send("tabManager-addTab", this.url, true);
    }

    getId() {
        return this.id;
    }

    edit(name, url) {
        this.name = name;
        this.url = url;

        this.node.getElementsByClassName('bookmark-name')[0].innerHTML = name;
        this.node.getElementsByClassName('bookmark-preview')[0].innerHTML = url;
        this.node.title = name + "\n" + url;
        this.node.getElementsByClassName('bookmark-icon')[0].src = "http://www.google.com/s2/favicons?domain=" + url;

        this.emit("edit");
        return null;
    }

    setName(name) {
        this.name = name;

        return null;
    }

    getName() {
        return this.name;
    }

    setURL(url) {
        this.url = url;

        return null;
    }

    getURL() {
        return this.url;
    }

    getNode() {
        return this.node;
    }

    toggleOptions() {
        this.node.classList.toggle('show-menu');
        this.node.classList.remove('show-editor');

        let bookmarkEditor = this.node.getElementsByClassName("bookmark-editor")[0];
        if(bookmarkEditor != null) {
            this.node.removeChild(bookmarkEditor);
        }

        this.emit("toggle-options");
        return null;
    }

    toggleEditor() {
        this.node.classList.remove('show-menu');
        this.node.classList.toggle('show-editor');

        let bookmarkEditor = this.node.getElementsByClassName("bookmark-editor")[0];
        if(bookmarkEditor == null) {
            bookmarkEditor = document.createElement('div');
            bookmarkEditor.classList.add('bookmark-editor');
            bookmarkEditor.onclick = (event) => {
                event.stopPropagation();
            } 
            this.node.appendChild(bookmarkEditor);

            let nameInput = document.createElement('input');
            nameInput.type = "text";
            nameInput.placeholder = "Bookmark name";
            nameInput.value = this.name;
            bookmarkEditor.appendChild(nameInput);
            nameInput.focus();

            let urlInput = document.createElement('input');
            urlInput.type = "text";
            urlInput.placeholder = "Bookmark URL";
            urlInput.value = this.url;
            bookmarkEditor.appendChild(urlInput);

            let saveBtn = document.createElement('button');
            saveBtn.classList.add('nav-btn');
            saveBtn.innerHTML = `<img class="theme-icon" name="save-16"><label>Save</label>`;
            saveBtn.onclick = () => {
                this.edit(nameInput.value, urlInput.value);
                this.toggleEditor();
            }
            bookmarkEditor.appendChild(saveBtn);

            let cancelBtn = document.createElement('button');
            cancelBtn.classList.add('nav-btn');
            cancelBtn.innerHTML = `<img class="theme-icon" name="cancel-16"><label>Cancel</label>`;
            cancelBtn.onclick = () => {
                this.toggleEditor();
            }
            bookmarkEditor.appendChild(cancelBtn);
        } else {
            this.node.removeChild(bookmarkEditor);
        }

        this.emit("toggle-editor");
        return null;
    }

    copyURL() {
        clipboard.writeText(this.url);

        return null;
    }

    delete() {
        this.emit("delete", this.id);
        return null;
    }
}

module.exports = Bookmark;