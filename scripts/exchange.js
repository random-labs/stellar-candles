
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

var streamPastTrades = function(baseAsset, counterAsset) {
    getPastTrades(baseAsset, counterAsset);
    setTimeout(function() {
        streamPastTrades(baseAsset, counterAsset);
    }, Constants.PAST_TRADES_INTERVAL);
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

var streamOrderBook = function(baseAsset, counterAsset) {
    getOrderBook(baseAsset, counterAsset);
    setTimeout(function() {
        streamOrderBook(baseAsset, counterAsset);
    }, Constants.ORDERBOOK_INTERVAL);
};

var addAutobridgedOffers = function(orderBook) {
    //TODO: check if one of the assets is XLM. If not, add auto-bridged offers through XLM
    return orderBook;
};


var getDataForChart = function(baseAsset, counterAsset) {
    const dataRange = "&resolution=900000&limit=96";
    var url = Constants.API_URL + "/trade_aggregations?" + baseAsset.ToUrlParameters("base") + "&" + counterAsset.ToUrlParameters("counter") + "&order=desc" + dataRange;

    $.getJSON(url, function(data) {
        $("#marketChart").empty();
        var chartConfig = getDefaultChartConfig();
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

            chartConfig["scale-x"]["min-value"] = record.timestamp;     //TODO: chartConfig.SetStartTime(record.timestamp);
        });

        chartConfig["scale-x"].step = "15minute";

        //Set price chart range (TODO: chartConfig.SetHorizontalScale(minPrice, maxPrice); )
        minPrice = 0.9 * minPrice;
        maxPrice = 1.1 * maxPrice;
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
        //TODO: chartConfig.showError(xhr, textStatus);
        myConfigCandleSticks.title.text = textStatus + " - " + xhr.statusText + " (" + xhr.status + ") " + xhr.responseText;
        myConfigCandleSticks.color = "red";
    });
};


$(function() {
    //TODO: load candle chart first
    streamPastTrades(KnownAssets.XLM, KnownAssets.MOBI);
    streamOrderBook(KnownAssets.XLM, KnownAssets.MOBI);
});




var getDefaultChartConfig = function() {
    myConfigCandleSticks.series[0].values = [];
    myConfigCandleSticks.series[1].values = [];
    return myConfigCandleSticks;
};
//========================================================= TEMPORARY, ZingChart =========================================================
zingchart.THEME="classic";

var myConfigCandleSticks = {
    "type": "mixed",
    "background-color": "none",
    "title":{
        "text": "Interval: 15min",
        "font-family": 'consolas,"Liberation Mono",courier,monospace',
        "color": "#5B6A72",
        "background-color": "none",
        "align": "left"
    },

    "labels":[
        {
            "text":"open: %plot-0-value-0  high: %plot-0-value-1  low: %plot-0-value-2  close: %plot-0-value-3",
            "font-family":'consolas,"Liberation Mono",courier,monospace',           //TODO: from variable
            "font-size": "13.5px",
            "x":"20",
            "y":"25"
        },
        {
            "text":"volume: %plot-1-value",
            "font-family":'consolas,"Liberation Mono",courier,monospace',           //TODO: from variable
            "color": "#5B6A72",
            "x":"450",
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
            }
        }
    },
    "scale-y":{
        "offset-start": "35%", //to adjust scale offsets.
        "values": "90:130:20",
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
        "values": "0:75:15",
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
                "decimals": Constants.DEFAULT_AMOUNT_DECIMALS //2
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

$(function() {
    zingchart.render({
        id : 'marketChart',
        data : myConfigCandleSticks,
        height: "100%",
        width: "100%"
    });
});
