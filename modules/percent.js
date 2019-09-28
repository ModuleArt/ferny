function percent(bytes, total) {
    return Math.round((bytes / total) * 100);
}

module.exports = percent;