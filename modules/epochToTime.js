function epochToTime(time) {
    let date = new Date(0);
    date.setUTCSeconds(time);
  
    var minutes = date.getMinutes();
    var hours = date.getHours()
  
    if(minutes <= 9) {
        minutes = "0" + minutes;
    }
  
    if(hours <= 9) {
        hours = "0" + hours;
    }
  
    var str = hours + ":" + minutes;
    return str;
}

module.exports = epochToTime;