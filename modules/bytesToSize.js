function bytesToSize(bytes) {
    var sizes = ["bytes", "Kb", "Mb", "Gb", "Tb"];
    if (bytes === 0) {
        return "0 Byte";
    }
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

module.exports = bytesToSize;