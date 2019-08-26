function rgbToRgbaString(rgb) {
    var arr = rgb.replace(/[^\d,]/g, '').split(',');
    var rgba = "rgba(" + arr[0] + ", " + arr[1] + ", " + arr[2] + ", var(--opacity-over))";

    return rgba;
}

module.exports = rgbToRgbaString;