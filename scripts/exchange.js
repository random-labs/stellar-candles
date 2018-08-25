var exchangeUi = null;

$(function() {
    exchangeUi = new Exchange("baseAssetCodeDropDown", "baseAssetAnchorDropDown", "counterAssetCodeDropDown", "counterAssetAnchorDropDown");
    exchangeUi.Initialize();
});


/**
 * UI model to the Exchange page
 * @constructor
 */
function Exchange(baseAssetDropDownId, baseIssuerDropDownId, counterAssetDropDownId, counterIssuerDropDownId) {
    this.BaseAsset = null;
    this.CounterAsset = null;
    this.ChartInterval = 900000;    //15min candles by default

    const _this = this;
    const baseAssetDdId = baseAssetDropDownId;
    const baseAnchorDdId = baseIssuerDropDownId;
    const counterAssetDdId = counterAssetDropDownId;
    const counterAnchorDdId = counterIssuerDropDownId;

    //If user changes the URL parameters manually, re-initialize
    $(window).bind('hashchange', function() {
        _this.Initialize();
    });
    $("a#swapAssetsLink").on('click', function (ev) {
        swapAssets();
        ev.preventDefault();
    });

    this.Initialize = function() {
        parseUrl();
        highlightIntervalLink();
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

    /**
     * Switch base and counter asset on current exchange 
     * @private
     */
    const swapAssets = function() {
        //Keep it simple - flip it through URL
        const newUrl = Utils.SwapExchangeAssetsInUrl(window.location.href);
        window.location = newUrl;
    };

    this.SetChartInterval = function(intervalDesc) {            //TODO: maybe I could achieve this with direct link?
        $("#marketChart").html("<br/><br/>Loading chart...");
        this.ChartInterval = Utils.IntervalAsMilliseconds(intervalDesc);

        Utils.SetUrlParameter(GETParams.INTERVAL, this.ChartInterval);

        highlightIntervalLink();
    };

    /**
     * Parse assets from URL and load data lists and the candlestick chart
     * @private
     */
    const parseUrl = function() {
        let urlPart = window.location.href;
        let index = urlPart.indexOf("#");
        if (-1 === index) {
            throw new Error("Invalid URL parameters");
        }

        urlPart = urlPart.substring(index+1);
        index = urlPart.indexOf("/");
        if (-1 === index) {
            throw new Error("Invalid URL parameters (missing counter asset): " + urlPart);
        }

        const baseAssetPart = urlPart.substring(0, index);
        _this.BaseAsset = Asset.ParseFromUrlParam(baseAssetPart);
        let counterAssetPart = urlPart.substring(index + 1);
        if (counterAssetPart.indexOf('?') > -1) {
            counterAssetPart = counterAssetPart.split('?')[0];
        }
        _this.CounterAsset = Asset.ParseFromUrlParam(counterAssetPart);

        //Chart interval
        const intervalArg = Utils.GetUrlParameter(GETParams.INTERVAL);
        _this.ChartInterval = Utils.IntervalAsMilliseconds(intervalArg);
    };

    const highlightIntervalLink = function() {
        $("div.intervalButtons>a").removeClass("selected");
        $("a#interval" + _this.ChartInterval).addClass("selected");
    };

    const renderCandlestickChart = function() {
        const dataRange = "&resolution=" + _this.ChartInterval + "&limit=70";
        const url = Constants.API_URL + "/trade_aggregations?" + _this.BaseAsset.ToUrlParameters("base") + "&" + _this.CounterAsset.ToUrlParameters("counter") + "&order=desc" + dataRange;

        $.getJSON(url, function(data) {
            if (data._embedded.records.length == 0) {
                $("#marketChart").html("<div class='chartNoData'>No data</div>");
                return;
            }

            $("#marketChart").empty();
            const candlestickChart = new CandlestickChart();
            let minPrice = Number.MAX_VALUE;
            let maxPrice = -1.0;
            let maxVolume = -1.0;

            $.each(data._embedded.records, function(i, record) {
                //Collect data for a single candle in the candlestick chart
                const open = parseFloat(record.open);
                const high = parseFloat(record.high);
                if (high > maxPrice) {
                    maxPrice = high;
                }
                const low = parseFloat(record.low);
                if (low < minPrice) {
                    minPrice = low;
                }
                const close = parseFloat(record.close);
                const candle = [record.timestamp, [open, high, low, close]];      //BUG: ZingChart seems to have open and close messed

                //Collect data for bar chart with volume
                const volume = parseFloat(record.base_volume);
                if (volume > maxVolume) {
                    maxVolume = volume;
                }
                const volumeBar = [record.timestamp, volume];
                candlestickChart.AddCandleData(candle, volumeBar);

                candlestickChart.SetStartTime(record.timestamp);
            });

            candlestickChart.SetCandleSize(_this.ChartInterval);
            candlestickChart.SetVolumeDecimals(maxVolume >= 10.0 ? 2 : 4/*Lame but working*/);
            candlestickChart.SetPriceScale(minPrice, maxPrice);
            //Set volume chart range
            candlestickChart.SetVolumeScale(maxVolume);

            candlestickChart.Render("marketChart", _this.CounterAsset.AssetCode);       //TODO: make the ID an input
        })
        .fail(function(xhr, textStatus, error) {
            $("#marketChart").html("<div class='error'>" + textStatus + " - " + xhr.statusText + " (" + xhr.status + ") " + xhr.responseText + "</div>");
        });
    };

    const initPastTradesStream = function() {
        if (_this.BaseAsset != null && _this.CounterAsset) {    //We might not be done initializing
            getPastTrades(_this.BaseAsset, _this.CounterAsset);
        }
        setTimeout(function() {
            initPastTradesStream();
        }, Constants.PAST_TRADES_INTERVAL);
    };

    const initOrderBookStream = function() {
        if (_this.BaseAsset != null && _this.CounterAsset) {    //We might not be done initializing
            getOrderBook(_this.BaseAsset, _this.CounterAsset);
        }
        setTimeout(function() {
            initOrderBookStream();
        }, Constants.ORDERBOOK_INTERVAL);
    };

    const initChartStream = function() {
        if (_this.BaseAsset != null && _this.CounterAsset) {    //We might not be done initializing
            renderCandlestickChart();
        }
        setTimeout(function() {
            initChartStream();
        }, Constants.CHART_INTERVAL);
    };

    const getPastTrades = function(baseAsset, counterAsset) {
        const url = Constants.API_URL + "/trades?" + baseAsset.ToUrlParameters("base") + "&" + counterAsset.ToUrlParameters("counter") + "&order=desc&limit=40";

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

    const getOrderBook = function(baseAsset, counterAsset) {
        const url = Constants.API_URL + "/order_book?" + baseAsset.ToUrlParameters("selling") + "&" + counterAsset.ToUrlParameters("buying") + "&limit=17";

        $.getJSON(url, function(data) {
            data = addAutobridgedOffers(data);

            $("#orderBookBids").empty();
            let sumBidsAmount = 0.0;
            $.each(data.bids, function(i, bid) {
                const amount = parseFloat(bid.amount) / parseFloat(bid.price);
                sumBidsAmount += amount;
                $(bidOfferRow(bid, amount, sumBidsAmount)).appendTo("#orderBookBids");
            });

            $("#orderBookAsks").empty();
            let sumAsksAmount = 0.0;
            $.each(data.asks, function(i, ask) {
                sumAsksAmount += parseFloat(ask.amount);
                $(askOfferRow(ask, sumAsksAmount)).prependTo("#orderBookAsks");
            });

            const maxCumulativeAmount = Math.max(sumBidsAmount, sumAsksAmount);
            colorizeOrderBookVolume($("#orderBookBids"), Constants.Style.LIGHT_GREEN, maxCumulativeAmount);
            colorizeOrderBookVolume($("#orderBookAsks"), Constants.Style.LIGHT_RED, maxCumulativeAmount);
        })
        .fail(function(xhr, textStatus, error) {
            $("#orderBookBids").empty();
            $(getErrorRow(xhr, textStatus, error)).appendTo("#orderBookBids");
        });
    };

    const colorizeOrderBookVolume = function(orderBookTable, bgColor, maxAmount) {
        $(orderBookTable).children("tr").each(function(index, tableRow){
            const amount = $(tableRow).data("cumulative-amount");
            let percentage = amount / maxAmount * 100.0;
            percentage = percentage.toFixed(1);
            const bgStyle = "linear-gradient(to right, " + bgColor + " " + percentage + "%, rgba(255,255,255,0) " + percentage + "%)";
            $(tableRow).css("background", bgStyle);
        });
    };

    const addAutobridgedOffers = function(orderBook) {
        //TODO: check if one of the assets is XLM. If not, add auto-bridged offers through XLM
        return orderBook;
    };

    initPastTradesStream();
    initOrderBookStream();
    initChartStream();

    const setupAssetCodesDropDown = function(dropDownId, selectedAssetCode) {
        //In case this is re-init, destroy previous instance
        $('div[id^="' + dropDownId + '"]').ddslick('destroy');

        const assetList = new Array();
        let found = false;
        AssetRepository.getAssetCodesForExchange().forEach(function(assetCode){
            //Search for asset full name among know assets
            let assetFullName = " ";
            let assetImage = "unknown.png";
            for (let asset in KnownAssets) {
                if (KnownAssets[asset].AssetCode === assetCode) {
                    assetFullName = KnownAssets[asset].FullName;
                    assetImage = assetCode + ".png";
                    break;
                }
            }
            if (assetCode === selectedAssetCode) {
                found = true;
            }

            assetList.push({
                text: assetCode,
                value: assetCode,
                selected: assetCode === selectedAssetCode,
                description: assetFullName,
                imageSrc: "./images/assets/" + assetImage
            });
        });

        //Some unknown code
        if (!found) {
            assetList.splice(0, 0, {    //Insert at beginning
                text: selectedAssetCode,
                value: selectedAssetCode,
                selected: true,
                imageSrc: "./images/assets/unknown.png"         //TODO: we still may have the icon even if it's not a common asset!
            });
        }

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

    const setupAnchorDropDown = function(dropDownId, assetCode, assetIssuer) {
        //In case this is re-init, destroy previous instance
        $('div[id^="' + dropDownId + '"]').ddslick('destroy');
        const issuersArray = AssetRepository.GetIssuersByAssetCode(assetCode);
        const issuerAccount = AssetRepository.GetIssuerByAddress(assetIssuer.Address);
        const assetIssuersDdData = new Array();
        let found = assetIssuer.IsNativeIssuer();
        for (let i=0; i<issuersArray.length; i++) {
            assetIssuersDdData.push({
                text: issuersArray[i].ShortName,
                description: issuersArray[i].Domain,
                value: issuersArray[i].Address,
                selected: issuersArray[i] == issuerAccount
            });
            if (issuersArray[i] == issuerAccount) {
                found = true;
            }
        }

        //Some unknown address, probably from manual URL
        if (!found) {
            assetIssuersDdData.splice(0, 0, {    //Insert at beginning
                text: assetIssuer.ShortName,
                description: "unknown (" + assetIssuer.Address + ")",
                value: assetIssuer.Address,
                selected: true
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
                    window.location.href = Constants.CONFIGURATION_URL + "?" + GETParams.ASSET_TYPE + "=" + assetCode;
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
    const changeAssets = function(selectingAnchor) {
        let urlAssets = $('div[id^="' + baseAssetDdId + '"]').data('ddslick').selectedData.value;
        if (selectingAnchor) {
            const baseIssuer = $('div[id^="' + baseAnchorDdId + '"]').data('ddslick').selectedData.value;
            if (baseIssuer != null) {
                urlAssets += "-" + baseIssuer;
            }
        }

        urlAssets += "/" + $('div[id^="' + counterAssetDdId + '"]').data('ddslick').selectedData.value;
        if (selectingAnchor) {
            const counterIssuer = $('div[id^="' + counterAnchorDdId + '"]').data('ddslick').selectedData.value;
            if (counterIssuer != null) {
                urlAssets += "-" + counterIssuer;
            }
        }

        const currentUrl = window.location.href;
        //TODO: alright, I definitely need a separate module for URL tasks (maybe a 3rd party lib?)
        const paramIndex = currentUrl.indexOf('?');
        const paramsPart = paramIndex > -1 ? currentUrl.substring(paramIndex) : "";
        window.location = currentUrl.substring(0, currentUrl.indexOf("#")+1) + urlAssets + paramsPart;
        _this.Initialize();
    };
}
