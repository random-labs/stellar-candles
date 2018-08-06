/**
 * UI model to the small exchange charts on the Overview page. Always shows 24hr history.
 */
function ExchangeThumbnail(baseAsset, counterAsset) {
    this.BaseAsset = baseAsset;
    this.CounterAsset = counterAsset;
    this.ChartInterval = 900000;    //15min candles by default

    var _this = this;
    var lineChart = new SmallLineChart();

    this.Initialize = function(placeHolderId) {
        //TODO: fill the graph labels and HTML placeholders

        //Initial data load
        //TODO

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

            lineChart.CLEAR_DATA();         //TODO: delete this now!


            $("#"+placeHolderId).empty();
            var minPrice = Number.MAX_VALUE;
            var maxPrice = -1.0;


            var debug = 0;


            $.each(data._embedded.records, function(i, record) {
                if (record.timestamp < yesterday) {
                    return false;    //'break' at first value older than 24hrs
                }

                //Collect value for a single point in the chart as average of open/close
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
                var avgValue = (open + close) / 2.0;
                var point = [record.timestamp, avgValue];

                lineChart.AddPointData(point);
                lineChart.SetStartTime(record.timestamp);
            });

            //Set price chart range
            minPrice = 0.95 * minPrice;
            maxPrice = 1.05 * maxPrice;
            var decimals = Utils.GetPrecisionDecimals(minPrice);
            lineChart.SetPriceScale(minPrice, maxPrice, decimals);

            lineChart.Render(placeHolderId);
        })
        .fail(function(xhr, textStatus, error) {
            $("#marketChart").html("<div class='error'>" + textStatus + " - " + xhr.statusText + " (" + xhr.status + ") " + xhr.responseText + "</div>");
        });
    };


    //TODO: setup stream, i.e. refresh every 15 minutes
}