
/************* Template for an executed trade (_embedded.records) from https://horizon.stellar.org/trades *************/
var tradeRow = function(record) {
    var sellAccount = record.base_account;
    var sellPrice = record.price.n / record.price.d;
    var toolTipText = "seller:" + sellAccount.substring(0, 6) + "..." + sellAccount.substring(50) + " " +
                      "&#13;&#10;buyer:" + record.counter_account.substring(0, 6) + "..." + record.counter_account.substring(50);
    var templateText = "<tr title='" + toolTipText + "'>" +
                            "<td>" + new Date(record.ledger_close_time).toLocaleTimeString() + "</td>" +
                            "<td class='" + (record.base_is_seller ? "buy" : "sell") + "'>" + formatPrice(sellPrice) + "</td>" +
                            "<td>" + formatAmount(record.base_amount) + "</td></tr>";

    return templateText;
};

var noTradesRow = function() {
    return "<tr><td></td><td></td></tr><tr><td colspan='2'>No trades in this market</td></tr>";
};

var getErrorRow = function(xhr, textStatus, error) {
    return "<tr><td></td></tr> <tr><td class='error' colspan='2'>" + textStatus + " - " +
           xhr.statusText + " (" + xhr.status + ")<br/>" + xhr.responseText +
           "</td></tr>";
};
/**********************************************************************************************************************/

var currentPriceSpan = function(record) {
    var sellPrice = record.price.n / record.price.d;
    return "<span class='" + (record.base_is_seller ? "buy" : "sell") + "'>" + formatPrice(sellPrice) + "</span>";
};

var noPriceDataSpan = function() {
    return "<span>(No trades)</span>";
};

var currentPriceTitle = function(baseAssetCode, counterAssetCode, record) {
    var sellPrice = record.price.n / record.price.d;
    return baseAssetCode + "/" + counterAssetCode + " - " + formatPrice(sellPrice);
};

/**************** Template for an item from the order-book from https://horizon.stellar.org/order_book ****************/
var askOfferRow = function(offer) {
    return "<tr"+(Math.random() > 0.5 ? " class='linked' title='linked thru XLM'" : "")+"><td>" + formatPrice(offer.price) + "</td><td>" + formatAmount(offer.amount) + "</td></tr>";
};

var bidOfferRow = function(offer) {
    var amount = parseFloat(offer.amount) / parseFloat(offer.price);
    return "<tr><td>" + formatPrice(offer.price) + "</td><td>" + formatAmount(amount) + "</td></tr>";
};

/**********************************************************************************************************************/

var getAssetCode = function(record, prefix) {       //TODO: to one file with the Asset class
    var assetType = record[prefix + "_asset_type"];
    if (Constants.NATIVE_ASSET_TYPE === assetType) {
        return Constants.NATIVE_ASSET_CODE;
    }

    return record[prefix + "_asset_code"];
};

//TODO: find this a proper place
var formatAmount = function(amount) {
    return formatNumber(amount, Constants.DEFAULT_AMOUNT_DECIMALS);          //TODO: format number by current DecimalPrecision as set by the user
};

var formatPrice = function(price) {
    return formatNumber(price, Constants.DEFAULT_PRICE_DECIMALS);          //TODO: format number by current DecimalPrecision as set by the user
};

var formatNumber = function(value, decimals) {
    value = parseFloat(value.toString());     //Ensure number
    var numString = value.toFixed(decimals);
    return trimZeros(numString);
};

/* Trim trailing zeros from decimal portion */
var trimZeros = function(str) {
    if (!str.indexOf('.') <= -1) {
        return str;
    }
    return str.replace(/\.0{1,99}$/, '');
};

