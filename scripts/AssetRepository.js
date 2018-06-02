/**
 * Client-side "database" stored in a cookie.
 */
var AssetRepository = {
    /**
     * Loads user's custom defined assets
     */
    LoadAssets: function() {
        var cookieText = document.cookie;
        if (cookieText.length <= 0) {
            return;
        }
    },

    /**
     * Load and return user's custom anchor accounts (name+domain).
     * @return Array of new Account instances
     */
    LoadAnchors: function() {
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
                    var dashIndex = anchorText.indexOf("=");                    //TODO: sanitize "=" and ";" in anchor name
                    var address = anchorText.substr(0, dashIndex);
                    var domain = anchorText.substr(dashIndex+1);
                    customAnchors.push(new Account(address, domain, domain))
                }
            }
        }

        return customAnchors;
    }
};
