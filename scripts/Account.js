/**
 * Account on Stellar ledger
 */
function Account(address, shortName, domain) {
    this.Address = address;
    this.ShortName = shortName;
    this.Domain = domain;
}

var KnownAccounts = {
    "Anclax" : new Account("GAEDLNMCQZOSLY7Y4NW3DTEWQEVVCXYYMBDNGPPGBMQH4GFYECBI7YVK", "Anclax", "anclax.com"),
    "Astral9" : new Account("GAUWES2POH347NNJGRI4OBM34LMOCMWSTZ3RAOZMOBH4PFVBWFMHLNTC", "Astral9", "astral9.io"),
    "AtlantisBlue" : new Account("GDZURZR6RZKIQVOWZFWPVAUBMLLBQGXP2K5E5G7PEOV75IYPDFA36WK4", "AtlantisBlue", "atlantisblue.org"),
    "CharnaToken" : new Account("GBRPTWEZTUKYM6VJXLHXBFI23M2GSY3TCVIQSZKFQLMOJXH7VPDGKBDP", "CharnaToken", "charnatoken.top"),
    "CoinsAsia" : new Account("GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP", "CoinsAsia", "coins.ph"),
    "Cowrie" : new Account("GAWODAROMJ33V5YDFY3NPYTHVYQG7MJXVJ2ND3AOGIHYRWINES6ACCPD", "Cowrie", "cowrie.exchange"),
    "CryptoMover10" : new Account("GDBCHKTHJUKDGSIQSTBUXFWVP3QVART5LED6KRZQ5X4Z5WLT4BGYXWCI", "CryptoMover", "cryptomover.com"),
    "CryptoMover3" : new Account("GDU2FEL6THGGOFDHHP4I5FHNWY4S2SXYUBCEDB5ZREMD6UFRT4SYWSW2", "CryptoMover", "cryptomover.com"),
    "CryptoMoverA" : new Account("GBWZHAVWY23QKKDJW7TXLSIHY5EX4NIB37O4NMRKN2SKNWOSE5TEPCY3", "CryptoMover", "cryptomover.com"),
    "CryptoTari" : new Account("GD7UVDDJHJYKUXB4SJFIC6VJDQ4YADQCMRN3KLHJFV4H6NIUAEREVCO7", "CryptoTari", "cryptotari.io"),
    "eQuid" : new Account("GCGEQJR3E5BVMQYSNCHPO6NPP3KOT4VVZHIOLSRSNLE2GFY7EWVSLLTN", "eQuid", "equid.co"),
    "Golix" : new Account("GCYK67DDGBOANS6UODJ62QWGLEB2A7JQ3XUV25HCMLT7CI23PMMK3W6R", "Golix", "golix.io"),
    "IreneEnergy" : new Account("GBBRMEXJMS3L7Y3DZZ2AHBD545GZ72OAEHHEFKGZAHHASHGWMHK5P6PL", "IreneEnergy", "irene.energy"),
    "Liquido" : new Account("GD2RRX6BKVTORZ6RIMBLWFVUOAYOLTS2QFJQUQPXLI3PBHR3TMLQNGZX", "Liquido", "liquido.i-server.org"),
    "Mobius" : new Account("GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH", "Mobius", "mobius.network"),
    "Moni" : new Account("GAKBPBDMW6CTRDCXNAPSVJZ6QAN3OBNRG6CWI27FGDQT2ZJJEMDRXPKK", "Moni", "moni.com"),
    "NaoBTC" : new Account("GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH", "NaoBTC", "naobtc.com"),
    "NaoXEL" : new Account("GAXELY4AOIRVONF7V25BUPDNKZYIVT6CWURG7R2I6NQU26IQSQODBVCS", "NaoBTC", "naobtc.com"),
    "Papaya1" : new Account("GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR", "Papaya", "apay.io"),   //Does ERC-20 tokens
    "Papaya2" : new Account("GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF", "Papaya", "apay.io"),   //Does only BTC
    "Papaya3" : new Account("GC5LOR3BK6KIOK7GKAUD5EGHQCMFOGHJTC7I3ELB66PTDFXORC2VM5LP", "Papaya", "apay.io"),   //Does only LTC
    "Papaya4" : new Account("GAEGOS7I6TYZSVHPSN76RSPIVL3SELATXZWLFO4DIAFYJF7MPAHFE7H4", "Papaya", "apay.io"),   //Does only BCH
    "RippleFox" : new Account("GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX", "RippleFox", "ripplefox.com"),
    "RepoCoin" : new Account("GCZNF24HPMYTV6NOEHI7Q5RJFFUI23JKUKY3H3XTQAFBQIBOHD5OXG3B", "RepoCoin", "repocoin.io"),
    "SmartLands": new Account("GCKA6K5PCQ6PNF5RQBF7PQDJWRHO6UOGFMRLK3DYHDOI244V47XKQ4GP", "SmartLands", "smartlands.io"),
    "StemChain" : new Account("GAFXX2VJE2EGLLY3EFA2BQXJADAZTNR7NC7IJ6LFYPSCLE7AI3AK3B3M", "StemChain", "stemchain.io"),
    "Stronghold" : new Account("GBSTRH4QOTWNSVA6E4HFERETX4ZLSR3CIUBLK7AXYII277PFJC4BBYOG", "Stronghold", "stronghold.co"),
    "SureRemit" : new Account("GCVWTTPADC5YB5AYDKJCTUYSCJ7RKPGE4HT75NIZOUM4L7VRTS5EKLFN", "SureRemit", "sureremit.co"),
    "TaiChiChain" : new Account("GDVJQHR5JZIGW76WBQREFMTYZ3JAKLSX2JTNT2P6DI4M7JR7VHUCNODY", "TaiChiChain", "taichichain.org"),
    "Tempo" : new Account("GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S", "Tempo", "tempo.eu.com"),
    "VcBearBTC" : new Account("GDXTJEK4JZNSTNQAWA53RZNS2GIKTDRPEUWDXELFMKU52XNECNVDVXDI", "VCBear", "vcbear.net"),
    "VcBearJPY" : new Account("GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM", "VCBear", "vcbear.net"),
    "VcBearXRP" : new Account("GA7FCCMTTSUIC37PODEL6EOOSPDRILP6OQI5FWCWDDVDBLJV72W6RINZ", "VCBear", "vcbear.net"),
    "XimCoin" : new Account("GBZ35ZJRIKJGYH5PBKLKOZ5L6EXCNTO7BKIL7DAVVDFQ2ODJEEHHJXIM", "XimCoin", "ximcoin.com"),
    "Xirkle" : new Account("GAO4DADCRAHA35GD6J3KUNOB5ELZE5D6CGPSJX2WBMEQV7R2M4PGKJL5", "Xirkle", "xirkle.com")
};
