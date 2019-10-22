function rgbToRgbaString(rgb) {
    let arr = rgb.replace(/[^\d,]/g, '').split(',');
    let rgba = "rgba(" + arr[0] + ", " + arr[1] + ", " + arr[2] + ", 0.15)";

    return rgba;
}

module.exports = rgbToRgbaString;