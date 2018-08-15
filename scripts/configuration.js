const ConfigurationUi = new Configuration();

$(function(){
    ConfigurationUi.Initialize();
});


/**
 * UI handler for the Configuration page
 * @constructor
 */
function Configuration() {
    var _this = this;
    var _selectedAssetCode = null;
    var _selectedIssuerAddress = null;

    this.Initialize = function() {
        renderCustomAssetCodes();
        renderCustomAnchors();
        renderCustomAssets();
        //If this is redirect from the Exchange page and asset code was selected, it's in the URL parameter
        var assetType = Utils.GetUrlParameter(GETParams.ASSET_TYPE);
        setupAssetCodeDropDown(assetType);
        setupAnchorDropDown();

        //Hookup button click handlers
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
                if (AssetRepository.AddCustomAssetCode(assetType)) {
                    $("#newAssetType").val("");
                    renderCustomAssetCodes();
                    highlightCustomItem(assetType);
                }
            }
        });

        $("#addAssetBtn").click(function(){
            if (null == _selectedAssetCode || null == _selectedIssuerAddress) {
                return;
            }
            if (AssetRepository.AddCustomAsset(_selectedAssetCode, _selectedIssuerAddress)) {
                renderCustomAssets();
                highlightCustomItem(_selectedAssetCode + "-" + _selectedIssuerAddress);
            }
        });
    };

    /** @private
     * Setup the drop-down with known asset codes
     */
    var setupAssetCodeDropDown = function(selectedAssetType) {
        var assetTypesList = [{
            text: "<i style='color: lightgray;'>asset type...</i>",
            value: null
        }];
        Constants.CommonAssetTypes.forEach(function(assetType){     //TODO: + custom asset types
            //Search for asset full name among know assets
            var assetFullName = " ";
            var assetImage = "unknown.png";
            for (var asset in KnownAssets) {
                if (KnownAssets[asset].AssetCode === assetType) {
                    assetFullName = KnownAssets[asset].FullName;
                    assetImage = assetType + ".png";
                    break;
                }
            }
    
            assetTypesList.push({
                text: assetType,
                value: assetType,
                selected: assetType === selectedAssetType,
                description: assetFullName,
                imageSrc: "./images/assets/" + assetImage
            });
        });
    
        $("#assetTypesDropDown").ddslick({
            data: assetTypesList,
            width: 150,
            onSelected: function (data) {
                if (null === data.selectedData.value ) {
                    $('div[id^="anchorsDropDown"]').ddslick('select', {index: 0 });
                }
                _selectedAssetCode = data.selectedData.value;
            }
        });
    };

    var setupAnchorDropDown = function() {

        var assetIssuersDdData = [{
            text: "<i style='color: lightgray;'>asset issuer...</i>",
            value: null
        }];
        for (var issuer in KnownAccounts) {         //TODO: This is wrong. Use default + custom anchors
            const issuerAccount = KnownAccounts[issuer];
            if (!issuerAccount.Address) {
                continue;   //Skip members that are functions
            }
            assetIssuersDdData.push({
                text: issuerAccount.Domain + " (" + issuerAccount.Address.substring(0, 16) + "...)",
                description: issuerAccount.Domain,
                value: issuerAccount.Address
            });
        }
    
        $("#anchorsDropDown").ddslick({
            data: assetIssuersDdData,
            width: 400,
            onSelected: function (data) {
                _selectedIssuerAddress = data.selectedData.value
            }
        });
    };

    var renderCustomAssetCodes = function() {
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
    
    var renderCustomAssets = function() {
        var html = "";
        for (var i=0; i < AssetRepository.CustomAssets.length; i++) {
            html += customAssetItem(AssetRepository.CustomAssets[i].AssetCode, AssetRepository.CustomAssets[i].Issuer.Domain, AssetRepository.CustomAssets[i].Issuer.Address);
        }
        if (html.length <= 0) {
            html = noAssetMessage();
        }
        $("#customAssetsList").html(html);
    };
    
    this.RemoveCustomAnchor = function(anchorAddress) {
        if (AssetRepository.RemoveCustomAnchor(anchorAddress)) {
            renderCustomAnchors();
        }
    };
    
    this.RemoveAssetType = function(assetCode) {
        if (AssetRepository.RemoveCustomAssetCode(assetCode)) {
            renderCustomAssetCodes();
        }
    };

    this.RemoveAsset = function(assetCode, anchorAddress) {
        if (AssetRepository.RemoveCustomAsset(assetCode, anchorAddress)) {
            renderCustomAssets();
        }
    };
    
    var highlightCustomItem = function(itemId) {
        $("#"+itemId).addClass("highlight");
    };
}


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