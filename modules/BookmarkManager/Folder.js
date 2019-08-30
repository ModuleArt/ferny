const EventEmitter = require("events");

class Folder extends EventEmitter {
    bookmarks = [];
    name = null;
    id = null;
    node = null;
    position = null;

    constructor(id, name, editable) {
        super();

        this.id = id;
        this.name = name;

        this.node = document.createElement("div");
        this.node.classList.add("folder");
        this.node.id = "folder-" + id;
        this.node.name = id;
        this.node.innerHTML = `
            <div class='folder-header' title='` + name + `'>
                <label class='folder-name'>` + name + `</label>
            </div>
            <div class='folder-container'></div>
        `;

        let addBookmarkBtn = document.createElement("button");
        addBookmarkBtn.classList.add('nav-btn', 'add-bookmark-btn');
        addBookmarkBtn.title = "Create bookmark here";
        addBookmarkBtn.innerHTML = `<img class='theme-icon' name='add-bookmark-16'>`;
        addBookmarkBtn.onclick = () => {
            this.newBookmark();
        }
        this.node.getElementsByClassName('folder-header')[0].appendChild(addBookmarkBtn);

        if(editable) {
            let editFolderBtn = document.createElement("button");
            editFolderBtn.classList.add('nav-btn', 'edit-folder-btn');
            editFolderBtn.title = "Edit folder";
            editFolderBtn.innerHTML = `<img class='theme-icon' name='edit-folder-16'>`;
            this.node.getElementsByClassName('folder-header')[0].appendChild(editFolderBtn);
        }
    }

    newBookmark() {
        this.emit("add-bookmark", this, "New bookmark", "https://duckduckgo.com");
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
        });
        this.bookmarks.push(bookmark);
        this.node.getElementsByClassName('folder-container')[0].appendChild(bookmark.getNode());

        this.emit("append-bookmark");
        return null;
    }

    removeBookmark(id) {
        for(let i = 0; i < this.bookmarks.length; i++) {
            if(this.bookmarks[i].getId() == id) {
                this.node.getElementsByClassName('folder-container')[0].removeChild(this.bookmarks[i].getNode());
                this.bookmarks.splice(i, 1);
                break;
            }
        }
    }

    setName(name) {
        this.name = name;

        return null;
    }

    getName() {
        return this.name;
    }

    getBookmarkById(id) {

    }

    getNode() {
        return this.node;
    }

    updateBookmarksPositions(arr) {

    }
}

module.exports = Folder;