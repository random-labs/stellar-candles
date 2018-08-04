/**
 * UI model to the small exchange charts on the Overview page. Always shows 24hr history.
 */
function StatChart(baseAsset, counterAsset) {
    this.BaseAsset = null;
    this.CounterAsset = null;
    this.ChartInterval = 900000;    //15min candles by default

    var _this = this;
    var candlestickChart = new CandlestickChart();
    var baseAssetDdId = baseAssetDropDownId;
    var baseAnchorDdId = baseIssuerDropDownId;
    var counterAssetDdId = counterAssetDropDownId;
    var counterAnchorDdId = counterIssuerDropDownId;




}