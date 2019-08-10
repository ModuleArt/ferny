function applyWinControls(type) {
    var platform = process.platform;

    if(platform == "win32") {
        setWindows(type);
    } else if(platform == "linux") {
        setLinux(type);
    }
}

function setWindows(type) {
    var windowControls = document.getElementById('window-controls');
    windowControls.classList.add('windows');

    if(type == null) {
        windowControls.innerHTML = `
            <div class="button" id="min-btn" title="Minimize" onclick="minimizeWindow()">
                <span>&#xE921;</span>
            </div>
            <div class="button" id="max-btn" title="Maximize" onclick="maximizeWindow()">
                <span>&#xE922;</span>
            </div>
            <div class="button" id="restore-btn" title="Restore Down" onclick="restoreWindow()" style="display: none;">
                <span>&#xE923;</span>
            </div>
            <div class="button" id="close-btn" title="Close" onclick="closeWindow()">
                <span>&#xE8BB;</span>
            </div>`;
    } else if(type == "only-close") {
        windowControls.innerHTML = `
            <div class="button" id="close-btn" title="Close" onclick="closeWindow()">
                <span>&#xE8BB;</span>
            </div>`;
    }
}

function setLinux(type) {
    var windowControls = document.getElementById('window-controls');
    windowControls.classList.add('linux');

    if(type == null) {
        windowControls.innerHTML = `
            <img name="minimize16" id="min-btn" class="title-bar-btn theme-icon" title="Minimize" onclick="minimizeWindow()">
            <img name="square16" id="max-btn" class="title-bar-btn theme-icon" title="Maximize" onclick="maximizeWindow()">
            <img name="restore16" id="restore-btn" class="title-bar-btn theme-icon" title="Restore Down" onclick="restoreWindow()" style="display: none;">
            <img name="close16" id="close-btn" class="title-bar-btn theme-icon" title="Close" onclick="closeWindow()">`;
    } else if(type == "only-close") {
        windowControls.innerHTML = `
            <img name="close16" id="close-btn" class="title-bar-btn theme-icon" title="Close" onclick="closeWindow()">`;
    }
}

module.exports = applyWinControls;