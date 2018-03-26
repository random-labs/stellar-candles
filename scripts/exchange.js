
var getPastTrades = function(baseAsset, counterAsset) {
    var url = Constants.API_URL + "/trades?" + baseAsset.ToUrlParameters("base") + "&" + counterAsset.ToUrlParameters("counter") + "&order=desc&limit=40";

    $.getJSON(url, function(data) {
        $("#tradeHistoryData").empty();
        //TODO; check nulls
        $.each(data._embedded.records, function( i, record ) {
            $(tradeRow(record))
                .appendTo("#tradeHistoryData");
        });
    })
    .fail(function() {
        alert( "error" );
    });
}

function Asset(code, type, issuerAddress, issuerName) {
    this.AssetCode = code || "XLM";
    this.AssetType = type;
    this.Issuer = issuerAddress;
    this.IssuerName = issuerName;

    this.ToUrlParameters = function(prefix) {
        var getParams = prefix + "_asset_code=" + this.AssetCode + "&" + prefix + "_asset_type=" + this.AssetType;
        if (this.Issuer) {
            getParams += "&" + prefix + "_asset_issuer=" + this.Issuer;
        }

        return getParams;
    }
}

var nativeAsset = new Asset("XLM", "native", null, null);
var assetMobi = new Asset("MOBI", "credit_alphanum4", "GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH", "Mobius.network");


$(function() {
    //TODO: load candle chart first
    getPastTrades(nativeAsset, assetMobi);
});
