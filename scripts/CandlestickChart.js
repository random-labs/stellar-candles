/**
 * UI model to candlestick chart of historical trades (used on the Exchange page). Uses ZingChart to draw SVG.
 */
function CandlestickChart() {
    //Setup ZingChart
    zingchart.THEME="classic";

    this.AddCandleData = function(candle, volume) {
        _configCandleSticks.series[0].values.push(candle);
        _configCandleSticks.series[1].values.push(volume);
    };

    /**
     * Specify beginning of X axis of this chart by giving timestamp of oldest candle.
     * @param {number} timestamp - timestamp of the first candle in ticks
     */
    this.SetStartTime = function(timestamp) {
        _configCandleSticks["scale-x"]["min-value"] = timestamp;
    };

    /**
     * Set resolution of X axis in milliseconds, i.e. how much time does one candle represent.
     * @param {number} millisInCandle - number of miliseconds in one candle
     */
    this.SetCandleSize = function(millisInCandle) {
        _configCandleSticks["scale-x"]["step"] = millisInCandle;
    };

    /**
     * Set scope of the Y axis, i.e. price. The axis will be divided into up to 7 equal segments for visual guidance.
     * @param {number} minPrice - lower bound
     * @param {number} maxPrice - upper bound
     */
    this.SetPriceScale = function(minPrice, maxPrice) {
        let diff = maxPrice - minPrice;
        if (diff === 0.0) {
            //One price throughout the whole chart - stretch it a bit
            diff = 0.01 * maxPrice;
        }
        minPrice = minPrice - 0.25*diff;    //Small space below the deepest candle
        if (minPrice < 0.0) {
            minPrice = 0.0;
        }
        maxPrice = maxPrice + 0.25*diff;    //Small space above the tallest candle
        const decimals = Utils.GetPrecisionDecimals(minPrice);

        let step = (maxPrice - minPrice) / 7.0;
        if (step < 0.000001) {
            //BUG: ZingChart fails to render properly with steps below 0.000001
//            step = 0.000001;
        }
        _configCandleSticks["scale-y"].values = "" + minPrice.toFixed(decimals) + ":" + maxPrice.toFixed(decimals) + ":" + step.toFixed(decimals > 7 ? 7 : decimals);
    };

    /**
     * Set precision of volume tooltips
     * @param {number} decimals - number of digits to be shown after decimal separator
     */
    this.SetVolumeDecimals = function(decimals) {
        _configCandleSticks.series[1]["guide-label"].decimals = decimals;
    };

    /**
     * Set range of lower part of X axis (i.e. volume) by giving upper bound.
     * @param {number} maxVolume
     */
    this.SetVolumeScale = function(maxVolume) {
        const step = maxVolume / 3.0;
        _configCandleSticks["scale-y-2"].values = "0:" + maxVolume.toFixed(3) + ":" + step.toFixed(3);
    };

    this.ShowError = function(xhr, textStatus) {
        "<div class='error'>" + textStatus + " - " + xhr.statusText + " (" + xhr.status + ") " + xhr.responseText + "</div>";
    };

    /**
     * Render the candlestick chart.
     * @param {string} placeholderId - an element to put the chart into
     * @param {string} counterAssetCode - counter asset code (to be shown on y axis label)
     */
    this.Render = function (placeholderId, counterAssetCode) {
        _configCandleSticks["scale-y"].label.text = "Price (" + counterAssetCode + ")";
        zingchart.render({
            id : placeholderId,
            data : _configCandleSticks,
            height: "100%",
            width: "100%"
        });
    };


    const _configCandleSticks = {
        "type": "mixed",
        "background-color": "none",
        "title":{
            "text": "Interval: 15min (TODO)",
            "font-family": 'consolas,"Liberation Mono",courier,monospace',          //TODO: from variable
            "color": "#5B6A72",
            "background-color": "none",
            "align": "left"
        },
        gui: {
            behaviors: [        //NOTE: the "About ZingChart" item cannot be removed until I buy their license
                {id:'ViewSource', enabled:'none'},
                {id:'Reload', enabled:'none'},
                {id:'SaveAsImage', enabled:'none'},
                {id:'DownloadSVG', enabled:'none'},
                {id:'ViewSource', enabled:'none'},
                {id:'HideGuide', enabled:'none'}        //TODO? All their docs say 'GuideHide'. Warn them maybe.
            ]
        },
        "labels":[
            {
                "text":"open: %plot-0-value-0",
                "font-family":'consolas,"Liberation Mono",courier,monospace',           //TODO: from variable
                "font-size": "13.5px",
                "color": "#5B6A72",                                                     //TODO: from variable
                "x":"5",
                "y":"25"
            },
            {
                "text":"high: %plot-0-value-1",
                "font-family":'consolas,"Liberation Mono",courier,monospace',           //TODO: from variable
                "font-size": "13.5px",
                "color": "#46B446",                                                      //TODO: of course, variable
                "x":"150",
                "y":"25"
            },
            {
                "text":"low: %plot-0-value-2",
                "font-family":'consolas,"Liberation Mono",courier,monospace',           //TODO: from variable
                "font-size": "13.5px",
                "color": "#ED8117",                                                     //TODO: of course, variable
                "x":"295",
                "y":"25"
            },
            {
                "text":"close: %plot-0-value-3",
                "font-family":'consolas,"Liberation Mono",courier,monospace',           //TODO: from variable
                "font-size": "13.5px",
                "color": "#5B6A72",                                                     //TODO: from variable
                "x":"435",
                "y":"25"
            },
            {
                "text":"volume: %plot-1-value",
                "font-family":'consolas,"Liberation Mono",courier,monospace',           //TODO: from variable
                "font-size": "13.5px",                                                  //TODO: from variable
                "color": "#5B6A72",                                                     //TODO: from variable
                "x":"590",
                "y":"25"
            }
        ],
        "plot":{
            "aspect":"candlestick",
            "bar-width": "70%", //"50%",
            "tooltip":{
                "visible":false
            }
        },
        "plotarea":{
            "margin-left":"10%"
        },
        "scale-x":{
            "min-value": 1438592400000,
            "step": "day",      //Candle size from input
            "transform": {
                "type": "date",
                "all": "%D,<br>%M %d"
            },
            "max-items": 10,
            "item": {
                "font-size": 10
            }
        },
        "crosshair-x":{
            "plot-label":{
                "multiple":true
            },
            "scale-label":{
                "text":"%v",
                "transform":{
                    "type":"date",
                    "all":"%H:%i<br>%D, %M %d, %Y"
                },
                "background-color": "#5B6A72"
            }
        },
        "scale-y":{
            "offset-start": "30%", //to adjust scale offsets.
//todo?            "values": "0:100:25",       //Set from input
            "format": "%v",
            "label": {
                "text": "Price (TODO)"
            },
            "guide":{
                "line-style":"solid"
            },
            "item":{
                "font-size":10
            }
        },
        "scale-y-2":{
            "placement": "default", //to move scale to default (left) side.
            "blended": true, //to bind the scale to "scale-y".
            "offset-end": "85%", //to adjust scale offsets.
            "values": "0:100:20",
            "format": "%v",
            "guide":{
                "line-style":"solid"
            },
            "item":{
                "font-size":10
            }
        },
        "series": [
            {
                "type":"stock",
                "scales": "scale-x,scale-y",
                "guide-label": { //for crosshair plot labels
                    "visible": false
                },
                "trend-up":{
                    "line-color":"#46b446",
                    "border-color":"#46b446",
                    "background-color":"#46b446"
                },
                "trend-down":{
                    "line-color":"#ed8117",
                    "border-color":"#ed8117",
                    "background-color":"#ed8117"
                },
                "values":[
                    /*e.g.                [1438592400000, [120.8800,	121.7300,	120.1700,	121.1200]], //08/03/15
                     [1438678800000, [121.5000,	122.0800,	120.6100,	121.6900]], //08/04/15
                     [1438765200000, [110.8300,	113.9500,	109.5000,	110.5300]], //08/05/15
                     [1438851600000, [110.4000,	110.4000,	104.2400,	108.5500]], //08/06/15
                     [1438938000000, [108.7500,	109.5598,	107.6600,	109.3500]], //08/07/15
                     */
                ]
            },
            {
                "type":"bar",
                "scales": "scale-x,scale-y-2",
                "guide-label": { //for crosshair plot labels
                    "text": "Volume: %v",
                    "decimals": Constants.DEFAULT_AMOUNT_DECIMALS,
                    "background-color": "#5B6A72",
                    "color": "#FFFFFF"
                },
                "background-color": "#5B6A72", //"#00cc99",
                "values":[
                    /*e.g.                [1438592400000, 8.43], //08/03/15
                     [1438678800000, 12.62], //08/04/15
                     [1438765200000, 61.01], //08/05/15
                     [1438851600000, 57.18], //08/06/15
                     [1438938000000, 15.79], //08/07/15
                     */            ]
            }
        ]
    };

}
