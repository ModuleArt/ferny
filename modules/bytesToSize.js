function bytesToSize(bytes) {
    var sizes = ['bytes', 'Kb', 'Mb', 'Gb', 'Tb'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

module.exports = bytesToSize;