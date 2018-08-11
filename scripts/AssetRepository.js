/**
 * Client-side "database" stored in a cookie. Singleton instance.
 */
var AssetRepository = (function () {
    var _this = this;
    //TODO: KnownAssets should be moved here
    this.CustomAssetCodes = new Array();            //TODO: getters + private setters
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
        serializeToCookie();
    };

    /**
     * Add new issuer (a.k.a. anchor).
     * @param address - Valid Stellar public key
     * @param domain - optional domain or any name describing the anchor
     * @returns {boolean} - true on success, false if an issuer with given address already exists
     */
    this.AddCustomAnchor = function(address, domain) {
        //Don't add if it's already there
        for (var i=0; i < _this.CustomAnchors.length; i++) {
            if (_this.CustomAnchors[i].Address === address) {
                return false;
            }
        }
        _this.CustomAnchors.push(new Account(address, domain, domain));
        serializeToCookie();
        return true;
    };

    this.RemoveCustomAnchor = function(address) {
        for (var i=0; i < _this.CustomAnchors.length; i++) {
            if (_this.CustomAnchors[i].Address === address) {
                _this.CustomAnchors.splice(i, 1);
                serializeToCookie();
                return true;
            }
        }
        //No such anchor, nothing to remove
        return false;
    }
    /**
     * Loads user's custom defined asset codes from cookie
     */
    var loadAssetCodes = function() {
        var COOKIE_NAME = "aco=";
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
     * @return Array of Account instances
     */
    var loadAnchors = function() {
        const COOKIE_NAME = "iss=";
        var customAnchors = new Array();
        const cookieText = document.cookie;
        if (cookieText.length <= 0) {
            return customAnchors;
        }

        var parts = cookieText.split(";");
        for (var i=0; i<parts.length; i++) {
            const part = parts[i].trim();
            if (part.indexOf(COOKIE_NAME) == 0) {
                var anchors = part.substr(COOKIE_NAME.length).split(",");       //TODO: sanitize "," in anchor name
                for (var a=0; a<anchors.length; a++) {
                    if ((anchors[a] || "").length <= 0) {
                        continue;
                    }
                    var anchorText = decodeURIComponent(anchors[a]);
                    var dashIndex = anchorText.indexOf("/");                    //TODO: sanitize "/" and ";" in anchor name
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
        var cookieText = "";
        //Asset codes
        var i = 0;
        for (i = 0; i<_this.CustomAssetCodes.length; i++) {
            if (i>0) {
                cookieText += "|";
            }
            cookieText += _this.CustomAssetCodes[i];
        }
        setCookieValue("aco", cookieText);

        //Anchors
        cookieText = "";
        for (i=0; i<_this.CustomAnchors.length; i++) {
            var anchor = _this.CustomAnchors[i];
            if (i>0) {
                cookieText += ","
            }
            cookieText += encodeURIComponent(anchor.Address + "/" + anchor.Domain);
        }
        setCookieValue("iss", cookieText);

        //Assets
        cookieText = "";
        for (i=0; i<_this.CustomAssets.length; i++) {
            var asset = _this.CustomAssets[i];
            if (i>0) {
                cookieText += "|";
            }
            //Format "asset_code"-"issuer_address"
            cookieText += asset.AssetCode + "-" + asset.Issuer.Address;
        }
        setCookieValue("ass", cookieText);
    };

    var setCookieValue = function(key, value) {
        var expiration = new Date();
        expiration.setTime(expiration.getTime() + (1234*24*60*60*1000));  //Make it expire in 1234 days
        document.cookie = key + "=" + value + ";expires=" + expiration.toUTCString();
    };

    loadAssetCodes();
    this.CustomAnchors = loadAnchors();
    loadAssets();

    //Return the actual singleton instance
    return _this;
})();
