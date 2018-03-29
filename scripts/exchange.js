
var getPastTrades = function(baseAsset, counterAsset) {
    var url = Constants.API_URL + "/trades?" + baseAsset.ToUrlParameters("base") + "&" + counterAsset.ToUrlParameters("counter") + "&order=desc&limit=40";

    $.getJSON(url, function(data) {
        $("#tradeHistoryData").empty();
        //TODO; check nulls
        $("#currentPrice").html(currentPriceSpan(data._embedded.records[0]));

        $.each(data._embedded.records, function(i, record) {
            $(tradeRow(record)).appendTo("#tradeHistoryData");
        });
    })
    .fail(function(xhr, textStatus, error) {
        $("#tradeHistoryData").empty();
        $(getErrorRow(xhr, textStatus, error)).appendTo("#tradeHistoryData");
    });
};

var streamPastTrades = function(baseAsset, counterAsset) {
    getPastTrades(baseAsset, counterAsset);
    setTimeout(function() {
        streamPastTrades(baseAsset, counterAsset);
    }, Constants.PAST_TRADES_INTERVAL);
};

var getOrderBook = function(baseAsset, counterAsset) {
    var url = Constants.API_URL + "/order_book?" + baseAsset.ToUrlParameters("selling") + "&" + counterAsset.ToUrlParameters("buying") + "&limit=17";

    $.getJSON(url, function(data) {
        data = addAutobridgedOffers(data);

        $("#orderBookBids").empty();
        $.each(data.bids, function(i, bid) {
            $(offerRow(bid)).appendTo("#orderBookBids");
        });

        $("#orderBookAsks").empty();
        $.each(data.asks, function(i, ask) {
            $(offerRow(ask)).appendTo("#orderBookAsks");
        });
    })
    .fail(function(xhr, textStatus, error) {
        $("#orderBookBids").empty();
        $(getErrorRow(xhr, textStatus, error)).appendTo("#orderBookBids");
    });
};

var streamOrderBook = function(baseAsset, counterAsset) {
    getOrderBook(baseAsset, counterAsset);
    setTimeout(function() {
        streamOrderBook(baseAsset, counterAsset);
    }, Constants.ORDERBOOK_INTERVAL);
};

var addAutobridgedOffers = function(orderBook) {
    //TODO: check if one of the assets is XLM. If not, add auto-bridged offers through XLM
    return orderBook;
};

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
    streamPastTrades(nativeAsset, assetMobi);
    streamOrderBook(nativeAsset, assetMobi);
});
