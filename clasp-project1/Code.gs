"use strict";
function myFunction() {
    var url = PropertiesService.getScriptProperties().getProperty('webhook_url');
    if (url) {
        Logger.log(url);
        postSlack(url);
    }
}
function postSlack(url) {
    var jsonData = {
        username: 'bot-x',
        icon_emoji: ':chicken:',
        text: 'test',
    };
    var payload = JSON.stringify(jsonData);
    var options = {
        method: 'post',
        contentType: 'application/json',
        payload: payload,
    };
    UrlFetchApp.fetch(url, options);
}
