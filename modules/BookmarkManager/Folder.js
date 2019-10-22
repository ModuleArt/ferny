const EventEmitter = require("events");

class Folder extends EventEmitter {
    bookmarks = [];
    name = null;
    id = null;
    node = null;
    position = null;

    constructor(id, name, editable, position) {
        super();

        this.id = id;
        this.name = name;
        this.position = position;

        this.node = document.createElement("div");
        this.node.classList.add("folder");
        this.node.id = "folder-" + id;
        this.node.name = id;
        this.node.position = position;
        this.node.innerHTML = `
            <div class='folder-header' title='` + name + `'>
                <img title="Drag here" class="theme-icon folder-move" name="move-16">
                <label class='folder-name'>` + name + `</label>
            </div>
            <div class='folder-container'></div>
        `;

        if(editable) {
            this.node.classList.add("editable");

            let editFolderBtn = document.createElement("button");
            editFolderBtn.classList.add("nav-btn", "edit-folder-btn");
            editFolderBtn.title = "Edit folder";
            editFolderBtn.innerHTML = `<img class='theme-icon' name='edit-folder-16'>`;
            editFolderBtn.onclick = () => {
                this.toggleEditor();
            }
            this.node.getElementsByClassName("folder-header")[0].appendChild(editFolderBtn);
        }

        let addBookmarkBtn = document.createElement("button");
        addBookmarkBtn.classList.add("nav-btn", "add-bookmark-btn");
        addBookmarkBtn.title = "Create bookmark here";
        addBookmarkBtn.innerHTML = `<img class='theme-icon' name='add-bookmark-16'>`;
        addBookmarkBtn.onclick = () => {
            this.newBookmark();
        }
        this.node.getElementsByClassName("folder-header")[0].appendChild(addBookmarkBtn);

        let openAllBtn = document.createElement("button");
        openAllBtn.classList.add("nav-btn", "open-all-btn");
        openAllBtn.title = "Open all bookmarks";
        openAllBtn.innerHTML = `<img class='theme-icon' name='link-16'>`;
        openAllBtn.onclick = () => {
            this.openAllBookmarks();
        }
        this.node.getElementsByClassName("folder-header")[0].appendChild(openAllBtn);
    }

    toString() {
        return JSON.stringify({
            id: this.id,
            name: this.name,
            position: this.position
        });
    }

    getId() {
        return this.id;
    }

    newBookmark() {
        this.emit("add-bookmark", this, "New bookmark", "https://");
    }

    addBookmark(name, url) {
        this.emit("add-bookmark", this, name, url);
    }

    appendBookmark(bookmark) {
        bookmark.on("toggle-options", () => {
            this.emit("bookmark-options-toggled");
        });
        bookmark.on("toggle-editor", () => {
            this.emit("bookmark-editor-toggled");
        });
        bookmark.on("delete", (id) => {
            this.removeBookmark(id);
            this.emit("bookmark-deleted");
        });
        bookmark.on("edit", () => {
            this.emit("bookmark-edited");
        });

        this.bookmarks.push(bookmark);

        let cont = this.node.getElementsByClassName("folder-container")[0];
        let nodes = cont.childNodes;
        if(nodes.length > 0) {
            if(bookmark.getPosition() != null) {
                for(let i = 0; i < nodes.length; i++) {
                    if(bookmark.getPosition() < nodes[i].position) {
                        cont.insertBefore(bookmark.getNode(), nodes[i]);
                        break;
                    } else {
                        if(nodes[i] === cont.lastChild){
                            cont.appendChild(bookmark.getNode());
                        } 
                    }
                }
            } else {
                cont.appendChild(bookmark.getNode());
            }
        } else {
            cont.appendChild(bookmark.getNode());
        }

        this.emit("append-bookmark");
        return null;
    }

    removeBookmark(id) {
        for(let i = 0; i < this.bookmarks.length; i++) {
            if(this.bookmarks[i].getId() == id) {
                this.node.getElementsByClassName("folder-container")[0].removeChild(this.bookmarks[i].getNode());
                this.bookmarks.splice(i, 1);
                break;
            }
        }
    }

    spliceBookmark(id) {
        for(let i = 0; i < this.bookmarks.length; i++) {
            if(this.bookmarks[i].getId() == id) {
                this.bookmarks.splice(i, 1);
                break;
            }
        }
    }

    pushBookmark(bookmark) {
        this.bookmarks.push(bookmark);
    } 

    setName(name) {
        this.name = name;

        return null;
    }

    getName() {
        return this.name;
    }

    getBookmarkById(id) {
        for(let i = 0; i < this.bookmarks.length; i++) {
            if(id == this.bookmarks[i].getId()) {
                return this.bookmarks[i];
            }
        }
    }

    getNode() {
        return this.node;
    }

    setPosition(position) {
        this.position = position;
        this.node.position = position;
    }

    getPosition() {
        return this.position;
    }

    updateBookmarksPositions() {
        return new Promise((resolve, reject) => {
            let divs = this.node.getElementsByClassName("bookmark");
            for(let i = 0; i < divs.length; i++) {
                this.getBookmarkById(divs[i].name).setPosition(i);
            }
            resolve();
        });
    }

    openAllBookmarks() {
        for(let i = 0; i < this.bookmarks.length; i++) {
            this.bookmarks[i].open();
        }
    }

    edit(name) {
        this.name = name;

        this.node.getElementsByClassName("folder-name")[0].innerHTML = name;
        this.node.getElementsByClassName("folder-header")[0].title = name;

        this.emit("edit")
        return null;
    }

    toggleEditor() {
        let folderEditor = this.node.getElementsByClassName("folder-editor")[0];
        if(folderEditor == null) {
            this.node.getElementsByClassName("folder-header")[0].style.display = "none";

            folderEditor = document.createElement("div");
            folderEditor.classList.add("folder-editor");
            this.node.insertBefore(folderEditor, this.node.firstChild);

            let nameInput = document.createElement("input");
            nameInput.type = "text";
            nameInput.placeholder = "Folder name";
            nameInput.value = this.name;
            folderEditor.appendChild(nameInput);
            nameInput.focus();

            let saveBtn = document.createElement("button");
            saveBtn.classList.add("nav-btn", "with-border");
            saveBtn.innerHTML = `<img class="theme-icon" name="save-16"><label>Save</label>`;
            saveBtn.onclick = () => {
                this.edit(nameInput.value);
                this.toggleEditor();
            }
            folderEditor.appendChild(saveBtn);

            let cancelBtn = document.createElement("button");
            cancelBtn.classList.add("nav-btn", "with-border");
            cancelBtn.innerHTML = `<img class="theme-icon" name="cancel-16"><label>Cancel</label>`;
            cancelBtn.onclick = () => {
                this.toggleEditor();
            }
            folderEditor.appendChild(cancelBtn);

            let deleteBtn = document.createElement("button");
            deleteBtn.classList.add("nav-btn", "with-border");
            deleteBtn.innerHTML = `<img class="theme-icon" name="delete-16"><label>Delete</label>`;
            deleteBtn.onclick = () => {
                this.askForDelete();
            }
            folderEditor.appendChild(deleteBtn);
        } else {
            this.node.getElementsByClassName("folder-header")[0].style.display = "";

            this.node.removeChild(folderEditor);
        }

        this.emit("toggle-editor");
        return null;
    }

    askForDelete() {
        this.emit("ask-for-delete", this.id, this.name);
        return null;
    }

    delete() {
        this.emit("delete", this.id);
        return null;
    }

    getBookmarks() {
        return this.bookmarks;
    }
}

module.exports = Folder;