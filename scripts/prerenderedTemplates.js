
/************* Template for an executed trade (_embedded.records) from https://horizon.stellar.org/trades *************/
var tradeRow = function(record) {
    var sellAccount = record.base_account;
    var sellPrice = record.price.n / record.price.d;
    var toolTipText = sellAccount.substring(0, 8) + "..." + sellAccount.substring(51) +
                      " sold " + formatAmount(record.base_amount) + " " + getAssetCode(record, "base");
    var templateText = "<tr title='" + toolTipText + "'>" +
                            "<td>" + new Date(record.ledger_close_time).toLocaleTimeString() + "</td>" +
                            "<td class='" + (record.base_is_seller ? "sell" : "buy") + "'>" + formatPrice(sellPrice) + "</td>" +
                            "<td>" + formatAmount(record.base_amount) + "</td></tr>";

    return templateText;
};

var getAssetCode = function(record, prefix) {       //TODO: to one file with the Asset class
    var assetType = record[prefix + "_asset_type"];
    if (Constants.NATIVE_ASSET_TYPE === assetType) {
        return Constants.NATIVE_ASSET_CODE;
    }

    return record[prefix + "_asset_code"];
}
/**********************************************************************************************************************/

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

var trimZeros = function(str) {
    return str.replace(/[0\.]*$/, '');
};

