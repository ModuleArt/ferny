/*
  ####   ####  #    #  ####  #####
 #    # #    # ##   # #        #
 #      #    # # #  #  ####    #
 #      #    # #  # #      #   #
 #    # #    # #   ## #    #   #
  ####   ####  #    #  ####    #
*/

const EventEmitter = require("events");
const { ipcRenderer } = require("electron");
const isUrl = require("validate.io-uri");
const autoSuggest = require("suggestion");

const loadSearchEngineModule = require("../loadSearchEngine.js");

class SearchManager extends EventEmitter {
    searchInput = null;
    searchSuggest = null;
    searchSuggestContainer = null;
    searchEngines = null;
    clearSearchButton = null;

    constructor(searchInput, searchSuggest, searchSuggestContainer, searchEngines, clearSearchButton) {
        super();

        this.clearSearchButton = clearSearchButton;

        this.searchSuggest = searchSuggest;

        this.searchEngines = searchEngines;
        let engines = searchEngines.getElementsByClassName("search-engine");

        Array.from(engines).forEach((item) => {
            item.onclick = () => {
                this.searchWith(null, item.name);
            }
        });

        this.searchSuggestContainer = searchSuggestContainer;
        this.searchSuggestContainer.onmousewheel = (event) => {
            event.preventDefault();
            if (event.deltaY < 0) {
                var suggestions = this.searchSuggestContainer.childNodes;
                let i = 0;
                while (i < suggestions.length && !suggestions[i].classList.contains("active")) {
                    i++;
                }
                if (i > 0) {
                    this.searchInput.value = suggestions[i].previousSibling.value;
                    suggestions[i].classList.remove("active");
                    suggestions[i].previousSibling.classList.add("active");
                }
            } else if (event.deltaY > 0) {
                var suggestions = this.searchSuggestContainer.childNodes;
                let i = 0;
                while (i < suggestions.length && !suggestions[i].classList.contains("active")) {
                    i++;
                }
                if (i < suggestions.length - 1) {
                    document.getElementById("search-input").value = suggestions[i].nextSibling.value;
                    suggestions[i].classList.remove("active");
                    suggestions[i].nextSibling.classList.add("active");
                }
            }
        }

        this.searchInput = searchInput;
        this.searchInput.oninput = () => {
            this.getSuggestions();
        }
        this.searchInput.onkeydown = (event) => {
            if (event.keyCode === 40) {
                var suggestions = this.searchSuggestContainer.childNodes;
                let i = 0;
                while (i < suggestions.length && !suggestions[i].classList.contains("active")) {
                    i++;    
                }
                if (i < suggestions.length - 1) {
                    this.searchInput.value = suggestions[i].nextSibling.value;
                    suggestions[i].classList.remove("active");
                    suggestions[i].nextSibling.classList.add("active");
                }
            } else if (event.keyCode === 38) {
                var suggestions = this.searchSuggestContainer.childNodes;
                let i = 0;
                while (i < suggestions.length && !suggestions[i].classList.contains("active")) {
                    i++;
                }
                if (i > 0) {
                    this.searchInput.value = suggestions[i].previousSibling.value;
                    suggestions[i].classList.remove("active");
                    suggestions[i].previousSibling.classList.add("active");
                }
            }
        };
        this.searchInput.onkeyup = (event) => {
            event.preventDefault();

            this.updateClearSearchButton();

            if (this.searchInput.value.length > 0) {
                if (event.keyCode === 13) {
                    var suggestions = this.searchSuggestContainer.childNodes;
                    if(suggestions.length > 0) {
                        let i = 0;
                        while (i < suggestions.length && !suggestions[i].classList.contains("active")) {
                            i++;
                        }
                        this.navigateSuggest(suggestions[i].value);
                    } else {
                        this.navigateSuggest(this.searchInput.value);
                    }
                }
            }
        };

        loadSearchEngineModule().then((searchEngine) => {
            this.setSearchEngine(searchEngine);
        });
    }

    updateClearSearchButton() {
        if(this.searchInput.value.length > 0) {
            this.clearSearchButton.classList.add("show");
        } else {
            this.clearSearchButton.classList.remove("show");
        }
    }

    getSuggestions() {    
        if (this.searchInput.value.length > 0) {
            autoSuggest(this.searchInput.value, (err, suggestions) => {
                this.searchSuggest.style.display = "";
                this.searchSuggest.classList.remove("hide");

                this.searchSuggestContainer.innerHTML = "";

                let firstInput = document.createElement("input");
                firstInput.tabIndex = -1;
                firstInput.classList.add("active");
                firstInput.type = "button";
                firstInput.value = this.searchInput.value;
                firstInput.onclick = () => {
                    this.navigateSuggest(firstInput.value);
                };
                this.searchSuggestContainer.appendChild(firstInput);

                if (suggestions != null && suggestions.length > 0) {
                    if (this.searchSuggestContainer.childNodes.length < 5) {
                        for (let i = 0; i < 5; i++) {
                            if (suggestions[i] != null) {
                                let s = document.createElement("input");
                                s.tabIndex = -1;
                                s.type = "button";
                                s.value = suggestions[i];
                                s.onclick = () => {
                                    this.navigateSuggest(s.value);
                                };
                                s.oncontextmenu = () => {
                                    this.navigateSuggest(s.value, true);
                                };
                                this.searchSuggestContainer.appendChild(s);
                            }
                        }
                    }
                }
            });
        }
    }
      
    searchWith(text, engine, background) {
        if(text == null) {
            var suggestions = this.searchSuggestContainer.childNodes;
            let i = 0;
            while (i < suggestions.length && !suggestions[i].classList.contains("active")) {
                i++;
            }
            text = suggestions[i].value;
        }
      
        switch (engine) {
            case "google":
                this.newTab("https://google.com/search?q=" + text, background);
                break;
            case"'bing":
                this.newTab("https://bing.com/search?q=" + text, background);
                break;
            case "duckduckgo":
                this.newTab("https://duckduckgo.com/?q=" + text, background);
                break;
            case "yahoo":
                this.newTab("https://search.yahoo.com/search?p=" + text, background);
                break;
            case "wikipedia":
                this.newTab("https://wikipedia.org/wiki/Special:Search?search=" + text, background);
                break;
            case "yandex":
                this.newTab("https://yandex.com/search/?text=" + text, background);
                break;
            case "mailru":
                this.newTab("https://go.mail.ru/search?q=" + text,background);
                break;
            case "baidu":
                this.newTab("https://www.baidu.com/s?wd=" + text, background);
                break;
            case "naver":
                this.newTab("https://search.naver.com/search.naver?query=" + text, background);
                break;
            case "qwant":
                this.newTab("https://www.qwant.com/?q=" + text, background);
                break;
            case "youtube":
                this.newTab("https://www.youtube.com/results?search_query=" + text, background);
                break;
            case "ecosia":
                this.newTab("https://www.ecosia.org/search?q=" + text, background);
                break;
            case "twitter":
                this.newTab("https://twitter.com/search?q=" + text, background);
                break;
            case "amazon":
                this.newTab("https://www.amazon.com/s?k=" + text, background);
                break;
            case "twitch":
                this.newTab("https://www.twitch.tv/search?term=" + text, background);
                break;
            case "github":
                this.newTab("https://github.com/search?q=" + text, background);
                break;
            case "wolfram":
                this.newTab("https://www.wolframalpha.com/input/?i=" + text, background);
                break;
            case "ebay":
                this.newTab("https://www.ebay.com/sch/i.html?_nkw=" + text, background);
                break;
            case "startpage":
                this.newTab("https://www.startpage.com/do/dsearch?query=" + text, background);
                break;
        }
    }
      
    navigateSuggest(text, background) {
        if(text !== "" && text !== null) {
            if(isUrl(text)) {
                this.newTab(text);
            } else {
                let engines = this.searchEngines.getElementsByClassName("search-engine");
                for(let i = 0; i < engines.length; i++) {
                    if(engines[i].classList.contains("active")) {
                        this.searchWith(text, engines[i].name, background);
                        break;
                    }
                }
            }
        }
    }

    newTab(url, background) {
        ipcRenderer.send("tabManager-addTab", url, !background);
        return null;
    }

    setSearchEngine(engineName) {
        let engines = this.searchEngines.getElementsByClassName("search-engine");
        for(let i = 0; i < engines.length; i++) {
            if(engines[i].name == engineName) {
                engines[i].classList.add("active");
                document.getElementById("search-icon").src = engines[i].getElementsByTagName("img")[0].src;
            } else {
                engines[i].classList.remove("active");
            }
        }

        return null;
    }

    goToSearch(text, cursorPos) {
        if(text == null) {
            this.searchInput.value = "";
        } else {
            this.searchInput.value = text;
        }

        if(cursorPos != null) {
            this.searchInput.setSelectionRange(cursorPos, cursorPos);
        }

        this.searchInput.focus();

        this.getSuggestions();

        return null;
    }

    clearSearch() {
        this.searchInput.value = "";

        return null;
    }

    performSearch(text) {
        this.navigateSuggest(text);
    }
}

module.exports = SearchManager;