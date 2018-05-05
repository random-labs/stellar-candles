
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
    return "<tr><td colspan='3'></td></tr><tr><td colspan='3'>No trades in this market</td></tr>";
};

var getErrorRow = function(xhr, textStatus, error) {
    return "<tr><td></td></tr> <tr><td class='error' colspan='3'>" + textStatus + " - " +
           xhr.statusText + " (" + xhr.status + ")<br/>" + xhr.responseText +
           "</td></tr>";
};
/**********************************************************************************************************************/

var currentPriceSpan = function(record) {
    var sellPrice = record.price.n / record.price.d;
    var priceString = formatPrice(sellPrice);
    return "<span class='" + (record.base_is_seller ? "buy" : "sell") + "' title='Last price: " + priceString + " " + record.counter_asset_code + "'>" + priceString + "</span>";
};

var noPriceDataSpan = function() {
    return "<span>--</span>";
};

var currentPriceTitle = function(baseAssetCode, counterAssetCode, record) {
    var sellPrice = record.price.n / record.price.d;
    return baseAssetCode + "/" + counterAssetCode + " - " + formatPrice(sellPrice);
};

/**************** Template for an item from the order-book from https://horizon.stellar.org/order_book ****************/
var askOfferRow = function(offer, cumulativeAmount) {
    return "<tr data-cumulative-amount='" + cumulativeAmount + "'"+(Math.random() > 0.5 ? " class='linked' title='linked thru XLM'" : "")+"><td>" + formatPrice(offer.price) + "</td><td>" + formatAmount(offer.amount) + "</td></tr>";
};

var bidOfferRow = function(offer, amount, cumulativeAmount) {
    return "<tr data-cumulative-amount='" + cumulativeAmount + "'><td>" + formatPrice(offer.price) + "</td><td>" + formatAmount(amount) + "</td></tr>";
};

/**********************************************************************************************************************/


//TODO: find this a proper place
var formatAmount = function(amount) {
    var decimals = Utils.GetPrecisionDecimals(amount);
    return formatNumber(amount, decimals /* Constants.DEFAULT_AMOUNT_DECIMALS*/);          //TODO: format number by current DecimalPrecision as set by the user
};

var formatPrice = function(price) {
    var decimals = Utils.GetPrecisionDecimals(price);
    return formatNumber(price, decimals /*Constants.DEFAULT_PRICE_DECIMALS*/);          //TODO: format number by current DecimalPrecision as set by the user
};

var formatNumber = function(value, decimals) {
    value = parseFloat(value.toString());     //Ensure number
    var numString = decimals ? value.toFixed(decimals) : value.toString();
    return trimZeros(numString);
};

/* Trim trailing zeros from decimal portion */
var trimZeros = function(str) {
    if (!str.indexOf('.') <= -1) {
        return str;
    }
    str = str.replace(/0{1,99}$/, '');  //Trim trailing zeros
    return str.replace(/\.$/, '');      //Replace possible trailing dot (if the number was whole)
};

