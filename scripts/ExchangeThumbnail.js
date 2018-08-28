/**
 * UI model to the small exchange charts on the Overview page. Always shows 24hr history.
 */
function ExchangeThumbnail(baseAsset, counterAsset) {
    this.BaseAsset = baseAsset;
    this.CounterAsset = counterAsset;
    this.ChartInterval = 900000;    //15min candles by default

    const _this = this;
    const _lineChart = new SmallLineChart();
    let _placeHolderId = null;

    this.Initialize = function(placeHolderId) {
        _placeHolderId = placeHolderId;
        //Fill the header with asset names
        const assetsDescDIV = $("#"+_placeHolderId).siblings(".assetsDescription");
        $(assetsDescDIV).find(".baseAssetCode").text(this.BaseAsset.AssetCode);
        $(assetsDescDIV).find(".baseAssetIssuer").text(this.BaseAsset.Issuer.Domain || "");
        $(assetsDescDIV).find(".counterAssetCode").text(this.CounterAsset.AssetCode);
        $(assetsDescDIV).find(".counterAssetIssuer").text(this.CounterAsset.Issuer.Domain || "");

        //Activate the link so it navigates to correct exchange
        const chartLink = $("#"+_placeHolderId).parent("div.exchange-link");
            const url = "exchange.html#" + _this.BaseAsset.ToExchangeUrlParameter() + "/" + _this.CounterAsset.ToExchangeUrlParameter();
        $(chartLink).attr("title", url).on("click", function() {
            window.location = url;
        });

        _lineChart.ContextMenuLink(url);
        renderLineChart();
    };

    const renderLineChart = function() {
        //We always request 15min candles because with smaller interval we couldn't get 1 day worth of data in single request
        const dataRange = "&resolution=" + _this.ChartInterval + "&limit=96";
        const url = Constants.API_URL + "/trade_aggregations?" + _this.BaseAsset.ToUrlParameters("base") + "&" + _this.CounterAsset.ToUrlParameters("counter") + "&order=desc" + dataRange;

        $.getJSON(url, function(data) {
            $("#"+_placeHolderId).empty();
            if (data._embedded.records.length == 0) {
                $("#"+_placeHolderId).html("<div class='chartNoData'>No trades in last 24 hours</div>");
                return;
            }
            //Check age of last trade
            const minDate = new Date();
            minDate.setDate(minDate.getDate() - 1);
            const yesterday = minDate.getTime();
            const firstTimestamp = new Date(data._embedded.records[0].timestamp).getTime();
            if (firstTimestamp < yesterday) {
                //Last trade is older than 24hrs => we have no data
                $("#"+_placeHolderId).html("<div class='chartNoData'>No trades in last 24 hours</div>");
                return;
            }

            _lineChart.CLEAR_DATA();         //TODO: delete this now!


            $("#"+_placeHolderId).empty();
            var minPrice = Number.MAX_VALUE;
            var maxPrice = -1.0;
            var lastPrice = -999999;
            var startPrice;

            $.each(data._embedded.records, function(i, record) {
                if (record.timestamp < yesterday) {
                    return false;    //'break' at first value older than 24hrs
                }

                //Collect value for a single point in the chart as average
                const avgValue = parseFloat(record.avg);
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

            //Special case: if we have only one point in the chart, use trick and add artificial starting point
            //              with value equal to the existing point
            if (_lineChart.DataPointCount() === 1) {
                const artifPoint = [yesterday, startPrice];
                _lineChart.AddPointData(artifPoint);
                _lineChart.SetStartTime(yesterday);
            }

            setPriceStatistics(startPrice, lastPrice);
            _lineChart.SetPriceScale(minPrice, maxPrice);
            _lineChart.Render(_placeHolderId);
        })
        .fail(function(xhr, textStatus, error) {
            $("#marketChart").html("<div class='error'>" + textStatus + " - " + xhr.statusText + " (" + xhr.status + ") " + xhr.responseText + "</div>");
        });
    };

    const setPriceStatistics = function(startPrice, lastPrice) {
        //Set last price
        const decimals = Utils.GetPrecisionDecimals(lastPrice);
        const priceAsString = lastPrice.toFixed(decimals);
        const assetsDescDIV = $("#"+_placeHolderId).siblings(".assetsDescription");
        $(assetsDescDIV).find(".lastPrice").text(priceAsString);

        //Set daily change as percentage
        let dailyChange = lastPrice / startPrice -1.0;
        dailyChange *= 100.0;
        const changeAsString = (dailyChange <= 0.0 ? "" : "+") +  dailyChange.toFixed(2) + "%";
        const cssClass = dailyChange < 0.0 ? "red" : "green";
        _lineChart.SetLineColor(dailyChange < 0.0 ? Constants.Style.RED : Constants.Style.GREEN);
        _lineChart.SetBackgroundColor(dailyChange < 0.0 ? Constants.Style.LIGHT_RED : Constants.Style.LIGHT_GREEN);

        const aDiv = $(assetsDescDIV).find(".dailyChangePercent");
        $(aDiv).removeClass("red").removeClass("green").addClass(cssClass).text(changeAsString);
    };

    /**
     * Reload the chart every 8 minutes
     * @private
     */
    const initChartStream = function() {
        if (_this.BaseAsset != null && _this.CounterAsset) {    //We might not be done initializing
            renderLineChart();
        }
        setTimeout(function() {
            initChartStream();
        }, Constants.CHART_INTERVAL);
    };
    initChartStream();
}