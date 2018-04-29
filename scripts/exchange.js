/**
 * UI model to the Exchange page
 */
function Exchange() {
    this.BaseAsset = null;
    this.CounterAsset = null;

    var candlestickChart = new CandlestickChart();
    var baseAssetDdId;
    var baseAnchorDdId;
    var counterAssetDdId;
    var counterAnchorDdId;


    this.Initialize = function(baseAssetDropDownId, baseIssuerDropDownId, counterAssetDropDownId, counterIssuerDropDownId) {
        baseAssetDdId = baseAssetDropDownId;
        baseAnchorDdId = baseIssuerDropDownId;
        counterAssetDdId = counterAssetDropDownId;
        counterAnchorDdId = counterIssuerDropDownId;

        parseAssetsFromUrl();
        setupAssetCodesDropDown("#" + baseAssetDdId);
        setupAnchorDropDown("#" + baseAnchorDdId, "XLM");
        setupAssetCodesDropDown("#" + counterAssetDdId);
        setupAnchorDropDown("#" + counterAnchorDdId, "BTC");
        //TODO: load candle chart first
        initPastTradesStream(KnownAssets.XLM, KnownAssets.MOBI);
        initOrderBookStream(KnownAssets.XLM, KnownAssets.MOBI);
    };

    this.SwapAssets = function() {
        alert('todo');
    };

    /*
     * Parse assets from URL and load data lists and the candlestick chart
     */
    var parseAssetsFromUrl = function() {
        var urlPart = window.location.href;
        var index = urlPart.indexOf("#");
        if (-1 === index) {
            throw new Error("Invalid URL parameters");
        }

        urlPart = urlPart.substring(index+1);
        index = urlPart.indexOf("/");
        if (-1 === index) {
            throw new Error("Invalid URL parameters: " + urlPart);
        }

        var baseAssetPart = urlPart.substring(0, index);
        this.BaseAsset = Asset.ParseFromUrlParam(baseAssetPart);
        var counterAssetPart = urlPart.substring(index + 1);
        this.CounterAsset = Asset.ParseFromUrlParam(counterAssetPart);
    };


    this.RenderCandlestickChart = function(baseAsset, counterAsset) {               //TODO: private function
        const dataRange = "&resolution=900000&limit=96";
        var url = Constants.API_URL + "/trade_aggregations?" + baseAsset.ToUrlParameters("base") + "&" + counterAsset.ToUrlParameters("counter") + "&order=desc" + dataRange;

        $.getJSON(url, function(data) {
            $("#marketChart").empty();
            var chartConfig = candlestickChart.GetDefaultChartConfig();
            var minPrice = Number.MAX_VALUE;
            var maxPrice = -1.0;
            var maxVolume = -1.0;

            $.each(data._embedded.records, function(i, record) {
                //Collect data for a single candle in the candlestick chart
                var open = parseFloat(record.open);
                var high = parseFloat(record.high);
                if (high > maxPrice) {
                    maxPrice = high;
                }
                var low = parseFloat(record.low);
                if (low < minPrice) {
                    minPrice = low;
                }
                var close = parseFloat(record.close);
                var candle = [record.timestamp, [open.toFixed(4/*TODO: dynamic*/), high.toFixed(4/*TODO: dynamic*/), low.toFixed(4/*TODO: dynamic*/), close.toFixed(4/*TODO: dynamic*/)]];
                chartConfig.series[0].values.push(candle);             //TODO: setter (i.e. chartConfig.AddCandle(candle);)

                //Collect data for bar chart with volume
                var volume = parseFloat(record.base_volume);
                if (volume > maxVolume) {
                    maxVolume = volume;
                }
                var volumeBar = [record.timestamp, volume];
                chartConfig.series[1].values.push(volumeBar);          //TODO: proper wrapper

                chartConfig["scale-x"]["min-value"] = record.timestamp;     //TODO: chartConfig.setStartTime(record.timestamp);
            });

            chartConfig["scale-x"].step = "15minute";
            chartConfig.series[1]["guide-label"].decimals = 2;  //TODO: chartConfig.setVolumeDecimals(__var__);

            //Set price chart range (TODO: candlestickChart.SetHorizontalScale(minPrice, maxPrice); )
            minPrice = 0.95 * minPrice;
            maxPrice = 1.05 * maxPrice;
            var step = (maxPrice - minPrice) / 7.0;
            chartConfig["scale-y"].values = "" + minPrice.toFixed(2/*Nope!!*/) + ":" + maxPrice.toFixed(2) + ":" + step.toFixed(2/*FUJ!!*/);

            //Set volume chart range (TODO: you know...)
            step = maxVolume / 3.0;
            chartConfig["scale-y-2"].values = "0:" + maxVolume.toFixed(2) + ":" + step.toFixed(2);

            zingchart.render({
                id : 'marketChart',
                data : chartConfig,
                height: "100%",
                width: "100%"
            });
        })
        .fail(function(xhr, textStatus, error) {
            candlestickChart.ShowError(xhr, textStatus);
        });
    };

    var initPastTradesStream = function(baseAsset, counterAsset) {
        getPastTrades(baseAsset, counterAsset);
        setTimeout(function() {
            initPastTradesStream(baseAsset, counterAsset);
        }, Constants.PAST_TRADES_INTERVAL);
    };

    var initOrderBookStream = function(baseAsset, counterAsset) {
        getOrderBook(baseAsset, counterAsset);
        setTimeout(function() {
            initOrderBookStream(baseAsset, counterAsset);
        }, Constants.ORDERBOOK_INTERVAL);
    };

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

    var getOrderBook = function(baseAsset, counterAsset) {
        var url = Constants.API_URL + "/order_book?" + baseAsset.ToUrlParameters("selling") + "&" + counterAsset.ToUrlParameters("buying") + "&limit=17";

        $.getJSON(url, function(data) {
            data = addAutobridgedOffers(data);

            $("#orderBookBids").empty();
            $.each(data.bids, function(i, bid) {
                $(bidOfferRow(bid)).appendTo("#orderBookBids");
            });

            $("#orderBookAsks").empty();
            $.each(data.asks, function(i, ask) {
                $(askOfferRow(ask)).prependTo("#orderBookAsks");
            });
        })
        .fail(function(xhr, textStatus, error) {
            $("#orderBookBids").empty();
            $(getErrorRow(xhr, textStatus, error)).appendTo("#orderBookBids");
        });
    };

    var addAutobridgedOffers = function(orderBook) {
        //TODO: check if one of the assets is XLM. If not, add auto-bridged offers through XLM
        return orderBook;
    };

    var setupAssetCodesDropDown = function(dropDownSelector) {
        var assetList = new Array();
        Constants.DefaultAssetCodes.forEach(function(assetCode){
            //Search for asset full name among know assets
            var assetFullName = " ";
            var assetImage = "unknown.png";
            for (var asset in KnownAssets) {
                if (KnownAssets[asset].AssetCode === assetCode) {
                    assetFullName = KnownAssets[asset].FullName;
                    assetImage = assetCode + ".png";
                    break;
                }
            }

            assetList.push({
                text: assetCode,
                value: assetCode,
                description: assetFullName,
                imageSrc: "./images/assets/" + assetImage
            });
        });

        assetList.push({
            text: "[+] Add",
            value: "ADD_CUSTOM",
            description: "Add asset manually"
        });

        $(dropDownSelector).ddslick({
            data: assetList,
            width: 150,
            onSelected: function (data) {
                //TODO: I need to think about how to select current asset after initial page load and not trigger this
                if ("ADD_CUSTOM"  === data.selectedData.value) {
                    alert("todo: configuration page");
                }
                else {
                    changeAssets();
                }
            }
        });
    };

    var setupAnchorDropDown = function(dropDownSelector, assetCode) {
        var issuersArray = KnownAssets.GetIssuersByAsset(assetCode);
        var assetIssuersDdData = new Array();
        for (var i=0; i<issuersArray.length; i++) {
            assetIssuersDdData.push({
                text: issuersArray[i].ShortName,
                description: issuersArray[i].Domain,
                value: issuersArray[i].Address
            });
        }

        assetIssuersDdData.push({
            text: "[+] Manage",
            value: "ADD_CUSTOM",
            description: "Add anchor manually"
        });

        $(dropDownSelector).ddslick({
            data: assetIssuersDdData,
            width: 250,
            onSelected: function (data) {
                //TODO: I need to think about how to select current asset after initial page load and not trigger this
                if ("ADD_CUSTOM"  === data.selectedData.value) {
                    alert("todo: configuration page");
                }
                else {
                    changeAssets();
                }
            }
        });
    };
}


var changeAssets = function() {
    var urlAssets = $('div[id^="baseAssetCodeDropDown"]').data('ddslick').selectedData.value;
    var baseIssuer = $('div[id^="baseAssetAnchorDropDown"]').data('ddslick').selectedData.value;
    if (baseIssuer != null) {
        urlAssets += "-" + baseIssuer;
    }
    urlAssets += "/" + $('div[id^="counterAssetCodeDropDown"]').data('ddslick').selectedData.value;
    var counterIssuer = $('div[id^="counterAssetAnchorDropDown"]').data('ddslick').selectedData.value;
    if (counterIssuer != null) {
        urlAssets += "-" + counterIssuer;
    }
    window.location = "exchange.html#" + urlAssets;
};
