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


    /** @public User's custom defined asset codes */
    this.getCustomAssetCodes = function() { return _customAssetCodes; };

    /**
     * Get all asset codes (i.e. common ones + custom defined by the user) excluding native XLM
     * @public
     */
    this.getAllAssetCodes = function() {
        return _commonAssetCodes.concat(_customAssetCodes).slice(1);   //Exclude XLM
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

    /** @public Custom anchors defined by the user */
    this.getCustomAnchors = function() { return _customAnchors; }

    /**
     * All anchors, i.e. common + user defined (even if they aren't used in a custom asset)
     * @public
     */
    this.getAllAnchors = function() {
        return _commonAnchors.concat(_customAnchors);
    };

    /** @public User's custom defined assets */
    this.getCustomAssets = function() { return _customAssets; }

    /**
     * Get array of assets available to the user (i.e. common assets + user's custom assets)
     * @private
     */
    const getAvailableAssets = function() {
        return _commonAssets.concat(_customAssets);
    };

    /** @public Return custom exchanges (i.e. array of ExchangePair objects) defined by the user */
    this.getCustomExchanges = function() { return _customExchanges; }

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
        //NOTE: user can register a known anchor. In that case first mathing address is returned
        const anchors = _this.getAllAnchors();          
        for (let i=0; i<anchors.length; i++) {
            if (address === anchors[i].Address) {
                return anchors[i];
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
     * @public
     * @param {string} address - Valid Stellar public key
     * @param {string} domain - optional domain or any name describing the anchor
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
     * @public
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
            if (assetCode === _customAssets[i].AssetCode && issuerAddress === _customAssets[i].Issuer.Address) {
                return false;
            }
        }
        //Try to match the address with known issuer.
        let issuer = null;
        const anchors = _this.getAllAnchors();
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

    /** @public Add dummy pair (XLM/XLM) to custom exchanges, return the instance. */
    this.CreateCustomExchange = function() {
        const id = (new Date()).getTime();
        const newExchange = new ExchangePair(id, KnownAssets.XLM, KnownAssets.XLM);
        _customExchanges.push(newExchange);
        serializeToCookie();

        return newExchange;
    };

    /** @public Change custom exchange with given ID */
    this.UpdateCustomExchange = function(exchangeId, baseAssetCode, baseIssuerAddress, counterAssetCode, counterIssuerAddress) {
        for (let i=0; i<_customExchanges.length; i++) {
            if (_customExchanges[i].getId() === exchangeId) {
                const baseAnchor = getAnchorByAddress(baseIssuerAddress);
                const counterAnchor = getAnchorByAddress(counterIssuerAddress);
                const baseAsset = new Asset(baseAssetCode, baseAssetCode, null, baseAnchor);
                const counterAsset = new Asset(counterAssetCode, counterAssetCode, null, counterAnchor);

                _customExchanges[i] = new ExchangePair(exchangeId, baseAsset, counterAsset);
            }
        }

        return false;
    };

    /** @public Delete exchange by its ID in the array of custom exchanges */
    this.RemoveCustomExchange = function(exchangeId) {
        for (let i=0; i<_customExchanges.length; i++) {
            if (_customExchanges[i].getId() === exchangeId) {
                _customExchanges.splice(i, 1);
                serializeToCookie();
                return true;
            }
        }

        return false;
    };

    /** @private Loads user's custom defined asset codes from cookie */
    const loadAssetCodes = function() {
        const COOKIE_NAME = "aco=";
        const customCodes = new Array();
        const cookieText = document.cookie;
        if (cookieText.length <= 0) {
            return customCodes;
        }

        const parts = cookieText.split(";");
        for (let i=0; i<parts.length; i++) {
            const part = parts[i].trim();
            if (part.indexOf(COOKIE_NAME) == 0) {
                const assetCodes = part.substr(COOKIE_NAME.length).split(",");
                for (let a=0; a<assetCodes.length; a++) {
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
     * @private
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
                const anchors = part.substr(COOKIE_NAME.length).split(",");
                for (let a=0; a<anchors.length; a++) {
                    if ((anchors[a] || "").length <= 0) {
                        continue;
                    }
                    const anchorText = decodeURIComponent(anchors[a]);
                    const dashIndex = anchorText.indexOf("/");
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
     * @private
     * @param issuerAddress - public key of an issuer
     * @returns {Account} - first issuer with given address or NULL if no such is registered here
     */
    const getAnchorByAddress = function(issuerAddress) {
        if ((issuerAddress || "").length <= 0) {
            //Probably native issuer
            return null;
        }

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
        for (let i=0; i<parts.length; i++) {
            const part = parts[i].trim();
            if (part.indexOf(COOKIE_NAME) == 0) {
                const assets = part.substr(COOKIE_NAME.length).split(",");
                for (let a=0; a<assets.length; a++) {
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

    /**
     * Load user's custom exchanges
     * @private
     * @returns {Array} array of ExchangePair instances
     */
    const loadExchanges = function() {
        const COOKIE_NAME = "exc=";
        const userExchanges = new Array();
        const cookieText = document.cookie;
        if (cookieText.length <= 0) {
            return;
        }

        const parts = cookieText.split(";");
        for (let i=0; i<parts.length; i++) {
            const part = parts[i].trim();
            if (part.indexOf(COOKIE_NAME) == 0) {
                const exchanges = part.substr(COOKIE_NAME.length).split(",");
                for (let e=0; e<exchanges.length; e++) {
                    if ((exchanges[e] || "").length <= 0) {
                        continue;
                    }
                    const exchangeText = decodeURIComponent(exchanges[e]);      //Format: 5366025104=USD-GABCDEFGH/XYZ-GBGBGBGBGBGBGBGB
                    const eqSignIndex = exchangeText.indexOf("=");
                    const id = parseInt(exchangeText.substr(0, eqSignIndex));
                    const slashIndex = exchangeText.indexOf("/");
                    //Base asset
                    const baseAssetText = exchangeText.substr(eqSignIndex+1, slashIndex);
                    let dashIndex = baseAssetText.indexOf("-");
                    const baseAssetCode = baseAssetText.substr(0, dashIndex);
                    const baseIssuerAddress = baseAssetText.substr(dashIndex+1);
                    const baseIssuer = getAnchorByAddress(baseIssuerAddress);           //BUG: what if the user removed the issuer on Configuration? TODO
                    const baseAsset = new Asset(baseAssetCode, baseAssetCode, null, baseIssuer);
                    //Counter asset
                    const counterAssetText = exchangeText.substr(slashIndex+1);
                    dashIndex = counterAssetText.indexOf("-");
                    const counterAssetCode = counterAssetText.substr(0, dashIndex);
                    const counterIssuerAddress = counterAssetText.substr(dashIndex+1);
                    const counterIssuer = getAnchorByAddress(counterIssuerAddress);     //BUG: what if the user removed the issuer on Configuration? TODO
                    const counterAsset = new Asset(counterAssetCode, counterAssetCode, null, counterIssuer);

                    userExchanges.push(new ExchangePair(id, baseAsset, counterAsset));
                }
            }
        }

        return userExchanges;
    };

    /** @private Dump all the custom data into browser cookie */
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

        cookieText = "";
        for (let e=0; e<_customExchanges.length; e++) {
            const exchange = _customExchanges[e];
            if (e>0) {
                cookieText += ",";
            }
            //Format 99012367=ABC-GGGGGGGGGG/XYZ-GA2222222222222222
            cookieText += exchange.getId() + "=" +
                          exchange.getBaseAsset().AssetCode + "-" + exchange.getBaseAsset().Issuer.Address + "/" +
                          exchange.getCounterAsset().AssetCode + "-" + exchange.getCounterAsset().Issuer.Address;
        }
        setCookieValue("exc", cookieText)
    };

    const setCookieValue = function(key, value) {
        const expiration = new Date();
        expiration.setTime(expiration.getTime() + (700*24*60*60*1000));  //Make it expire in 700 days
        document.cookie = key + "=" + value + ";expires=" + expiration.toUTCString();
    };

    const _customAssetCodes = loadAssetCodes();
    const _customAnchors = loadAnchors();
    const _customAssets = loadAssets();
    const _customExchanges = loadExchanges();

    //Return the singleton instance
    return _this;
})();
