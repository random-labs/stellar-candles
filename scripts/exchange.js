/**
 * UI model to the Exchange page
 */
function Exchange(baseAssetDropDownId, baseIssuerDropDownId, counterAssetDropDownId, counterIssuerDropDownId) {
    this.BaseAsset = null;
    this.CounterAsset = null;
    this.ChartInterval = 900000;    //15min candles by default

    var _this = this;
    var candlestickChart = new CandlestickChart();
    var baseAssetDdId = baseAssetDropDownId;
    var baseAnchorDdId = baseIssuerDropDownId;
    var counterAssetDdId = counterAssetDropDownId;
    var counterAnchorDdId = counterIssuerDropDownId;

    //If user changes the URL parameters manually, re-initialize
    $(window).bind('hashchange', function() {
        _this.Initialize();
    });

    this.Initialize = function() {
        parseAssetsFromUrl();
        $(".baseAssetCode").html(_this.BaseAsset.AssetCode);
        setupAssetCodesDropDown(baseAssetDdId, this.BaseAsset.AssetCode);
        setupAnchorDropDown(baseAnchorDdId, this.BaseAsset.AssetCode, this.BaseAsset.Issuer);
        setupAssetCodesDropDown(counterAssetDdId, this.CounterAsset.AssetCode);
        setupAnchorDropDown(counterAnchorDdId, this.CounterAsset.AssetCode, this.CounterAsset.Issuer);
        //Initial data load
        getPastTrades(_this.BaseAsset, _this.CounterAsset);
        getOrderBook(_this.BaseAsset, _this.CounterAsset);
        renderCandlestickChart();
    };

    this.SwapAssets = function() {
        //Keep it simple - flip it through URL
        var currentUrl = window.location.href;
        var hashIndex = currentUrl.indexOf("#");
        var slashIndex = currentUrl.lastIndexOf("/");
        if (-1 === hashIndex || -1 === slashIndex || slashIndex<hashIndex) {
            return;
        }
        var newUrl = currentUrl.substring(0, hashIndex+1) +
                     currentUrl.substring(slashIndex+1) + "/" +
                     currentUrl.substring(hashIndex+1, slashIndex);
        window.location = newUrl;
    };

    this.SetChartInterval = function(intervalDesc) {
        $("#marketChart").html("<br/><br/>Loading chart...");
        this.ChartInterval = Utils.IntervalAsMilliseconds(intervalDesc);

        Utils.SetUrlParameter(GETParams.INTERVAL, this.ChartInterval);

        //Highlight correct interval link
        $("div.intervalButtons>a").removeClass("selected");
        $("a#interval" + intervalDesc).addClass("selected");
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
            throw new Error("Invalid URL parameters (missing counter asset): " + urlPart);
        }

        var baseAssetPart = urlPart.substring(0, index);
        _this.BaseAsset = Asset.ParseFromUrlParam(baseAssetPart);
        var counterAssetPart = urlPart.substring(index + 1);
        if (counterAssetPart.indexOf('?') > -1) {
            counterAssetPart = counterAssetPart.split('?')[0];
        }
        _this.CounterAsset = Asset.ParseFromUrlParam(counterAssetPart);
    };


    var renderCandlestickChart = function() {
        const dataRange = "&resolution=" + _this.ChartInterval + "&limit=70";
        var url = Constants.API_URL + "/trade_aggregations?" + _this.BaseAsset.ToUrlParameters("base") + "&" + _this.CounterAsset.ToUrlParameters("counter") + "&order=desc" + dataRange;

        $.getJSON(url, function(data) {
            if (data._embedded.records.length == 0) {
                $("#marketChart").html("<div class='chartNoData'>No data</div>");
                return;
            }

            $("#marketChart").empty();          //TODO: make the ID an input
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
                var candle = [record.timestamp, [open, high, low, close]];

                //Collect data for bar chart with volume
                var volume = parseFloat(record.base_volume);
                if (volume > maxVolume) {
                    maxVolume = volume;
                }
                var volumeBar = [record.timestamp, volume];
                candlestickChart.AddCandleData(candle, volumeBar);

                candlestickChart.SetStartTime(record.timestamp);
            });

            chartConfig["scale-x"].step = "15minute";
            chartConfig.series[1]["guide-label"].decimals = 2;  //TODO: chartConfig.setVolumeDecimals(__var__);

            //Set price chart range
            minPrice = 0.95 * minPrice;
            maxPrice = 1.05 * maxPrice;
            var decimals = Utils.GetPrecisionDecimals(minPrice);
            candlestickChart.SetPriceScale(minPrice, maxPrice, decimals);

            //Set volume chart range
            candlestickChart.SetVolumeScale(maxVolume);

            candlestickChart.Render("marketChart", _this.CounterAsset.AssetCode);       //TODO: make the ID an input
        })
        .fail(function(xhr, textStatus, error) {
            $("#marketChart").html("<div class='error'>" + textStatus + " - " + xhr.statusText + " (" + xhr.status + ") " + xhr.responseText + "</div>");
        });
    };

    var initPastTradesStream = function() {
        if (_this.BaseAsset != null && _this.CounterAsset) {    //We might not be done initializing
            getPastTrades(_this.BaseAsset, _this.CounterAsset);
        }
        setTimeout(function() {
            initPastTradesStream();
        }, Constants.PAST_TRADES_INTERVAL);
    };

    var initOrderBookStream = function() {
        if (_this.BaseAsset != null && _this.CounterAsset) {    //We might not be done initializing
            getOrderBook(_this.BaseAsset, _this.CounterAsset);
        }
        setTimeout(function() {
            initOrderBookStream();
        }, Constants.ORDERBOOK_INTERVAL);
    };

    var initChartStream = function() {
        if (_this.BaseAsset != null && _this.CounterAsset) {    //We might not be done initializing
            renderCandlestickChart();
        }
        setTimeout(function() {
            initChartStream();
        }, Constants.CHART_INTERVAL);
    };

    var getPastTrades = function(baseAsset, counterAsset) {
        var url = Constants.API_URL + "/trades?" + baseAsset.ToUrlParameters("base") + "&" + counterAsset.ToUrlParameters("counter") + "&order=desc&limit=40";

        $.getJSON(url, function(data) {
            $("#tradeHistoryData").empty();
            if (data._embedded.records.length === 0) {
                document.title = baseAsset.AssetCode + "/" + counterAsset.AssetCode;
                $("#currentPrice").html(noPriceDataSpan());
                $(noTradesRow()).appendTo("#tradeHistoryData");
            }
            else {
                document.title = currentPriceTitle(baseAsset.AssetCode, counterAsset.AssetCode, data._embedded.records[0]);
                $("#currentPrice").html(/*TODO: Templates.*/currentPriceSpan(data._embedded.records[0]));
                $.each(data._embedded.records, function(i, record) {
                    $(tradeRow(record)).appendTo("#tradeHistoryData");
                });
            }
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
            var sumBidsAmount = 0.0;
            $.each(data.bids, function(i, bid) {
                var amount = parseFloat(bid.amount) / parseFloat(bid.price);
                sumBidsAmount += amount;
                $(bidOfferRow(bid, amount, sumBidsAmount)).appendTo("#orderBookBids");
            });

            $("#orderBookAsks").empty();
            var sumAsksAmount = 0.0;
            $.each(data.asks, function(i, ask) {
                sumAsksAmount += parseFloat(ask.amount);
                $(askOfferRow(ask, sumAsksAmount)).prependTo("#orderBookAsks");
            });

            var maxCumulativeAmount = Math.max(sumBidsAmount, sumAsksAmount);
            colorizeOrderBookVolume($("#orderBookBids"), "#c8e8c8", maxCumulativeAmount);
            colorizeOrderBookVolume($("#orderBookAsks"), "#fad9b9", maxCumulativeAmount);
        })
        .fail(function(xhr, textStatus, error) {
            $("#orderBookBids").empty();
            $(getErrorRow(xhr, textStatus, error)).appendTo("#orderBookBids");
        });
    };

    var colorizeOrderBookVolume = function(orderBookTable, bgColor, maxAmount) {
        $(orderBookTable).children("tr").each(function(index, tableRow){
            var amount = $(tableRow).data("cumulative-amount");
            var percentage = amount / maxAmount * 100.0;
            percentage = percentage.toFixed(1);
            var bgStyle = "linear-gradient(to right, " + bgColor + " " + percentage + "%, rgba(255,255,255,0) " + percentage + "%)";
            $(tableRow).css("background", bgStyle);
        });
    };

    var addAutobridgedOffers = function(orderBook) {
        //TODO: check if one of the assets is XLM. If not, add auto-bridged offers through XLM
        return orderBook;
    };

    initPastTradesStream();
    initOrderBookStream();
    initChartStream();

    var setupAssetCodesDropDown = function(dropDownId, selectedAssetCode) {
        //In case this is re-init, destroy previous instance
        $('div[id^="' + dropDownId + '"]').ddslick('destroy');
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
                selected: assetCode === selectedAssetCode,
                description: assetFullName,
                imageSrc: "./images/assets/" + assetImage
            });
        });

        assetList.push({
            text: "[+] Add",
            value: "ADD_CUSTOM",
            description: "Add asset manually"
        });

        $("#" + dropDownId).ddslick({
            data: assetList,
            width: 150,
            onSelected: function (data) {
                if ("ADD_CUSTOM"  === data.selectedData.value) {
                    window.location.href = Constants.CONFIGURATION_URL;
                }
                else {
                    changeAssets(false);
                }
            }
        });
    };

    var setupAnchorDropDown = function(dropDownId, assetCode, assetIssuer) {
        //In case this is re-init, destroy previous instance
        $('div[id^="' + dropDownId + '"]').ddslick('destroy');
        var issuersArray = KnownAssets.GetIssuersByAsset(assetCode);
        var issuerAccount = KnownAccounts.GetAccountByAddress(assetIssuer.Address);
        var assetIssuersDdData = new Array();
        for (var i=0; i<issuersArray.length; i++) {
            assetIssuersDdData.push({
                text: issuersArray[i].ShortName,
                description: issuersArray[i].Domain,
                value: issuersArray[i].Address,
                selected: issuersArray[i] == issuerAccount
            });
        }

        assetIssuersDdData.push({
            text: "[+] Manage",
            value: "ADD_CUSTOM",
            description: "Add anchor manually"
        });

        $("#" + dropDownId).ddslick({
            data: assetIssuersDdData,
            width: 250,
            onSelected: function (data) {
                if ("ADD_CUSTOM"  === data.selectedData.value) {
                    window.location.href = Constants.CONFIGURATION_URL + "?selectAssetCode=" + assetCode;
                }
                else {
                    changeAssets(true);
                }
            }
        });
    };

    /**
     * Collect base and counter assets from inputs and navigate to new market URL by that.
     */
    var changeAssets = function(selectingAnchor) {
        var urlAssets = $('div[id^="' + baseAssetDdId + '"]').data('ddslick').selectedData.value;
        if (selectingAnchor) {
            var baseIssuer = $('div[id^="' + baseAnchorDdId + '"]').data('ddslick').selectedData.value;
            if (baseIssuer != null) {
                urlAssets += "-" + baseIssuer;
            }
        }

        urlAssets += "/" + $('div[id^="' + counterAssetDdId + '"]').data('ddslick').selectedData.value;
        if (selectingAnchor) {
            var counterIssuer = $('div[id^="' + counterAnchorDdId + '"]').data('ddslick').selectedData.value;
            if (counterIssuer != null) {
                urlAssets += "-" + counterIssuer;
            }
        }

        var currentUrl = window.location.href;
        //TODO: alright, I definitely need a separate module for URL tasks (maybe a 3rd party lib?)
        var paramIndex = currentUrl.indexOf('?');
        var paramsPart = paramIndex > -1 ? currentUrl.substring(paramIndex) : "";
        window.location = currentUrl.substring(0, currentUrl.indexOf("#")+1) + urlAssets + paramsPart;
        _this.Initialize();
    };
}
