var Constants = {
    API_URL: "https://horizon.stellar.org",
    CONFIGURATION_URL: "configuration.html",
    ORDERBOOK_INTERVAL: 7000,
    PAST_TRADES_INTERVAL: 8000,
    CHART_INTERVAL: 15 * 60 * 1000,
    NATIVE_ASSET_CODE: "XLM",
    NATIVE_ASSET_TYPE: "native",
    DEFAULT_AMOUNT_DECIMALS: 4,
    DEFAULT_PRICE_DECIMALS: 4,
    DefaultAssetCodes: ["XLM", "BCH", "BTC", "CNY", "ETH", "EURT", "KIN", "LTC", "MOBI", "PHP", "REP", "REPO", "RMT", "SLT", "TARI", "XIM", "XRP", "XYZ"]
};

var Utils = {
    /**
     * Get precision as number of decimal digits based on given amount or price
     * @param {number} value - amount or price to base the precision on
     * @returns {number}
     */
    GetPrecisionDecimals: function(value) {
        var decimals = 3;
        while (value < 1.0) {
            value *= 10;
            decimals++;
        }
        return decimals;
    }
}