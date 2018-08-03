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
    DefaultAssetCodes: ["XLM", "BCH", "BTC", "CNY", "ETH", "EURT", "KIN", "LTC", "MOBI", "PHP", "REP", "REPO", "RMT", "SLT", "TARI", "XCN", "XRP", "XYZ"]
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
    },

    /**
     * Get value of given URL parameter (a.k.a. GET parameter)
     * @param paramName - parameter name, case sensitive
     */
    GetUrlParameter: function(paramName) {
        var paramValue = (window.location.search.split(paramName + '=')[1]||'').split('&')[0];
        return paramValue;
    },
    /**
     * Assigns GET parameter in current URL and navigates.
     * @param paramName - parameter name to be used in URL
     * @param value - parameter value
     */
    SetUrlParameter: function(paramName, value) {
        var currentUri = window.location.href;          //TODO: time to handle dependencies with proper DI
        var paramStartIndex = currentUri.indexOf(paramName);

        //Already there, we need to change the value
        if (paramStartIndex > -1) {
            var newUri = currentUri.substring(0, paramStartIndex);                  //The part before
            newUri += paramName + "=" + value;
            var paramEndIndex = currentUri.substring(paramStartIndex).indexOf("&");
            if (paramEndIndex > -1) {
                newUri += currentUri.substring(paramStartIndex + paramEndIndex);    //The part after
            }

            window.location = newUri;
        }
        else {
            var newUri = currentUri + (currentUri.indexOf("?") > -1 ? "&" : "?");
            newUri += paramName + "=" + value;
            window.location = newUri;
        }
    },

    IntervalAsMilliseconds: function(intervalDesc) {
        if ("15min" === intervalDesc || "15m" === intervalDesc) {
            return 900000;
        }
        if ("hour" === intervalDesc || "1hour" === intervalDesc || "60min" === intervalDesc || "60m" === intervalDesc) {
            return 3600000;
        }
        if ("day" === intervalDesc || "1day" === intervalDesc || "1d" === intervalDesc || intervalDesc.indexOf("24h") === 0) {
            return 86400000;
        }
        if ("week" == intervalDesc || "1week" === intervalDesc || "1w" === intervalDesc || intervalDesc.indexOf("7d") === 0) {
            return 604800000;
        }

        //Make it fail in a distinct way
        return -5050505;
    }
}

var GETParams = {
    INTERVAL: "interval"
}