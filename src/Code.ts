declare var global: any;

global.myFunction = function myFunction() {
  const url = PropertiesService.getScriptProperties().getProperty('webhook_url');
  if (url) {
    Logger.log(url);
    postSlack(url);
  }
}

function postSlack(url: string) {
  const jsonData = {
    username: 'bot-x',
    icon_emoji: ':chicken:',
    text: 'test',
  }
  const payload = JSON.stringify(jsonData);
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'post',
    contentType: 'application/json',
    payload: payload,
  }
  UrlFetchApp.fetch(url, options);
}
