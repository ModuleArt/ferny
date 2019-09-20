function epochToDate(time) {
    let date = new Date(0);
    date.setUTCSeconds(time);
    var str = date.getDate() + " " + numberToMonth(date.getMonth()) + " " + date.getFullYear(); 
    return str;
}

module.exports = epochToDate;