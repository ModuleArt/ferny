function rgbToRgbaString(rgb) {
    var arr = rgb.replace(/[^\d,]/g, '').split(',');
    var rgba = "rgba(" + arr[0] + ", " + arr[1] + ", " + arr[2] + ", 0.1)";

    return rgba;
}

module.exports = rgbToRgbaString;