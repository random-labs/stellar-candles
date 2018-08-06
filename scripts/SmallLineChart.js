/**
 * UI model to simple line chart of historical trades for past 24 hours. Uses ZingChart to draw SVG.
 */
function SmallLineChart() {

    /**
     * DEBUG!!!
     */
    this.CLEAR_DATA = function() {           //TODO: DELETE THIS
        chartConfig.series[0].values = [];
    };



    this.AddPointData = function(point) {
        chartConfig.series[0].values.push(point);
    };

    /**
     * Specify beginning of X axis of this chart by giving timestamp of oldest candle.
     * @param {number} timestamp - timestamp of the first candle in ticks
     */
    this.SetStartTime = function(timestamp) {
        chartConfig["scale-x"]["min-value"] = timestamp;
    };

    /**
     * Set scope of the Y axis, i.e. price. The axis will be divided into up to 5 equal segments for visual guidance.
     * @param {number} minPrice - lower bound
     * @param {number} maxPrice - upper bound
     */
    this.SetPriceScale = function(minPrice, maxPrice, decimals) {
        var step = (maxPrice - minPrice) / 5.0;
        if (step < 0.00000100) {
            //BUG: ZingChart fails to render with steps below 0.00000100
            step = 0.00000100;
        }
        chartConfig["scale-y"].values = "" + minPrice.toFixed(decimals) + ":" + maxPrice.toFixed(decimals) + ":" + step.toFixed(decimals);
    };

    /**
     * Set background color of this chart. Usually used to indicate raising/falling market.
     * @param color - CSS style color name or color code
     */
    this.SetBackgroundColor = function(color) {
        chartConfig["background-color"] = color;
    };

    /**
     * Set line color. Usually used to emphasize rising/falling trend.
     * @param color - CSS style color name of color code
     */
    this.SetLineColor = function(color) {
        chartConfig.series[0]["line-color"] = color;
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
//        "background-color": "gray",
        "utc": false,
        "plotarea": {
            "margin": "dynamic 30 60 dynamic"
        },
        "scale-x": {
            "line-color": "#5B6A72",
            "min-value": 1383292800000, //Dummy. Real value is set before rendering
            "step": 900000,
            "transform": {
                "type": "date",
                "all": "%h %A"
            },
            "minor-ticks": 3,
            "max-labels": 6         //In fact 'min'
        },
        "scale-y": {
            "values": "0:400:50",   //This must be input
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
                    /*e.g.                [1438592400000, 8.43], //08/03/15
                     [1438678800000, 12.62], //08/04/15
                     [1438765200000, 61.01], //08/05/15
                     [1438851600000, 57.18], //08/06/15
                     [1438938000000, 15.79], //08/07/15
                     */
                ],
                "cursor": "pointer"
//                "line-color": "#46B446"
            }
        ]
    };
}
