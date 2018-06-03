/**
 * Client-side "database" stored in a cookie. Singleton instance.
 */
var AssetRepository = (function () {
    var _this = this;
    //TODO: KnownAssets should be moved here
    this.CustomAssetCodes = new Array();
    this.CustomAnchors = new Array();
    this.CustomAssets = new Array();

    /**
     * Add new asset code (e.g. "USD", "BTC"...)
     * @param {string} assetCode - up to 12 chars of new asset code
     */
    this.AddCustomAssetCode = function(assetCode) {
        //Don't add if it's already there
        for (var i=0; i<_this.CustomAssetCodes.length; i++) {
            if (_this.CustomAssetCodes[i] === assetCode) {
                return;
            }
        }
        _this.CustomAssetCodes.push(assetCode);
    };

    /**
     * Loads user's custom defined asset codes from cookie
     */
    var loadAssetCodes = function() {
        var COOKIE_NAME = "CODES=";
        var customCodes = new Array();
        var cookieText = document.cookie;
        if (cookieText.length <= 0) {
            return customCodes;
        }

        var parts = cookieText.split(";");
        for (var i=0; i<parts.length; i++) {
            var part = parts[i];
            if (part.indexOf(COOKIE_NAME) == 0) {
                var assetCodes = part.substr(COOKIE_NAME.length).split("|");       //TODO: sanitize "|" in anchor name
                for (var a=0; a<assetCodes.length; a++) {      //"BTC", "USD"...
                    customCodes.push(assetCodes[a]);
                }
            }
        }

        return customCodes;
    };

    /**
     * Load and return user's custom anchor accounts (name+domain).
     * @return Array of new Account instances
     */
    var loadAnchors = function() {
        const COOKIE_NAME = "ANCHORS=";
        var customAnchors = new Array();
        var cookieText = document.cookie;
        if (cookieText.length <= 0) {
            return customAnchors;
        }

        var parts = cookieText.split(";");
        for (var i=0; i<parts.length; i++) {
            var part = parts[i];
            if (part.indexOf(COOKIE_NAME) == 0) {
                var anchors = part.substr(COOKIE_NAME.length).split("|");       //TODO: sanitize "|" in anchor name
                for (var a=0; a<anchors.length; a++) {
                    var anchorText = anchors[a];
                    var dashIndex = anchorText.indexOf("-");                    //TODO: sanitize "-" and ";" in anchor name
                    var address = anchorText.substr(0, dashIndex);
                    var domain = anchorText.substr(dashIndex+1);
                    customAnchors.push(new Account(address, domain, domain));
                }
            }
        }

        return customAnchors;
    };

    /**
     * Loads user's custom defined assets (code + anchor)
     */
    var loadAssets = function() {
        var cookieText = document.cookie;
        if (cookieText.length <= 0) {
            return;
        }
    };

    var serializeToCookie = function(){
        var cookieText = "aco=";
        //Asset codes
        var i = 0;
        for (i = 0; i<_this.CustomAssetCodes.length; i++) {
            if (i>0) {
                cookieText += "|";
            }
            cookieText += _this.CustomAssetCodes[i];
        }

        //Anchors
        cookieText += ";iss=";
        for (i=0; i<_this.CustomAnchors.length; i++) {
            var anchor = _this.CustomAnchors[i];
            if (i>0) {
                cookieText += "|"
            }
            cookieText = anchor.Address + "-" + anchor.Domain;
        }

        //Assets
        cookieText += ";ass=";
        for (i=0; i<_this.CustomAssets.length; i++) {
            var asset = _this.CustomAssets[i];
            if (i>0) {
                cookieText += "|";
            }
            //Format "asset_code"-"issuer_address"
            cookieText += asset.AssetCode + "-" + asset.Issuer.Address;
        }
    };

    loadAssetCodes();
    loadAnchors();
    loadAssets();
})();
