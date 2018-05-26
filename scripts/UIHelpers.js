$(function(){
    /**
     * Static components loading engine. Replaces any <include src='component.html'> element with respective
     * markup defined in the file from "src" attribute. Dynamic templates are currently not supported.
     */
    $("include").each(function() {
        var sourceFile = $(this).attr("src");
        if (sourceFile) {
            $(this).load(sourceFile);
        }
    });
});
