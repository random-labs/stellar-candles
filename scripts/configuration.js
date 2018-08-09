//Hookup button click handlers
$(function(){
    //Dump current list of custom anchors
    var html = "";
    for (var i = 0; i < AssetRepository.CustomAnchors.length; i++) {
        html += AssetRepository.CustomAnchors[i].Domain + " - " + AssetRepository.CustomAnchors[i].Address + "<br/>";
    }
    $("#customAnchorsList").html(html);

    $("#addAnchorBtn").click(function(){
        const issuerAddress = $("#newAnchorAddress").val();
        var issuerName = $("#newAnchorName").val();
        if ((issuerAddress || "").length > 0 && (issuerName || "").length > 0) {
            AssetRepository.AddCustomAnchor(issuerAddress, issuerName);
            alert("success!");
        }
    });
});

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