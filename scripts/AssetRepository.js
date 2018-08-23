/**
 * Client-side "database" stored in a cookie. Singleton instance.
 * @static
 */
const AssetRepository = (function () {
    const _this = this;
    const _commonAssetCodes = ["XLM", "BTC", "CNY", "ETH", "EURT", "HKDT", "LTC", "MOBI", "PHP", "REPO", "RMT", "SLT", "TERN", "USD"];

    /**
     * Get array of asset codes available to the user (i.e. basic ones + from user's custom assets).
     * @public
     */
    this.getAvailableAssetCodes = function() {
        const fromAssets = new Array();
        for (let i = 0; i < _this.CustomAssets.length; i++) {
            fromAssets.push(_this.CustomAssets[i].AssetCode)
        }
        return _commonAssetCodes.concat(fromAssets);   //TODO: consider performance. This is called way to many times
    };

    /**
     * User's custom defined asset codes
     * @public
     */
    this.getCustomAssetCodes = function() { return _customAssetCodes; };

    /**
     * Get all asset codes, i.e. common ones + custom defined by the user
     * @public
     */
    this.getAllAssetCodes = function() {
        return _commonAssetCodes.concat(_customAssetCodes);
    };

    /**
     * User's custom defined issuers
     */
    this.getCustomAnchors = function() { return _customAnchors; };
    this.CustomAssets = new Array();            //TODO: getter + private setter

    /**
     * Add new asset code (e.g. "USD", "BTC"...)
     * @param {string} assetCode - up to 12 chars of new asset code
     * @returns {boolean} - true on success, false if given asset type already exists
     */
    this.AddCustomAssetCode = function(assetCode) {
        //Don't add if it's already there
        for (let i=0; i<_customAssetCodes.length; i++) {
            if (_customAssetCodes[i] === assetCode) {
                return false;
            }
        }
        _customAssetCodes.push(assetCode);
        serializeToCookie();
        return true;
    };

    this.RemoveCustomAssetCode = function(assetCode) {
        for (let i=0; i < _customAssetCodes.length; i++) {
            if (_customAssetCodes[i] === assetCode) {
                _customAssetCodes.splice(i, 1);
                serializeToCookie();
                return true;
            }
        }
        //No such asset type, nothing to remove
        return false;
    };

    /**
     * Add new issuer (a.k.a. anchor).
     * @param address - Valid Stellar public key
     * @param domain - optional domain or any name describing the anchor
     * @returns {boolean} - true on success, false if an issuer with given address already exists
     */
    this.AddCustomAnchor = function(address, domain) {
        //Don't add if it's already there
        for (let i=0; i < _customAnchors.length; i++) {
            if (_customAnchors[i].Address === address) {
                return false;
            }
        }
        _customAnchors.push(new Account(address, domain, domain));
        serializeToCookie();
        return true;
    };

    /**
     * Remove custom issuer by their address
     * @param {string} address - anchor's issuing address
     */
    this.RemoveCustomAnchor = function(address) {
        for (let i=0; i < _customAnchors.length; i++) {
            if (_customAnchors[i].Address === address) {
                _customAnchors.splice(i, 1);
                serializeToCookie();
                return true;
            }
        }
        //No such anchor, nothing to remove
        return false;
    };

    /**
     * Add new asset with given code and issuer's address
     * @param {string} assetCode - existing asset code
     * @param {string} issuerAddress - address of an anchor
     * @returns {boolean} - true on success, false if given asset already exists
     */
    this.AddCustomAsset = function(assetCode, issuerAddress) {
        //Don't add if it's already there
        for (let i=0; i<_this.CustomAssets.length; i++) {
            if (_this.CustomAssets[i].AssetCode === assetCode && _this.CustomAssets[i].Issuer.Address) {
                return false;
            }
        }
        //Try to match the address with known issuer.
        let issuer = null;
        for (let a=0; a<_customAnchors.length; a++) {
            if (issuerAddress === _customAnchors[a].Address) {
                issuer = _customAnchors[a];
                break;
            }
        }

        //Not a problem if issuer's not found (user might have delete anchor meanwhile), simply use short address
        if (null === issuer) {
            issuer = new Account(issuerAddress, null, null);
        }

        const newAsset = new Asset(assetCode, assetCode, null, issuer);
        _this.CustomAssets.push(newAsset);
        serializeToCookie();
        return true;
    };

    /**
     * Remove existing asset with given code and issuer's address
     * @param {string} assetCode - asset code of a known asset
     * @param {string} issuerAddress - address of an anchor
     * @returns {boolean} - true on success, false if given asset is not registered here
     */
    this.RemoveCustomAsset = function(assetCode, issuerAddress) {
        for (var i=0; i<_this.CustomAssets.length; i++) {
            if (_this.CustomAssets[i].AssetCode === assetCode && _this.CustomAssets[i].Issuer.Address) {
                _this.CustomAssets.splice(i, 1);
                serializeToCookie();
                return true;
            }
        }
        //Asset isn't registered here
        return false;
    };


    /**
     * Loads user's custom defined asset codes from cookie
     * @private
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
            var part = parts[i].trim();
            if (part.indexOf(COOKIE_NAME) == 0) {
                var assetCodes = part.substr(COOKIE_NAME.length).split(",");       //TODO: sanitize "," in asset type
                for (var a=0; a<assetCodes.length; a++) {
                    if ((assetCodes[a] || "").length <= 0) {
                        continue;
                    }
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
    const loadAnchors = function() {
        const COOKIE_NAME = "iss=";
        const customAnchors = new Array();
        const cookieText = document.cookie;
        if (cookieText.length <= 0) {
            return customAnchors;
        }

        const parts = cookieText.split(";");
        for (let i=0; i<parts.length; i++) {
            const part = parts[i].trim();
            if (part.indexOf(COOKIE_NAME) == 0) {
                const anchors = part.substr(COOKIE_NAME.length).split(",");       //TODO: sanitize "," in anchor name
                for (let a=0; a<anchors.length; a++) {
                    if ((anchors[a] || "").length <= 0) {
                        continue;
                    }
                    const anchorText = decodeURIComponent(anchors[a]);
                    const dashIndex = anchorText.indexOf("/");                    //TODO: sanitize "/" and ";" in anchor name
                    const address = anchorText.substr(0, dashIndex);
                    const domain = anchorText.substr(dashIndex+1);
                    customAnchors.push(new Account(address, domain, domain));
                }
            }
        }

        return customAnchors;
    };

    /**
     * Get issuer by their Stellar address
     * @param issuerAddress - public key of an issuer
     * @returns {Account} - first issuer with given address or NULL if no such is registered here
     */
    const getAnchorByAddress = function(issuerAddress) {
        for (let i=0; i<_customAnchors.length; i++) {
            if (issuerAddress === _customAnchors[i].Address) {
                return _customAnchors[i];
            }
        }

        //Anchor not found among know issuers. Don't give up and create a dummy one
        return new Account(issuerAddress, null, null);
    };

    /**
     * Loads user's custom defined assets (code + anchor)
     * @private
     */
    const loadAssets = function() {
        const COOKIE_NAME = "ass=";
        const customAssets = new Array();
        const cookieText = document.cookie;
        if (cookieText.length <= 0) {
            return;
        }

        const parts = cookieText.split(";");
        for (var i=0; i<parts.length; i++) {
            const part = parts[i].trim();
            if (part.indexOf(COOKIE_NAME) == 0) {
                var assets = part.substr(COOKIE_NAME.length).split(",");
                for (var a=0; a<assets.length; a++) {
                    if ((assets[a] || "").length <= 0) {
                        continue;
                    }
                    const assetText = decodeURIComponent(assets[a]);
                    const dashIndex = assetText.indexOf("-");
                    const assetCode = assetText.substr(0, dashIndex);
                    const issuerAddress = assetText.substr(dashIndex+1);
                    const issuer = getAnchorByAddress(issuerAddress);
                    customAssets.push(new Asset(assetCode, assetCode, null, issuer));
                }
            }
        }

        return customAssets;
    };

    const serializeToCookie = function(){
        let cookieText = "";
        //Asset codes
        var i = 0;
        for (i = 0; i<_customAssetCodes.length; i++) {
            if (i>0) {
                cookieText += ",";
            }
            cookieText += _customAssetCodes[i];
        }
        setCookieValue("aco", cookieText);

        //Anchors
        cookieText = "";
        for (i=0; i<_customAnchors.length; i++) {
            const anchor = _customAnchors[i];
            if (i>0) {
                cookieText += ","
            }
            cookieText += encodeURIComponent(anchor.Address + "/" + anchor.Domain);
        }
        setCookieValue("iss", cookieText);

        //Assets
        cookieText = "";
        for (i=0; i<_this.CustomAssets.length; i++) {
            const asset = _this.CustomAssets[i];
            if (i>0) {
                cookieText += ",";
            }
            //Format "asset_code"-"issuer_address"
            cookieText += asset.AssetCode + "-" + asset.Issuer.Address;
        }
        setCookieValue("ass", cookieText);
    };

    const setCookieValue = function(key, value) {
        const expiration = new Date();
        expiration.setTime(expiration.getTime() + (700*24*60*60*1000));  //Make it expire in 700 days
        document.cookie = key + "=" + value + ";expires=" + expiration.toUTCString();
    };

    const _customAssetCodes = loadAssetCodes();
    const _customAnchors = loadAnchors();
    this.CustomAssets = loadAssets();

    //Return the singleton instance
    return _this;
})();
