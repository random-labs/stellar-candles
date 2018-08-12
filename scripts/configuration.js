//Hookup button click handlers
$(function(){
    renderCustomAssetTypes();
    renderCustomAnchors();

    $("#addAnchorBtn").click(function(){
        var issuerAddress = $("#newAnchorAddress").val();
        const issuerName = $("#newAnchorName").val();
        //TODO: validation + default 'domain' if none is given
        if ((issuerAddress || "").length > 0 && (issuerName || "").length > 0) {
            issuerAddress = issuerAddress.toUpperCase();
            if (AssetRepository.AddCustomAnchor(issuerAddress, issuerName)) {
                $("#newAnchorAddress").val("");
                $("#newAnchorName").val("");
                renderCustomAnchors();
                highlightCustomItem(issuerAddress);
            }
        }
    });

    $("#addAssetTypeBtn").click(function(){
        var assetType = $("#newAssetType").val();
        //TODO: validation
        if ((assetType || "").length > 0) {
            assetType = assetType.toUpperCase();
            if (AssetRepository.AddCustomAssetType(assetType)) {
                $("#newAssetType").val("");
                renderCustomAssetTypes();
                highlightCustomItem(assetType);
            }
        }
    });
});

var renderCustomAssetTypes = function() {
    var html = "";
    for (var i=0; i < AssetRepository.CustomAssetCodes.length; i++) {
        html += customAssetTypeItem(AssetRepository.CustomAssetCodes[i]);
    }
    if (html.length <= 0) {
        html = noAssetTypesMessage();
    }
    $("#customAssetTypesList").html(html);
};

var renderCustomAnchors = function() {
    var html = "";
    for (var i = 0; i < AssetRepository.CustomAnchors.length; i++) {
        html += customAnchorItem(AssetRepository.CustomAnchors[i].Domain, AssetRepository.CustomAnchors[i].Address);
    }
    if (html.length <= 0) {
        html = noAnchorsMessage();
    }
    $("#customAnchorsList").html(html);
};

var removeCustomAnchor = function(anchorAddress) {
    if (AssetRepository.RemoveCustomAnchor(anchorAddress)) {
        renderCustomAnchors();
    }
};

var removeAssetType = function(assetType) {
    if (AssetRepository.RemoveCustomAssetType(assetType)) {
        renderCustomAssetTypes();
    }
};


var highlightCustomItem = function(itemId) {
    $("#"+itemId).addClass("highlight");
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

function eraseCookies() {
    const cookies = document.cookie.split(";");
    var text = "";
    for (var i=0; i<cookies.length; i++) {
        const name = cookies[i].substr(0, cookies[i].indexOf("="));
        text += "Erasing " + name + "<br/>";
        document.cookie = name+'=; Max-Age=-99999999;';
    }
    $("#debug").html(text);
}