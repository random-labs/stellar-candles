/**
 * Container to carry user's custom exchange, i.e. base and counter Asset
 * @constructor
 * @param {Number} id NOTE: base+counter asset combination don't uniquely identify a pair instance as user can do different things
 *                    with different instances of the same pair. Hence unique identifier is expected here for each call.
 * @param {Asset} baseAsset 
 * @param {Asset} counterAsset 
 */
function ExchangePair(id, baseAsset, counterAsset) {
    const _id = id;
    const _baseAsset = baseAsset;
    const _counterAsset = counterAsset;

    /** @public Get unique ID of this pair instance. */
    this.getId = function() { return _id; };
    this.getBaseAsset = function () { return _baseAsset; };
    this.getCounterAsset = function() { return _counterAsset; };
}