$(function() {
    //Highlight the right link in the header
    $("sc-include").ready(function() { $("a#myExchangesLink").addClass("selected"); });

    //Load and display current list of user's custom exchanges
    const exchanges = AssetRepository.getCustomExchanges();
    if (0 === exchanges.length) {
        //TODO: if the cookie was empty (e.g. new user/browser), initialize one chart that's the same as the first one on Overview.html
    }
    for (let i=0; i<exchanges.length; i++) {
        const vain = new CustomExchange(exchanges[i]);
    }

    $("#addExchangeButton").click(function (){
        const newExchange = AssetRepository.CreateCustomExchange();
        CustomExchange(newExchange);
    });
});



/**
 * UI model for the small custom charts on the My Exchange page
 * @constructor
 * @param {ExchangePair} exchangePair custom exchange pair of the user
 */
function CustomExchange(exchangePair) {
    const _id = exchangePair.getId();
    let _baseAsset = exchangePair.getBaseAsset();
    let _counterAsset = exchangePair.getCounterAsset();
    const _baseAssetCodeDropDownId = "baseAssetCodeDropDown" + _id;
    const _baseAnchorDropDownId = "baseAssetAnchorDropDown" + _id;
    const _counterAssetCodeDropDownId = "counterAssetCodeDropDown" + _id;
    const _counterAnchorDropDownId = "counterAssetAnchorDropDown" + _id;


    /** @private Create new DIV with proper Bootstrap classes and event handlers and add it to the DOM. */
    const setupContainer = function() {
        const divMarkup = customExchangeContainer(_id);
        //Add at the end before the [add] button
        $(divMarkup).insertBefore("#addCustomExchange");

        $("#customExchange" + _id + " .assetsSelection").click(function(ev){ ev.preventDefault(); return false;});
        $("#customExchange" + _id + " .exchange-link").on("mouseover", function(){
            $(this).find("div.removeExchButton").show();
        }).on("mouseout", function() {
            $(this).find("div.removeExchButton").hide();
        });
        $("#customExchange" + _id + " .removeExchButton").click(function() {
            removeExchange();
        });
    };

    const setupAssetCodesDropDown = function(dropDownId, anchorDropDownId, selectedAssetCode) {
        const assetList = new Array();
        AssetRepository.getAssetCodesForExchange().forEach(function(assetCode) {
            assetList.push({
                text: assetCode,
                value: assetCode,
                selected: assetCode === selectedAssetCode
            });
        });

        $("#" + dropDownId).ddslick({
            data: assetList,
            width: 100,
            onSelected: function (data) {
                setupAnchorDropDown(anchorDropDownId, data.selectedData.value, null);
            }
        });
    };

    const setupAnchorDropDown = function(dropDownId, assetCode, assetIssuer) {
        //In case this is re-init after asset code change, destroy previous instance
        $('div[id^="' + dropDownId + '"]').ddslick('destroy');

        const issuersArray = AssetRepository.GetIssuersByAssetCode(assetCode);
        const issuerAccount = assetIssuer != null ? AssetRepository.GetIssuerByAddress(assetIssuer.Address) : null;
        const assetIssuersDdData = new Array();
        for (let i=0; i<issuersArray.length; i++) {
            assetIssuersDdData.push({
                text: issuersArray[i].ShortName,
                description: issuersArray[i].Domain,
                value: issuersArray[i].Address,
                selected: null != issuerAccount && issuersArray[i].Address === issuerAccount.Address
            });
        }

        $("#" + dropDownId).ddslick({
            data: assetIssuersDdData,
            width: "calc(50% - 100px)",
            onSelected: function (data) {
                updateExchange();
            }
        });

        if (null == issuerAccount) {
            $('div[id^="' + dropDownId + '"]').ddslick('select', {index: 0 });
        }
    };

    const setupChart = function() {
        const customExchange1Ui = new ExchangeThumbnail(_baseAsset, _counterAsset);
        customExchange1Ui.Initialize("customExchangeChart" + _id);
    };

    const updateExchange = function() {
        const baseAssetCodeData = $('div[id^="' + _baseAssetCodeDropDownId + '"]').data("ddslick");
        const baseIssuerData = $('div[id^="' + _baseAnchorDropDownId + '"]').data("ddslick");
        const counterAssetCodeData = $('div[id^="' + _counterAssetCodeDropDownId + '"]').data("ddslick");
        const counterIssuerData = $('div[id^="' + _counterAnchorDropDownId + '"]').data("ddslick");

        if (!counterAssetCodeData || !counterIssuerData) {
            //Happens when change is fired during drop-downs setup
            return;
        }
        const exchange = AssetRepository.UpdateCustomExchange(_id,
                                                              baseAssetCodeData.selectedData.value, baseIssuerData.selectedData.value,
                                                              counterAssetCodeData.selectedData.value, counterIssuerData.selectedData.value);
        _baseAsset = exchange.getBaseAsset();
        _counterAsset = exchange.getCounterAsset();
        setupChart();
    };

    /** @private Delete this exchange from the UI and the data store. */
    const removeExchange = function() {
        if (AssetRepository.RemoveCustomExchange(_id)) {
            $("#customExchange" + _id).remove();
        }
    };

    //Initial setup
    setupContainer();
    setupAssetCodesDropDown(_baseAssetCodeDropDownId, _baseAnchorDropDownId, _baseAsset.AssetCode);
    setupAnchorDropDown(_baseAnchorDropDownId, _baseAsset.AssetCode, _baseAsset.Issuer);
    setupAssetCodesDropDown(_counterAssetCodeDropDownId, _counterAnchorDropDownId, _counterAsset.AssetCode);
    setupAnchorDropDown(_counterAnchorDropDownId, _counterAsset.AssetCode, _counterAsset.Issuer);
    setupChart();
}
