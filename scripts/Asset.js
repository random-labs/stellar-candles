/**
 * Asset on Stellar ledger
 */
function Asset(code, type, account) {
    this.AssetCode = code || "XLM";
    this.AssetType = type;
    this.Issuer = account.Address;

    this.ToUrlParameters = function(prefix) {
        var getParams = prefix + "_asset_code=" + this.AssetCode + "&" + prefix + "_asset_type=" + this.AssetType;
        if (this.Issuer) {
            getParams += "&" + prefix + "_asset_issuer=" + this.Issuer;
        }

        return getParams;
    };
}


var KnownAssets = {
    "XLM" : new Asset("XLM", "native", {Address:null}),
    "BAT" : new Asset("BAT", "credit_alphanum4", KnownAccounts.Papaya1),
    "BTC-Golix" : new Asset("BTC", "credit_alphanum4", KnownAccounts.Golix),
    "BCH-Papaya" : new Asset("BCH", "credit_alphanum4", KnownAccounts.Papaya4),
    "BTC-Liquido" : new Asset("BTC", "credit_alphanum4", KnownAccounts.Liquido),
    "BTC-NaoBTC" : new Asset("BTC", "credit_alphanum4", KnownAccounts.NaoBTC),
    "BTC-Papaya" : new Asset("BTC", "credit_alphanum4", KnownAccounts.Papaya2),
    "BTC-Stronghold" : new Asset("BTC", "credit_alphanum4", KnownAccounts.Stronghold),
    "BTC-vcbear" : new Asset("BTC", "credit_alphanum4", KnownAccounts.VcBearBTC),
    "CHRC" : new Asset("CHRC", "credit_alphanum4", KnownAccounts.CharnaToken),
    "CM3" : new Asset("CM3", "credit_alphanum4", KnownAccounts.CryptoMover3),
    "CM10" : new Asset("CM10", "credit_alphanum4", KnownAccounts.CryptoMover10),
    "CMA" : new Asset("CMA", "credit_alphanum4", KnownAccounts.CryptoMoverA),
    "CNY-RippleFox" : new Asset("CNY", "credit_alphanum4", KnownAccounts.RippleFox),
    "COP" : new Asset("COP", "credit_alphanum4", KnownAccounts.Anclax),
    "EQD" : new Asset("EQD", "credit_alphanum4", KnownAccounts.eQuid),
    "ETH-Liquido" : new Asset("ETH", "credit_alphanum4", KnownAccounts.Liquido),
    "ETH-Papaya" : new Asset("ETH", "credit_alphanum4", KnownAccounts.Papaya1),
    "ETH-Stronghold" : new Asset("ETH", "credit_alphanum4", KnownAccounts.Stronghold),
    "EUR-Moni" : new Asset("EUR", "credit_alphanum4", KnownAccounts.Moni),
    "EURT" : new Asset("EURT", "credit_alphanum4", KnownAccounts.Tempo),
    "ICN" : new Asset("ICN", "credit_alphanum4", KnownAccounts.Papaya1),
    "JPY" : new Asset("JPY", "credit_alphanum4", KnownAccounts.VcBearJPY),
    "KIN-Papaya" : new Asset("KIN", "credit_alphanum4", KnownAccounts.Papaya1),
    "LINK" : new Asset("LINK", "credit_alphanum4", KnownAccounts.Papaya1),
    "LTC-Liquido" : new Asset("LTC", "credit_alphanum4", KnownAccounts.Liquido),
    "LTC-Papaya" : new Asset("LTC", "credit_alphanum4", KnownAccounts.Papaya3),
    "MOBI" : new Asset("MOBI", "credit_alphanum4", KnownAccounts.Mobius),
    "MTL" : new Asset("MTL", "credit_alphanum4", KnownAccounts.Papaya1),
    "NGNT" : new Asset("NGNT", "credit_alphanum4", KnownAccounts.Cowrie),
    "OMG" : new Asset("OMG", "credit_alphanum4", KnownAccounts.Papaya1),
    "PHP" : new Asset("PHP", "credit_alphanum4", KnownAccounts.CoinsAsia),
    "REP" : new Asset("REP", "credit_alphanum4", KnownAccounts.Papaya1),
    "REPO" : new Asset("REPO", "credit_alphanum4", KnownAccounts.RepoCoin),
    "RMT": new Asset("RMT", "credit_alphanum4", KnownAccounts.SureRemit),
    "SALT" : new Asset("SALT", "credit_alphanum4", KnownAccounts.Papaya1),
    "SLT" : new Asset("SLT", "credit_alphanum4", KnownAccounts.SmartLands),
    "STEM" : new Asset("STEM", "credit_alphanum4", KnownAccounts.StemChain),
    "TARI" : new Asset("TARI", "credit_alphanum4", KnownAccounts.CryptoTari),
    "TELLUS" : new Asset("TELLUS", "credit_alphanum12", KnownAccounts.IreneEnergy),
    "USD-Golix" : new Asset("USD", "credit_alphanum4", KnownAccounts.Golix),
    "XA9" : new Asset("XA9", "credit_alphanum12", KnownAccounts.Astral9),
    "XEL" : new Asset("XEL", "credit_alphanum4", KnownAccounts.NaoXEL),
    "XIM" : new Asset("XIM", "credit_alphanum4", KnownAccounts.XimCoin),
    "XIR" : new Asset("XIR", "credit_alphanum4", KnownAccounts.Xirkle),
    "XLM-Stronghold" : new Asset("XLM", "credit_alphanum4", KnownAccounts.Stronghold),     //WTF?
    "XLQ": new Asset("XLQ", "credit_alphanum4", KnownAccounts.Liquido),
    "XTC": new Asset("XTC", "credit_alphanum4", KnownAccounts.TaiChiChain),
    "ZRX": new Asset("ZRX", "credit_alphanum4", KnownAccounts.Papaya1)
};
