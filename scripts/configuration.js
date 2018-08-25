var configurationUi = null;

$(function() {
    configurationUi = new Configuration();
    configurationUi.Initialize();
});


/**
 * UI handler for the Configuration page
 * @constructor
 */
function Configuration() {
    const _this = this;
    let _selectedAssetCode = null;
    let _selectedIssuerAddress = null;

    this.Initialize = function() {
        renderCustomAssetCodes();
        renderCustomAnchors();
        renderCustomAssets();
        //If this is redirect from the Exchange page and asset code was selected, it's in the URL parameter
        const assetType = Utils.GetUrlParameter(GETParams.ASSET_TYPE);
        if ((assetType || "").length > 0) {
            _selectedAssetCode = assetType;
        }
        setupAssetCodeDropDown(assetType);
        setupAnchorDropDown();

        //Hookup button click handlers
        $("#addAnchorBtn").click(function() {
            if (validateInput("newAnchorAddress")) {
                addAnchor();
            }
        });
        $("#addAssetCodeBtn").click(function() {
            if (validateInput("newAssetCode")) {
                addAssetCode();
            }
        });
        $("#addAssetBtn").click(addAsset);

        $("input#newAssetCode").keydown(function(e){ handleKeyDown(e, addAssetCode) });
        $("input#newAnchorAddress").keydown(function(e){ handleKeyDown(e, addAnchor) });
        $("input#newAnchorName").keydown(function(e){
            handleKeyDown({
                target: $("input#newAnchorAddress"),    //This is unbelievably ugly
                which: e.which
            }, addAnchor)
        });
    };

    this.RemoveCustomAnchor = function(anchorAddress) {
        if (AssetRepository.RemoveCustomAnchor(anchorAddress)) {
            renderCustomAnchors();
        }
    };
    
    this.RemoveAssetCode = function(assetCode) {
        if (AssetRepository.RemoveCustomAssetCode(assetCode)) {
            renderCustomAssetCodes();
        }
    };

    this.RemoveAsset = function(assetCode, anchorAddress) {
        if (AssetRepository.RemoveCustomAsset(assetCode, anchorAddress)) {
            renderCustomAssets();
        }
    };

    const handleKeyDown = function(event, okCallback){
        const input = $(event.target);
        if(event.which == 13/*Enter*/) {
            if (validateInput(input.attr("id"))) {
                okCallback();
            }
        }
        else {
            input.removeClass("invalid");
        }
    };

    const validateInput = function(inputId) {
        const input = $("input#" + inputId);
        const value = $(input).val();
        let valid = true;
        if ("" == value) {
            valid = false;
        }
        else {
            //Get regex from attribute of the input and validate against it
            const regexPattern = $(input).data("validation-regex");
            const regex = new RegExp(regexPattern);
            valid = regex.test(value);
        }

        if (!valid) {
            $(input).addClass("invalid");
            $("[data-hint-for='" + inputId + "']").show();
        }
        else {
            $(input).removeClass("invalid");
            $("[data-hint-for='" + inputId + "']").hide();
        }

        return valid;
    };



    /**
     * Setup the drop-down with known asset codes
     * @private
     */
    const setupAssetCodeDropDown = function(selectedAssetType) {
        const assetTypesList = [{
            text: "<i style='color: gray;'>asset type...</i>",
            value: null
        }];
        AssetRepository.getAllAssetCodes().forEach(function(assetType){
            //Search for asset full name among know assets
            let assetFullName = " ";
            let assetImage = "unknown.png";
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

    const setupAnchorDropDown = function() {
        const assetIssuersDdData = [{
            text: "<i style='color: gray;'>asset issuer...</i>",
            value: null
        }];
        const anchors = AssetRepository.getAllAnchors();
        for (let i=0; i<anchors.length; i++) {
            const issuerAccount = anchors[i];
            if (issuerAccount.IsNativeIssuer()) {
                continue;
            }
            assetIssuersDdData.push({
                text: issuerAccount.Domain + " (" + issuerAccount.Address.substring(0, 22) + "...)",
                description: issuerAccount.Address,
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

    const renderCustomAssetCodes = function() {
        let html = "";
        for (let i=0; i < AssetRepository.getCustomAssetCodes().length; i++) {
            html += customAssetCodeItem(AssetRepository.getCustomAssetCodes()[i]);
        }
        if (html.length <= 0) {
            html = noAssetTypesMessage();
        }
        $("#customAssetTypesList").html(html);
    };
    
    const renderCustomAnchors = function() {
        let html = "";
        const anchors = AssetRepository.getCustomAnchors();
        for (let i = 0; i < anchors.length; i++) {
            html += customAnchorItem(anchors[i].Domain, anchors[i].Address);
        }
        if (html.length <= 0) {
            html = noAnchorsMessage();
        }
        $("#customAnchorsList").html(html);
    };
    
    const renderCustomAssets = function() {
        let html = "";
        const customAssets = AssetRepository.getCustomAssets();
        for (let i=0; i < customAssets.length; i++) {
            html += customAssetItem(customAssets[i].AssetCode, customAssets[i].Issuer.Domain, customAssets[i].Issuer.Address);
        }
        if (html.length <= 0) {
            html = noAssetMessage();
        }
        $("#customAssetsList").html(html);
    };

    /**
     * Collect inputs and create new anchor with name and stellar address
     * @private
     */
    const addAnchor = function(){
        const issuerAddress = $("#newAnchorAddress").val().toUpperCase();
        const issuerName = $("#newAnchorName").val();
        if (AssetRepository.AddCustomAnchor(issuerAddress, issuerName)) {
            $("#newAnchorAddress").val("");
            $("#newAnchorName").val("");
            renderCustomAnchors();
            highlightCustomItem(issuerAddress);
        }
    };

    /**
     * Add custom asset type code from the text input
     * @private
     */
    const addAssetCode = function() {
        const assetType = $("#newAssetCode").val().toUpperCase();
        if (AssetRepository.AddCustomAssetCode(assetType)) {
            $("#newAssetCode").val("");
            renderCustomAssetCodes();
            highlightCustomItem(assetType);
        }
    };

    /**
     * Add custom asset
     * @private
     */
    const addAsset = function(){
        if (null == _selectedAssetCode || null == _selectedIssuerAddress) {
            return;
        }
        if (AssetRepository.AddCustomAsset(_selectedAssetCode, _selectedIssuerAddress)) {
            renderCustomAssets();
            highlightCustomItem(_selectedAssetCode + "-" + _selectedIssuerAddress);
        }
    };

    const highlightCustomItem = function(itemId) {
        $("#"+itemId).addClass("highlight");
    };
}


/********************************************* DEBUG *********************************************/
const dumpCookie = function(){
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