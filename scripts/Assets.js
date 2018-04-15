/**
 * Asset on Stellar ledger
 */
function Asset(code, type, issuerAddress, issuerName) {
    this.AssetCode = code || "XLM";
    this.AssetType = type;
    this.Issuer = issuerAddress;
    this.IssuerName = issuerName;

    this.ToUrlParameters = function(prefix) {
        var getParams = prefix + "_asset_code=" + this.AssetCode + "&" + prefix + "_asset_type=" + this.AssetType;
        if (this.Issuer) {
            getParams += "&" + prefix + "_asset_issuer=" + this.Issuer;
        }

        return getParams;
    }
}


var KnownAssets = {
    "XLM": new Asset("XLM", "native", null, null),
    "CNY-RippleFox": new Asset("CNY", "credit_alphanum4", "GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX", "RippleFox"),
    "MOBI": new Asset("MOBI", "credit_alphanum4", "GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH", "Mobius.network"),
    "RMT": new Asset("RMT", "credit_alphanum4", "GCVWTTPADC5YB5AYDKJCTUYSCJ7RKPGE4HT75NIZOUM4L7VRTS5EKLFN", "SureRemit.co")
};
