/**
 * Client-side "database" stored in a cookie. Singleton instance.
 * @static
 */
const AssetRepository = (function () {
    const _this = this;
    const _commonAssets = [
        KnownAssets.XLM,
        KnownAssets["BTC-NaoBTC"],
        KnownAssets["BTC-Papaya"],
        KnownAssets["BTC-Stronghold"],
        KnownAssets["BTC-vcbear"],
        KnownAssets["CNY-RippleFox"],
        KnownAssets["ETH-Papaya"],
        KnownAssets["ETH-Stronghold"],
        KnownAssets.EURT,
        KnownAssets.HKDT,
        KnownAssets["LTC-Papaya"],
        KnownAssets.MOBI,
        KnownAssets.NGNT,
        KnownAssets.PHP,
        KnownAssets.REPO,
        KnownAssets.RMT,
        KnownAssets.SLT,
        KnownAssets["USD-Golix"],
        KnownAssets["USD-Stonghold"]
    ];
    const _commonAssetCodes = new Array();
    const _commonAnchors = new Array();

    //Derive common asset codes and anchors from assets
    for (let i=0; i<_commonAssets.length; i++) {
        //Take asset codes from the common assets
        const assetCode = _commonAssets[i].AssetCode;
        if (-1 === _commonAssetCodes.indexOf(assetCode)) {
            _commonAssetCodes.push(assetCode);
        }
        //Take anchors from the common assets
        const anchor = _commonAssets[i].Issuer;
        if (-1 === _commonAnchors.indexOf(anchor)) {
            _commonAnchors.push(anchor);
        }
    }


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
     * Get array of asset codes available to the user (i.e. basic ones + from user's custom assets).
     * @public
     */
    this.getAssetCodesForExchange = function() {
        const codes = _commonAssetCodes.slice();
        for (let i = 0; i < _customAssets.length; i++) {
            //Filter out overlaps
            if (-1 === codes.indexOf(_customAssets[i].AssetCode)) {
                codes.push(_customAssets[i].AssetCode);
            }
        }

        return codes;
    };

    /**
     * Custom anchors defined by the user
     * @public
     */
    this.getCustomAnchors = function() { return _customAnchors; }

    /**
     * All anchors, i.e. common + user defined (even if they aren't used in a custom asset)
     * @public
     */
    this.getAllAnchors = function() {
        return _commonAnchors.concat(_customAnchors);
    };

    /**
     * Get array of issuers available to the user (i.e. basic + custom)
     */
    this.getAvailableAnchors = function() {
        const anchors = _commonAnchors.slice();
        for (let i=0; i<_customAssets.length; i++) {
            //Filter out overlaps
            if (-1 === anchors.indexOf(_customAssets[i].Issuer)) {
                anchors.push(_customAssets[i].Issuer);
            }
        }

        return anchors;
    };

    /**
     * User's custom defined assets
     * @public
     */
    this.getCustomAssets = function() { return _customAssets; }

    /**
     * Get array of assets available to the user (i.e. common assets + user's custom assets)
     * @private
     */
    const getAvailableAssets = function() {
        return _commonAssets.concat(_customAssets);
    };

    /**
     * Returns all available anchors issuing given asset code.
     * @param {string} assetCode - Asset code, ideally one from available assets
     */
    this.GetIssuersByAssetCode = function (assetCode) {
        const issuers = new Array();
        const assets = getAvailableAssets();
        for (let i=0; i<assets.length; i++) {
            if (assetCode === assets[i].AssetCode) {
                issuers.push(assets[i].Issuer);
            }
        }

        return issuers;
    };

    /**
     * Return first anchor from that issues given asset code or NULL if there's no such among available anchors
     * @param {string} assetCode - Asset code
     */
    this.GetFirstIssuerAddress = function(assetCode) {
        const assets = getAvailableAssets();
        for (let i=0; i<assets.length; i++) {
            if (assetCode === assets[i].AssetCode) {
                return assets[i].Issuer.Address;
            }
        }

        return null;
    };

    /**
     * Return anchor with given address or NULL if there's no such among available anchors
     * @param {string} address 
     */
    this.GetIssuerByAddress = function(address) {
        const anchors = _this.getAva
        for (var account in KnownAccounts) {
            if (KnownAccounts[account].Address === address) {
                return KnownAccounts[account];
            }
        }

        return null;
    };

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
        for (let i=0; i<_customAssets.length; i++) {
            if (_customAssets[i].AssetCode === assetCode && _customAssets[i].Issuer.Address) {
                return false;
            }
        }
        //Try to match the address with known issuer.
        let issuer = null;
        var anchors = _this.getAvailableAnchors();
        for (let a=0; a<anchors.length; a++) {
            if (issuerAddress === anchors[a].Address) {
                issuer = anchors[a];
                break;
            }
        }

        //Not a problem if issuer's not found (user might have deleted anchor meanwhile), simply crate a dummy
        if (null === issuer) {
            issuer = new Account(issuerAddress, null, null);
        }

        const newAsset = new Asset(assetCode, assetCode, null, issuer);
        _customAssets.push(newAsset);
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
        for (var i=0; i<_customAssets.length; i++) {
            if (_customAssets[i].AssetCode === assetCode && _customAssets[i].Issuer.Address) {
                _customAssets.splice(i, 1);
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
        for (i=0; i<_customAssets.length; i++) {
            const asset = _customAssets[i];
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
    const _customAssets = loadAssets();

    //Return the singleton instance
    return _this;
})();
