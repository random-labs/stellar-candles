/**
 * UI model to the small exchange charts on the Overview page. Always shows 24hr history.
 */
function ExchangeThumbnail(baseAsset, counterAsset) {
    this.BaseAsset = baseAsset;
    this.CounterAsset = counterAsset;
    this.ChartInterval = 900000;    //15min candles by default

    var _this = this;
    var _lineChart = new SmallLineChart();

    this.Initialize = function(placeHolderId) {
        //Fill the header with asset names
        const assetsDescDIV = $("#"+placeHolderId).siblings(".assetsDescription");
        $(assetsDescDIV).find(".baseAssetCode").text(this.BaseAsset.AssetCode);
        $(assetsDescDIV).find(".baseAssetIssuer").text(this.BaseAsset.Issuer.Domain || "");
        $(assetsDescDIV).find(".counterAssetCode").text(this.CounterAsset.AssetCode);
        $(assetsDescDIV).find(".counterAssetIssuer").text(this.CounterAsset.Issuer.Domain || "");

        //Activate the link so it navigates to correct exchange
        var chartLink = $("#"+placeHolderId).parent("div.exchange-link");
        $(chartLink).on("click", function() {
            const url = "exchange.html#" + _this.BaseAsset.ToExchangeUrlParameter() + "/" + _this.CounterAsset.ToExchangeUrlParameter();
            window.location = url;
        });

        renderLineChart(placeHolderId);
    };

    var renderLineChart = function(placeHolderId) {
        //We always request 15min candles because with smaller interval we couldn't get 1 day worth of data in single request
        const dataRange = "&resolution=" + _this.ChartInterval + "&limit=96";
        var url = Constants.API_URL + "/trade_aggregations?" + _this.BaseAsset.ToUrlParameters("base") + "&" + _this.CounterAsset.ToUrlParameters("counter") + "&order=desc" + dataRange;

        $.getJSON(url, function(data) {
            if (data._embedded.records.length == 0) {
                $("#"+placeHolderId).html("<div class='chartNoData'>No trades in last 24 hours</div>");
                return;
            }
            //Check age of last trade
            const minDate = new Date();
            minDate.setDate(minDate.getDate() - 1);
            const yesterday = minDate.getTime();
            const firstTimestamp = new Date(data._embedded.records[0].timestamp).getTime();
            if (firstTimestamp < yesterday) {
                //Last trade is older than 24hrs => we have no data
                $("#"+placeHolderId).html("<div class='chartNoData'>No trades in last 24 hours</div>");
                return;
            }

            _lineChart.CLEAR_DATA();         //TODO: delete this now!


            $("#"+placeHolderId).empty();
            var minPrice = Number.MAX_VALUE;
            var maxPrice = -1.0;
            var lastPrice = -999999;
            var startPrice;

            $.each(data._embedded.records, function(i, record) {
                if (record.timestamp < yesterday) {
                    return false;    //'break' at first value older than 24hrs
                }

                //Collect value for a single point in the chart as average of open/close
                var open = parseFloat(record.open);
                var close = parseFloat(record.close);
                var avgValue = (open + close) / 2.0;
                if (lastPrice === -999999) {
                    lastPrice = avgValue;
                }
                startPrice = avgValue;

                if (avgValue > maxPrice) {
                    maxPrice = avgValue;
                }
                if (avgValue < minPrice) {
                    minPrice = avgValue;
                }

                var point = [record.timestamp, avgValue];
                _lineChart.AddPointData(point);
                _lineChart.SetStartTime(record.timestamp);
            });

            setPriceStatistics(placeHolderId, startPrice, lastPrice);

            //Set price chart range
            minPrice = 0.97 * minPrice;
            maxPrice = 1.03 * maxPrice;
            var decimals = Utils.GetPrecisionDecimals(minPrice);
            _lineChart.SetPriceScale(minPrice, maxPrice, decimals);

            _lineChart.Render(placeHolderId);
        })
        .fail(function(xhr, textStatus, error) {
            $("#marketChart").html("<div class='error'>" + textStatus + " - " + xhr.statusText + " (" + xhr.status + ") " + xhr.responseText + "</div>");
        });
    };

    var setPriceStatistics = function(chartId, startPrice, lastPrice) {
        //Set last price
        const decimals = Utils.GetPrecisionDecimals(lastPrice);
        const priceAsString = lastPrice.toFixed(decimals);
        const assetsDescDIV = $("#"+chartId).siblings(".assetsDescription");
        $(assetsDescDIV).find(".lastPrice").text(priceAsString);

        //Set daily change as percentage
        var dailyChange = lastPrice / startPrice -1.0;
        dailyChange *= 100.0;
        const changeAsString = (dailyChange < 0.0 ? "" : "+") +  dailyChange.toFixed(2) + "%";
        const cssClass = dailyChange < 0.0 ? "red" : "green";
        _lineChart.SetLineColor(dailyChange < 0.0 ? Constants.Style.RED : Constants.Style.GREEN);
        _lineChart.SetBackgroundColor(dailyChange < 0.0 ? Constants.Style.LIGHT_RED : Constants.Style.LIGHT_GREEN);

        const aDiv = $(assetsDescDIV).find(".dailyChangePercent");
        $(aDiv).removeClass("red").removeClass("green").addClass(cssClass).text(changeAsString);
    };

    //TODO: setup stream, i.e. refresh every 15 minutes
}