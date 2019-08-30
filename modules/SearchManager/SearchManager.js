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
const isUrl = require('validate.io-uri');
const autoSuggest = require('suggestion');

const loadSearchEngine = require("../loadSearchEngine.js");

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
        let engines = searchEngines.getElementsByClassName('search-engine');
        for(let i = 0; i < engines.length; i++) {
            engines[i].onclick = () => {
                this.searchWith(null, engines[i].name);
            }
        }

        this.searchSuggestContainer = searchSuggestContainer;
        this.searchSuggestContainer.onmousewheel = (event) => {
            event.preventDefault();
            if (event.deltaY < 0) {
                var suggestions = this.searchSuggestContainer.childNodes;
                var i = 0;
                while (i < suggestions.length && !suggestions[i].classList.contains('active')) {
                    i++;
                }
                if (i > 0) {
                    this.searchInput.value = suggestions[i].previousSibling.value;
                    suggestions[i].classList.remove('active');
                    suggestions[i].previousSibling.classList.add('active');
                }
            }
            if (event.deltaY > 0) {
                var suggestions = this.searchSuggestContainer.childNodes;
                var i = 0;
                while (i < suggestions.length && !suggestions[i].classList.contains('active')) {
                    i++;
                }
                if (i < suggestions.length - 1) {
                    document.getElementById('search-input').value = suggestions[i].nextSibling.value;
                    suggestions[i].classList.remove('active');
                    suggestions[i].nextSibling.classList.add('active');
                }
            }
        }

        this.searchInput = searchInput;
        this.searchInput.oninput = () => {
            this.getSuggestions();
        }
        this.searchInput.onkeyup = (event) => {
            event.preventDefault();

            this.updateClearSearchButton();

            if (this.searchInput.value.length > 0) {
                if (event.keyCode === 13) {
                    var suggestions = this.searchSuggestContainer.childNodes;
                    if(suggestions.length > 0) {
                        var i = 0;
                        while (i < suggestions.length && !suggestions[i].classList.contains('active')) {
                            i++;
                        }
                        this.navigateSuggest(suggestions[i].value);
                    } else {
                        this.navigateSuggest(this.searchInput.value);
                    }
                }
            }

            if (event.keyCode === 40) {
                var suggestions = this.searchSuggestContainer.childNodes;
                var i = 0;
                while (i < suggestions.length && !suggestions[i].classList.contains('active')) {
                    i++;    
                }
                if (i < suggestions.length - 1) {
                    this.searchInput.value = suggestions[i].nextSibling.value;
                    suggestions[i].classList.remove('active');
                    suggestions[i].nextSibling.classList.add('active');
                }
            }
            if (event.keyCode === 38) {
                var suggestions = this.searchSuggestContainer.childNodes;
                var i = 0;
                while (i < suggestions.length && !suggestions[i].classList.contains('active')) {
                    i++;
                }
                if (i > 0) {
                    this.searchInput.value = suggestions[i].previousSibling.value;
                    suggestions[i].classList.remove('active');
                    suggestions[i].previousSibling.classList.add('active');
                }
            }
        }

        loadSearchEngine().then((searchEngine) => {
            this.setSearchEngine(searchEngine);
        });
    }

    updateClearSearchButton() {
        if(this.searchInput.value.length > 0) {
            this.clearSearchButton.classList.add('show');
        } else {
            this.clearSearchButton.classList.remove('show');
        }
    }

    getSuggestions() {
        this.searchSuggest.style.display = "";
        this.searchSuggest.classList.remove("hide");
            
        if (this.searchInput.value.length > 0) {
            autoSuggest(this.searchInput.value, (err, suggestions) => {
                this.searchSuggestContainer.innerHTML = "";

                let firstInput = document.createElement('input');
                firstInput.tabIndex = -1;
                firstInput.classList.add('active');
                firstInput.type = 'button';
                firstInput.value = this.searchInput.value;
                firstInput.onclick = () => {
                    this.navigateSuggest(firstInput.value);
                }
                this.searchSuggestContainer.appendChild(firstInput);

                if (suggestions != null && suggestions.length > 0) {
                    if (this.searchSuggestContainer.childNodes.length < 5) {
                        for (var i = 0; i < 5; i++) {
                            if (suggestions[i] != null) {
                                let s = document.createElement('input');
                                s.tabIndex = -1;
                                s.type = 'button';
                                s.value = suggestions[i];
                                s.onclick = () => {
                                    this.navigateSuggest(s.value);
                                }
                                this.searchSuggestContainer.appendChild(s);
                            }
                        }
                    }
                }
            });
        }
    }
      
    searchWith(text, engine) {
        if(text == null) {
            var suggestions = this.searchSuggestContainer.childNodes;
            var i = 0;
            while (i < suggestions.length && !suggestions[i].classList.contains('active')) {
                i++;
            }
            text = suggestions[i].value;
        }
      
        switch (engine) {
            case 'google':
                this.newTab("https://google.com/search?q=" + text);
                break;
            case 'bing':
                this.newTab("https://bing.com/search?q=" + text);
                break;
            case 'duckduckgo':
                this.newTab("https://duckduckgo.com/?q=" + text);
                break;
            case 'yahoo':
                this.newTab("https://search.yahoo.com/search?p=" + text);
                break;
            case 'wikipedia':
                this.newTab("https://wikipedia.org/wiki/Special:Search?search=" + text);
                break;
            case 'yandex':
                this.newTab("https://yandex.com/search/?text=" + text);
                break;
            case 'mailru':
                this.newTab("https://go.mail.ru/search?q=" + text);
                break;
            case 'baidu':
                this.newTab("https://www.baidu.com/s?wd=" + text);
                break;
            case 'naver':
                this.newTab("https://search.naver.com/search.naver?query=" + text);
                break;
            case 'qwant':
                this.newTab("https://www.qwant.com/?q=" + text);
                break;
            case 'youtube':
                this.newTab("https://www.youtube.com/results?search_query=" + text);
                break;
        }
    }
      
    navigateSuggest(text) {
        if(text != "" && text != null) {
            if(isUrl(text)) {
                this.newTab(text);
            } else {
                let engines = this.searchEngines.getElementsByClassName('search-engine');
                for(let i = 0; i < engines.length; i++) {
                    if(engines[i].classList.contains('active')) {
                        this.searchWith(text, engines[i].name);
                        break;
                    }
                }
            }
        }
    }

    newTab(url) {
        ipcRenderer.send("tabManager-addTab", url, true);
    }

    setSearchEngine(engineName) {
        let engines = this.searchEngines.getElementsByClassName('search-engine');
        for(let i = 0; i < engines.length; i++) {
            if(engines[i].name == engineName) {
                engines[i].classList.add('active');
                document.getElementById('search-icon').src = engines[i].getElementsByTagName('img')[0].src;
                break;
            }
        }
    }

    goToSearch(text) {
        if(text == null) {
            this.searchInput.value = "";
        } else {
            this.searchInput.value = text;
        }
        this.searchInput.focus();
    }

    clearSearch() {
        this.searchInput.value = "";
    }
}

module.exports = SearchManager;