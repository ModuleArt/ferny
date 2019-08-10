function applyBorderRadius(size) {
    document.documentElement.style.setProperty('--px-radius', size + 'px');
}

module.exports = applyBorderRadius;