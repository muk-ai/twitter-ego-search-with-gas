"use strict";
function myFunction() {
    var url = PropertiesService.getScriptProperties().getProperty('webhook_url');
    if (url) {
        Logger.log(url);
    }
}
