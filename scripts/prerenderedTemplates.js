
/************* Template for an executed trade (_embedded.records) from https://horizon.stellar.org/trades *************/
var tradeRow = function(record) {
    var sellAccount = record.base_account;
    var sellPrice = record.price.n / record.price.d;
    var toolTipText = "seller:" + sellAccount.substring(0, 8) + "..." + sellAccount.substring(48) + " " +
                      "&#13;&#10;buyer:" + record.counter_account.substring(0, 8) + "..." + record.counter_account.substring(48);
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


/*********************** Template for an item on the Configuration page, section Custom Anchors ***********************/
var customAnchorItem = function(issuerDomain, issuerAddress) {
    return "<div id='" + issuerAddress + "' class='customItemRow'><div class='itemTitle'>" +
           issuerDomain + " - " + issuerAddress + " </div>" +
           "<span onclick='configurationUi.RemoveCustomAnchor(\"" + issuerAddress + "\");'>remove</span></div>";
};
var noAnchorsMessage = function() {
    return "<i>No custom issuers yet. Use the form below to add some.</i>";
};

var customAssetCodeItem = function(assetCode) {
    return "<div id='" + assetCode + "' class='customItemRow'><div class='itemTitle'>" + assetCode + " </div>" +
           "<span onclick='configurationUi.RemoveAssetCode(\"" + assetCode + "\");'>remove</span></div>";
};
var noAssetTypesMessage = function() {
    return "<i>No asset types yet. Use the form below to add some.</i>";
};

var customAssetItem = function(assetCode, issuerDomain, issuerAddress) {
    return "<div id='" + assetCode + "-" + issuerAddress + "' class='customItemRow'>" +
           "<div class='itemTitle'>" + assetCode + "-" + issuerDomain + " (" + issuerAddress + ")</div>" +
           "<span onclick='configurationUi.RemoveAsset(\"" + assetCode + "\", \"" + issuerAddress + "\");'>remove</span></div>";
};

var noAssetMessage = function() {
    return "<i>No custom assets yet. Use the form below to add some.</i>";
};
/**********************************************************************************************************************/

/********************************** Template for a custom exchange (myExchages.html) **********************************/

var customExchangeContainer = function(id) {
    return  '<div id="customExchange' + id + '" class="col-xl-3 col-lg-4 col-md-6 col-sm-12">' +
            '    <div class="exchange-link">' +
            '        <div class="assetsSelection">' +
            '            <div class="removeExchButton">X</div>' +
            '            <div class="assetDropDowns">' +
            '                <div id="baseAssetCodeDropDown' + id + '" style="width: 100px;">Asset code drop-down here</div>' +
            '                <div id="baseAssetAnchorDropDown' + id + '">Anchor drop-down here</div>' +
            '                <div id="counterAssetCodeDropDown' + id + '" style="width: 100px;">Asset code drop-down here</div>' +
            '                <div id="counterAssetAnchorDropDown' + id + '">Anchor drop-down here</div>' +
            '            </div>' +
            '        </div>' +
            '        <div class="assetsDescription">' +
            '            <div class="lastPrice">0.00</div>' +
            '            <div class="baseAssetDesc"> </div>' +
            '            <div class="counterAssetDesc"> </div>' +
            '            <div class="dailyChangePercent green">+0.00%</div>' +
            '        </div>' +
            '        <div id="customExchangeChart' + id + '" class="exchange-link-chart">' +
            '            <div class="chartWarning">Loading data...</div>' +
            '        </div>' +
            '    </div>' +
            '</div>';
}
/**********************************************************************************************************************/