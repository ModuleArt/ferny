const EventEmitter = require("events");
const Isotope = require('isotope-layout');
const Dragula = require('dragula');
const fs = require("fs");
const ppath = require('persist-path')('Ferny');
const readlPromise = require('readline-promise').default;

const saveFileToJsonFolder = require("../saveFileToJsonFolder.js");
const loadFileFromJsonFolder = require("../loadFileFromJsonFolder.js");
const checkFileExists = require("../checkFileExists.js");

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
    bookmarkDrag = null;

    constructor(folderContainer) {
        super();

        this.folderContainer = folderContainer;
        
        this.bookmarkDrag = Dragula([], {
            direction: "vertical",
            moves: (el, container, handle, sibling) => {
                return handle.classList.contains('bookmark-move');
            }
        });
        this.bookmarkDrag.on('drop', (el, target, source, sibling) => {
            this.moveBookmark(source.parentNode.name, target.parentNode.name, el.name).then(() => {
                this.updateBookmarksPositions().then(() => {
                    this.saveBookmarks();
                });
            });
        });

        this.toggleArrange();

        this.defaultFolder = new Folder(-1, "All bookmarks", false);
        this.appendFolder(this.defaultFolder);

        this.loadFromStorage();
    }

    newFolder() {
        this.addFolder("New folder " + this.folderCounter);

        return null;
    }

    addFolder(name) {
        this.appendFolder(new Folder(this.folderCounter++, name, true));
        this.updateFoldersPositions().then(() => {
            this.saveFolders();
        });

        return null;
    }

    appendFolder(folder) {
        folder.on("add-bookmark", (folder, bookmarkName, bookmarkURL) => {
            this.addBookmarkToFolder(folder, bookmarkName, bookmarkURL);
            folder.updateBookmarksPositions().then(() => {
                this.saveBookmarks();
            });
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
            this.saveFolders();
        });
        folder.on("edit", (id) => {
            this.saveFolders();
        });
        folder.on("bookmark-deleted", () => {
            if(this.isotope != null) {
                this.isotope.arrange();
            }
            folder.updateBookmarksPositions().then(() => {
                this.saveBookmarks();
            });
        });
        folder.on("bookmark-edited", () => {
            this.saveBookmarks();
        });
        folder.on("toggle-editor", () => {
            if(this.isotope != null) {
                this.isotope.arrange();
            }
            this.emit("folder-editor-toggled");
        });

        this.folders.push(folder);
        
        let nodes = this.folderContainer.childNodes;
        if(folder.getPosition() != null) {
            for(let i = 0; i < nodes.length; i++) {
                if(folder.getPosition() < nodes[i].position) {
                    this.folderContainer.insertBefore(folder.getNode(), nodes[i]);
                    break;
                } else {
                    if(nodes[i] == this.folderContainer.lastChild){
                        this.folderContainer.appendChild(folder.getNode());
                    } 
                }
            }
        } else {
            this.folderContainer.appendChild(folder.getNode());
        }

        this.bookmarkDrag.containers.push(folder.getNode().getElementsByClassName('folder-container')[0]);
        
        if(this.isotope != null) {
            this.isotope.reloadItems();
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
        for(let i = 0; i < this.folders.length; i++) {
            if(id == this.folders[i].getId()) {
                return this.folders[i];
            }
        }
    }

    addBookmarkToFolder(folder, bookmarkName, bookmarkURL) {
        folder.appendBookmark(new Bookmark(this.bookmarkCounter++, bookmarkName, bookmarkURL));
    }

    moveBookmark(fromFolderId, toFolderId, bookmarkId) {
        return new Promise((resolve, reject) => {
            let fromFolder = this.getFolderById(fromFolderId);
            let toFolder = this.getFolderById(toFolderId);
    
            toFolder.pushBookmark(fromFolder.getBookmarkById(bookmarkId));
            fromFolder.spliceBookmark(bookmarkId);

            resolve();
        });
    }

    updateFoldersPositions() {
        return new Promise((resolve, reject) => {
            let divs = this.folderContainer.getElementsByClassName('folder');
            for(let i = 0; i < divs.length; i++) {
                this.getFolderById(divs[i].name).setPosition(i);
            }
            resolve();
        });
    }

    updateBookmarksPositions(folArr) {
        return new Promise((resolve, reject) => {
            for(let i = 0; i < this.folders.length; i++) {
                this.folders[i].updateBookmarksPositions();
            }
            resolve();
        });
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

            this.folderContainer.classList.remove('movable');

            document.getElementById("bookmarks-arrange-btn").style.display = "none";
            document.getElementById("bookmarks-move-btn").style.display = "";
        } else {
            this.isotope.destroy();
            this.isotope = null;

            this.folderDrag = Dragula([this.folderContainer], {
                direction: "horizontal",
                moves: (el, container, handle, sibling) => {
                    return handle.classList.contains('folder-move');
                }
            });
            this.folderDrag.on("drop", (el, target, source, sibling) => {
                this.updateFoldersPositions().then(() => {
                    this.saveFolders();
                });
            });

            this.folderContainer.classList.add('movable');

            document.getElementById("bookmarks-arrange-btn").style.display = "";
            document.getElementById("bookmarks-move-btn").style.display = "none";
        }

        return null;
    }

    loadFromStorage() {
        loadFileFromJsonFolder("bookmarks", "folder-counter").then((folderCounter) => {
            this.folderCounter = folderCounter;
        });
        loadFileFromJsonFolder("bookmarks", "bookmark-counter").then((bookmarkCounter) => {
            this.bookmarkCounter = bookmarkCounter;
        });

        let foldersPromise = new Promise((resolve, reject) => {
            checkFileExists(ppath + "/json/bookmarks/folders.json").then(() => {
                // let foldersReadline = readlPromise.createInterface({
                //     terminal: false, 
                //     input: fs.createReadStream(ppath + "/json/bookmarks/folders.json")
                // });
                // foldersReadline.forEach((line, index) => {
                //     let obj = JSON.parse(line);
                //     if(obj.id != -1) {
                //         this.appendFolder(new Folder(obj.id, obj.name, true, obj.position));
                //     } else {
                //         this.defaultFolder.setPosition(obj.position);
                //     }
                // });
                loadFileFromJsonFolder("bookmarks", "folders").then((data) => {
                    let lines = data.toString().split("\n");
                    for(let i = 0; i < lines.length - 1; i++) {
                        let obj = JSON.parse(lines[i]);
                        if(obj.id != -1) {
                            this.appendFolder(new Folder(obj.id, obj.name, true, obj.position));
                        } else {
                            this.defaultFolder.setPosition(obj.position);
                        }
                    }
                    resolve();
                });
            });
        });

        foldersPromise.then(() => {
            checkFileExists(ppath + "/json/bookmarks/bookmarks.json").then(() => {
                let bookmarksReadline = readlPromise.createInterface({
                    terminal: false, 
                    input: fs.createReadStream(ppath + "/json/bookmarks/bookmarks.json")
                });
                bookmarksReadline.forEach((line, index) => {
                    let obj = JSON.parse(line);
                    this.getFolderById(obj.folder).appendBookmark(new Bookmark(obj.id, obj.name, obj.url, obj.position));
                });
            });
        });
    }

    saveFolders() {
        saveFileToJsonFolder("bookmarks", "folder-counter", this.folderCounter);
        saveFileToJsonFolder("bookmarks", "folders", "").then(() => {
            for(let i = 0; i < this.folders.length; i++) {
                fs.appendFile(ppath + "/json/bookmarks/folders.json", this.folders[i].toString() + "\n", (err) => {
                    if(err) {
                        throw err;
                    }
                });
            }
        });
    }

    saveBookmarks() {
        saveFileToJsonFolder("bookmarks", "bookmark-counter", this.bookmarkCounter);
        saveFileToJsonFolder("bookmarks", "bookmarks", "").then(() => {
            for(let i = 0; i < this.folders.length; i++) {
                for(let j = 0; j < this.folders[i].getBookmarks().length; j++) {
                    let bookmark = this.folders[i].getBookmarks()[j].getData();
                    bookmark.folder = this.folders[i].getId();
                    fs.appendFile(ppath + "/json/bookmarks/bookmarks.json", JSON.stringify(bookmark) + "\n", (err) => {
                        if(err) {
                            throw err;
                        }
                    });
                }
            }
        });
    }
}

module.exports = BookmarkManager;