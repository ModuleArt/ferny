const { ipcRenderer } = require('electron');

document.addEventListener('contextmenu', webviewContextMenu);
document.addEventListener('wheel', webviewMouseWheel);

// var sheet = window.document.styleSheets[0];
// sheet.insertRule('strong { color: red; }', sheet.cssRules.length);

function webviewMouseWheel(e) {
    if (e.ctrlKey) {
        if (e.deltaY > 0) {
            ipcRenderer.send('request-webview-zoomout');
        }
        if (event.deltaY < 0) {
            ipcRenderer.send('request-webview-zoomin');
        }
    }
}

function webviewContextMenu(e) {
    // console.log(e);
    let Data = {
        x: e.clientX,
        y: e.clientY,
        type: e.target.tagName
    };
    ipcRenderer.send('request-webview-contextmenu', Data);
}