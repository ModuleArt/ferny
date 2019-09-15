const { ipcRenderer } = require('electron');

document.addEventListener('wheel', webviewMouseWheel);

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