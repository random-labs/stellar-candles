let myExchangesUi = null;

$(function() {
    myExchangesUi = new MyExchanges();
});


/**
 * UI model to the page "My Exchanges"
 * @constructor
 */
function MyExchanges() {



    //Load current list of user's custom exchanges
    const exchanges = AssetRepository.getCustomExchanges();
    if (0 === exchanges.length) {
        //TODO: if the cookie was empty (e.g. new user/browser), initialize one chart that's the same as the first one on Overview.html
    }
    for (let i=0; i<exchanges.length; i++) {
        const vain = new CustomExchange(exchanges[i]);
    }



    var debug = new CustomExchange(new ExchangePair(536624, KnownAssets.XLM, KnownAssets.XCN));


    $("#addExchangeButton").click(function (){
        const newExchange = AssetRepository.CreateCustomExchange();
        var vain = new CustomExchange(newExchange);
    });
    
}


/**
 * UI model for the small custom charts on the My Exchange page
 * @constructor
 * @param {ExchangePair} exchangePair custom exchange pair of the user
 */
function CustomExchange(exchangePair) {
    const _id = exchangePair.getId();
    const _baseAsset = exchangePair.getBaseAsset();
    const _counterAsset = exchangePair.getCounterAsset();

    /** @private Create new DIV with proper Bootstrap classes and add it to the DOM. */
    const setupContainer = function() {
        const divMarkup = customExchangeContainer(_id);
        //Add at the end before the [add] button
        $(divMarkup).insertBefore("#addCustomExchange");
    };

    const setupAssetCodesDropDown = function(dropDownSelector, selectedAssetCode) {
        const assetList = new Array();
        AssetRepository.getAssetCodesForExchange().forEach(function(assetCode) {
            assetList.push({
                text: assetCode,
                value: assetCode,
                selected: assetCode === selectedAssetCode
            });
        });

        $(dropDownSelector).ddslick({
            data: assetList,
            width: 100,
            onSelected: function (data) {
                changeAssets(false);    //TODO
            }
        });
    };

    const setupAnchorDropDown = function(dropDownSelector, assetCode, assetIssuer) {
        const issuersArray = AssetRepository.GetIssuersByAssetCode(assetCode);
        const issuerAccount = AssetRepository.GetIssuerByAddress(assetIssuer.Address);
        const assetIssuersDdData = new Array();
        for (let i=0; i<issuersArray.length; i++) {
            assetIssuersDdData.push({
                text: issuersArray[i].ShortName,
                description: issuersArray[i].Domain,
                value: issuersArray[i].Address,
                selected: null != issuerAccount && issuersArray[i].Address === issuerAccount.Address
            });
        }

        $(dropDownSelector).ddslick({
            data: assetIssuersDdData,
            width: "calc(50% - 100px)",
            onSelected: function (data) {
                changeAssets(true);     //TODO
            }
        });
    };

    const setupChart = function() {
        const customExchange1Ui = new ExchangeThumbnail(_baseAsset, _counterAsset);
        customExchange1Ui.Initialize("customExchangeChart" + _id);

        $("#customExchange" + _id + " .assetsSelection").click(function(ev){ ev.preventDefault(); return false;});
        $("#customExchange" + _id + " .exchange-link").on("mouseover", function(){
            $(this).find("div.removeExchButton").show();
        }).on("mouseout", function() {
            $(this).find("div.removeExchButton").hide();
        });
        $("#customExchange" + _id + " .removeExchButton").click(function() {
            removeChart();
        });
    };

    /** @private Delete this chart from the UI and the data store. */
    const removeChart = function() {
        if (AssetRepository.RemoveCustomExchange(_id)) {
            $("#customExchange" + _id).remove();
        }
    };

    setupContainer();
    setupAssetCodesDropDown("#customExchange" + _id + " .baseAssetCodeDropDown", _baseAsset.AssetCode);
    setupAnchorDropDown("#customExchange" + _id + " .baseAssetAnchorDropDown", _baseAsset.AssetCode, _baseAsset.Issuer);
    setupAssetCodesDropDown("#customExchange" + _id + " .counterAssetCodeDropDown", _counterAsset.AssetCode);
    setupAnchorDropDown("#customExchange" + _id + " .counterAssetAnchorDropDown", _counterAsset.AssetCode, _counterAsset.Issuer);
    setupChart();
}


