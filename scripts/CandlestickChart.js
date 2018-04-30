/**
 * UI model to candlestick chart of historical trades (used on the Exchange page). Uses ZingChart to draw SVG.
 */
function CandlestickChart() {
    //Setup ZingChart
    zingchart.THEME="classic";

    this.GetDefaultChartConfig = function() {
        myConfigCandleSticks.series[0].values = [];
        myConfigCandleSticks.series[1].values = [];
        return myConfigCandleSticks;
    };

    this.ShowError = function(xhr, textStatus) {
        "<div class='error'>" + textStatus + " - " + xhr.statusText + " (" + xhr.status + ") " + xhr.responseText + "</div>";
    };

    this.ShowMissingDataWarning = function() {
        myConfigCandleSticks.title.text = "No data";
    };

    var myConfigCandleSticks = {
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
        "labels":[      //TODO
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
                "x":"110",
                "y":"25"
            },
            {
                "text":"low: %plot-0-value-2",
                "font-family":'consolas,"Liberation Mono",courier,monospace',           //TODO: from variable
                "font-size": "13.5px",
                "color": "#ED8117",                                                     //TODO: of course, variable
                "x":"215",
                "y":"25"
            },
            {
                "text":"close: %plot-0-value-3",
                "font-family":'consolas,"Liberation Mono",courier,monospace',           //TODO: from variable
                "font-size": "13.5px",
                "color": "#5B6A72",                                                     //TODO: from variable
                "x":"315",
                "y":"25"
            },
            {
                "text":"volume: %plot-1-value",
                "font-family":'consolas,"Liberation Mono",courier,monospace',           //TODO: from variable
                "font-size": "13.5px",                                                  //TODO: from variable
                "color": "#5B6A72",                                                     //TODO: from variable
                "x":"430",
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
            "step": "day",
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
            "values": "0:100:25",
            "format": "%v",
            "label": {
                "text": "Price (MOBI)"
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
                    "text": "open:%open  high:%high  low:%low  close: %close",
                    "decimals": 2,
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
