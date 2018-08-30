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



    var debug = new CustomExchange(1, KnownAssets["BTC-Papaya"], KnownAssets.XCN);


    
}


/**
 * UI model for the small custom charts on the My Exchange page
 * @constructor
 * @param {number} id index of this custom exchange
 * @param {Asset} baseAsset base asset definition
 * @param {Asset} counterAsset counter asset definition
 */
function CustomExchange(id, baseAsset, counterAsset) {
    const _index = id;
    const _baseAsset = baseAsset;
    const _counterAsset = counterAsset;


    
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



    setupAssetCodesDropDown("#customExchange" + _index + " .baseAssetCodeDropDown", _baseAsset.AssetCode);
    setupAnchorDropDown("#customExchange" + _index + " .baseAssetAnchorDropDown", _baseAsset.AssetCode, _baseAsset.Issuer);

    setupAssetCodesDropDown("#customExchange" + _index + " .counterAssetCodeDropDown", _counterAsset.AssetCode);
    setupAnchorDropDown("#customExchange" + _index + " .counterAssetAnchorDropDown", _counterAsset.AssetCode, _counterAsset.Issuer);
}