
var dumpCookie = function(){
    var cookies = document.cookie.split(";");
    var text = "";
    for (var i=0; i<cookies.length; i++) {
        text += cookies[i] + "<br/>";
    }
    $("#debug").html(text);
};

var setCookie = function() {
    var expiration = new Date();
    expiration.setTime(expiration.getTime() + (1234*24*60*60*1000));  //Make it expire in 1234 days
    document.cookie = $("#txtDebug").val() + ";expires=" + expiration.toUTCString();
};