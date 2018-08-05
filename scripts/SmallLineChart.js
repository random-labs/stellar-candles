/**
 * UI model to simple line chart of historical trades for past 24 hours. Uses ZingChart to draw SVG.
 */
function SmallLineChart() {

    this.GetDefaultChartConfig = function() {           //TODO: DELETE THIS WHEN ALL OPERATIONS ARE PROPERLY WRAPPED
        myConfigCandleSticks.series[0].values = [];
        myConfigCandleSticks.series[1].values = [];
        return myConfigCandleSticks;
    };

    this.AddCandleData = function(candle, volume) {
        myConfigCandleSticks.series[0].values.push(candle);
        myConfigCandleSticks.series[1].values.push(volume);
    };

    /**
     * Specify beginning of X axis of this chart by giving timestamp of oldest candle.
     * @param {number} timestamp - timestamp of the first candle in ticks
     */
    this.SetStartTime = function(timestamp) {
        myConfigCandleSticks["scale-x"]["min-value"] = timestamp;
    };

    /**
     * Set scope of the Y axis, i.e. price. The axis will be divided into up to 7 equal segments for visual guidance.
     * @param {number} minPrice - lower bound
     * @param {number} maxPrice - upper bound
     */
    this.SetPriceScale = function(minPrice, maxPrice, decimals) {
        var step = (maxPrice - minPrice) / 7.0;
        myConfigCandleSticks["scale-y"].values = "" + minPrice.toFixed(decimals) + ":" + maxPrice.toFixed(decimals) + ":" + step.toFixed(decimals);
    };

    /**
     * Set range of lower part of X axis (i.e. volume) by giving upper bound.
     * @param {number} maxVolume
     */
    this.SetVolumeScale = function(maxVolume) {
        var step = maxVolume / 3.0;
        myConfigCandleSticks["scale-y-2"].values = "0:" + maxVolume.toFixed(2) + ":" + step.toFixed(2);
    };

    this.ShowError = function(xhr, textStatus) {
        "<div class='error'>" + textStatus + " - " + xhr.statusText + " (" + xhr.status + ") " + xhr.responseText + "</div>";
    };

    /**
     * Render the line chart.
     * @param {string} placeholderId - an element to put the chart into
     */
    this.Render = function (placeholderId) {
        zingchart.render({
            id : placeholderId,
            data : chartConfig,
            height: "100%",
            width: "100%"
        });
    };














    var chartConfig =
    {
        "type": "line",
        "background-color": "rgb(200, 232, 200)",       //TODO: light green for rise, carrot for fall. From constants of course.
        "utc": true,
        "plotarea": {
            "margin": "dynamic 30 60 dynamic"
        },
        "scale-x": {
            "line-color": "#5B6A72",
            "min-value": 1383292800000,
            "step": 3600000,
            "transform": {
                "type": "date",
                "all": "%h %A"
            },
            "minor-ticks": 3,
            "max-labels": 6         //In fact 'min'
        },
        "scale-y": {
            "values": "0:400:50",
            "line-color": "#5B6A72",
            "guide": {
                "line-style": "dashed"
            },
            "thousands-separator": ","
        },
        "tooltip": {
            "visible": false
        },
        "plot": {
            "line-width": "4px",
            "marker": {
                "visible": false
            }
        },
        "series": [
            {
                "values": [
                    149.2, 174.3, 187.7, 147.1, 129.6, 189.6, 230, 164.5, 171.7, 163.4, 194.5,
                    200.1, 193.4, 254.4, 287.8, 246, 199.9, 218.3, 244, 352.2, 284.5, 249.2,
                    305.2, 286.1, 387.7, 278, 240.3, 212.4, 237.1, 253.2, 186.1, 153.6, 168.5,
                    140.9, 86.9, 49.4, 24.7, 64.8, 114.4, 137.4
                ],
                "cursor": "pointer",
                "line-color": "#46b446"
            }
        ]
    };
}
