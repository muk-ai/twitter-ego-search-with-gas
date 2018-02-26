declare var global: any;
// NOTE: if you install '@types/node', it will couse error

global.myFunction = function myFunction() {
  const token = getBearerToken();
  const tweets = searchTwitter(token);

  for (const status of tweets.statuses) {
    const tweet_url = `https://twitter.com/${status.user.screen_name}/status/${status.id_str}`;
    Logger.log(tweet_url);
    postUrlToSlack(tweet_url);
  }
}

function postUrlToSlack(text: string) {
  const url = PropertiesService.getScriptProperties().getProperty('webhook_url');
  if (!url) { return; }

  const jsonData = {
    username: 'bot-x',
    icon_emoji: ':chicken:',
    text: text,
  }
  const payload = JSON.stringify(jsonData);
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'post',
    contentType: 'application/json',
    payload: payload,
  }
  UrlFetchApp.fetch(url, options);
}

function getBearerToken(): string {
  const CONSUMER_KEY = PropertiesService.getScriptProperties().getProperty('twitter_consumer_key');
  const CONSUMER_SECRET = PropertiesService.getScriptProperties().getProperty('twitter_consumer_secret');

  const tokenUrl = "https://api.twitter.com/oauth2/token";
  const tokenCredential = Utilities.base64EncodeWebSafe(CONSUMER_KEY + ":" + CONSUMER_SECRET);

  const tokenOptions: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    headers: {
      Authorization: `Basic ${tokenCredential}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" 
    },
    method: "post",
    payload: "grant_type=client_credentials"
  };
  
  const response = UrlFetchApp.fetch(tokenUrl, tokenOptions);
  const parsedToken = JSON.parse(response.getContentText());
  return parsedToken.access_token;
}

function searchTwitter(bearerToken: string) {
  const apiUrl = 'https://api.twitter.com/1.1/search/tweets.json';
  const params: {[key: string]: string} = {
    result_type: 'recent',
    q: encodeURIComponent('vivivit OR ビビビット exclude:retweets'),
  }
  const query = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
  const url = `${apiUrl}?${query}`;
  Logger.log(url);
  var apiOptions: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    headers: {
      Authorization: `Bearer ${bearerToken}`
    },
    method: "get"
  };

  var response = UrlFetchApp.fetch(url, apiOptions);
  var result = "";

  if (response.getResponseCode() == 200) {
    var tweets = JSON.parse(response.getContentText());
    return tweets;
  } else {
    Logger.log(response);
    return { statuses: [] };
  }
}
