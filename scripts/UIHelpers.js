$(function(){
    /**
     * Static components loading engine. Replaces any <sc-include src='component.html'> element with respective
     * markup defined in the file from "src" attribute. Dynamic templates are currently not supported.
     */
    $("sc-include").each(function() {
        const sourceFile = $(this).attr("src");
        if (sourceFile) {
            $(this).load(sourceFile);
        }
    });
});
