const EventEmitter = require("events");
const Isotope = require('isotope-layout');
const Dragula = require('dragula');

const Folder = require(__dirname + "/Folder.js");
const Bookmark = require(__dirname + "/Bookmark.js");

class BookmarkManager extends EventEmitter {
    folderContainer = null;
    folderCounter = 0;
    folders = [];
    bookmarkCounter = 0;
    isotope = null;
    folderDrag = null;
    defaultFolder = null;

    constructor(folderContainer) {
        super();

        this.folderContainer = folderContainer; 

        this.toggleArrange();

        this.defaultFolder = new Folder(-1, "All bookmarks", false);
        this.appendFolder(this.defaultFolder);
    }

    newFolder() {
        this.addFolder("New folder " + (this.folderCounter + 1));

        return null;
    }

    addFolder(name) {
        this.appendFolder(new Folder(this.folderCounter++, name, true));

        return null;
    }

    appendFolder(folder) {
        folder.on("add-bookmark", (folder, bookmarkName, bookmarkURL) => {
            this.addBookmarkToFolder(folder, bookmarkName, bookmarkURL);
        });
        folder.on("append-bookmark", () => {
            if(this.isotope != null) {
                this.isotope.arrange();
            }
            this.emit("bookmark-added");
        });
        folder.on("bookmark-options-toggled", () => {
            if(this.isotope != null) {
                this.isotope.arrange();
            }
        });
        folder.on("bookmark-editor-toggled", () => {
            if(this.isotope != null) {
                this.isotope.arrange();
            }
            this.emit("bookmark-editor-toggled");
        });
        folder.on("delete", (id) => {
            this.removeFolder(id);
            if(this.isotope != null) {
                this.isotope.arrange();
            }
        });
        folder.on("bookmark-deleted", () => {
            if(this.isotope != null) {
                this.isotope.arrange();
            }
        });
        folder.on("toggle-editor", () => {
            if(this.isotope != null) {
                this.isotope.arrange();
            }
            this.emit("folder-editor-toggled");
        });

        this.folders.push(folder);
        this.folderContainer.appendChild(folder.getNode());
        
        if(this.isotope != null) {
            this.isotope.addItems(folder.getNode());
            this.isotope.arrange();
        }

        this.emit("folder-added");
        return null;
    }

    removeFolder(id) {
        for(let i = 0; i < this.folders.length; i++) {
            if(this.folders[i].getId() == id) {
                this.folderContainer.removeChild(this.folders[i].getNode());
                this.folders.splice(i, 1);
                break;
            }
        }
    }

    getDefaultFolder() {
        return this.defaultFolder;
    }

    getFolderById(id) {

    }

    addBookmarkToFolder(folder, bookmarkName, bookmarkURL) {
        folder.appendBookmark(new Bookmark(this.bookmarkCounter++, bookmarkName, bookmarkURL));
    }

    updateFoldersPositions(arr) {

    }

    toggleArrange() {
        if(this.isotope == null) {
            this.isotope = new Isotope(this.folderContainer, {
                itemSelector: '.folder',
                masonry: {
                    columnWidth: 200
                }
            });

            if(this.folderDrag != null) {
                this.folderDrag.destroy();
                this.folderDrag = null;
            }
        } else {
            this.isotope.destroy();
            this.isotope = null;

            this.folderDrag = Dragula([this.folderContainer], {
                direction: "horizontal"
            });
        }

        return null;
    }
}

module.exports = BookmarkManager;