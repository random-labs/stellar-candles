let myExchangesUi = null;

$(function() {
    myExchangesUi = new MyExchanges();
});


/**
 * UI model to the page "My Exchanges"
 * @constructor
 */
function MyExchanges() {



    //Load current list of user's custom exchanges
    const exchanges = AssetRepository.getCustomExchanges();
}
