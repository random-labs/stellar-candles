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
        //TODO: request Horizon


        $("#"+placeHolderId).empty();

        lineChart.Render(placeHolderId);

    };


}