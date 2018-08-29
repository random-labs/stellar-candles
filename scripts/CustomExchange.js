

/**
 * Container to carry user's custom exchange, i.e. base and counter Asset
 * @constructor
 * @param {Asset} baseAsset 
 * @param {Asset} counterAsset 
 */
function CustomExchange(baseAsset, counterAsset) {
    const _baseAsset = baseAsset;
    const _counterAsset = counterAsset;

    _this.getBaseAsset = function () { return _baseAsset; };
    _this.getCounterAsset = function() { return _counterAsset; };
}