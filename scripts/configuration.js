//Hookup button click handlers
$(function(){
    renderCustomAnchors();

    $("#addAnchorBtn").click(function(){
        const issuerAddress = $("#newAnchorAddress").val();
        var issuerName = $("#newAnchorName").val();
        if ((issuerAddress || "").length > 0 && (issuerName || "").length > 0) {
            if (AssetRepository.AddCustomAnchor(issuerAddress, issuerName)) {
                $("#newAnchorAddress").val("");
                $("#newAnchorName").val("");
                renderCustomAnchors();
                highlightCustomAnchor(issuerAddress);
            }
        }
    });
});

var renderCustomAnchors = function() {
    var html = "";
    for (var i = 0; i < AssetRepository.CustomAnchors.length; i++) {
        html += customAnchorItem(AssetRepository.CustomAnchors[i].Domain, AssetRepository.CustomAnchors[i].Address);
    }
    if (html.length <= 0) {
        html = "<i>No custom issuers yet. Use the form below to add some.</i>";
    }
    $("#customAnchorsList").html(html);
};

var highlightCustomAnchor = function(anchorAddress) {
    $("#"+anchorAddress).addClass("highlight");
};

var removeCustomAnchor = function(anchorAddress) {
    if (AssetRepository.RemoveCustomAnchor(anchorAddress)) {
        $("#"+anchorAddress).css("background-color", "red");
        $("#"+anchorAddress).remove();
        if (AssetRepository.CustomAnchors.length == 0) {
            renderCustomAnchors();
        }
    }
};




/********************************************* DEBUG *********************************************/
var dumpCookie = function(){
    const cookies = document.cookie.split(";");
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

function eraseCookies(name) {
    const cookies = document.cookie.split(";");
    var text = "";
    for (var i=0; i<cookies.length; i++) {
        const name = cookies[i].substr(0, cookies[i].indexOf("="));
        text += "Erasing " + name + "<br/>";
        document.cookie = name+'=; Max-Age=-99999999;';
    }
    $("#debug").html(text);
}