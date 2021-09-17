const IGNORE_SCREEN_NAME_LIST = ["Vivivit_", "Vivivit___", "viviVit_"];
const NG_WORD_LIST = ["@Vivivit_", "@Vivivit___", "@viviVit_"];

function main() {
  const token = getBearerToken();
  const tweets = searchTwitter(token);

  if (tweets.statuses.length === 0) {
    return;
  }

  const latest_tweet = tweets.statuses[0]; // NOTE: reverse() is destructive method.
  for (const status of tweets.statuses.reverse()) {
    const screenName = status.user.screen_name;
    const tweet_url = `https://twitter.com/${screenName}/status/${status.id_str}`;
    if (IGNORE_SCREEN_NAME_LIST.includes(screenName)) {
      Logger.log(`ignore screen name matched: ${screenName}`);
      Logger.log(`ignore ${tweet_url}`);
      continue;
    }
    const matchedNgWords = [];
    NG_WORD_LIST.forEach((ngWord) => {
      if (status.text.includes(ngWord)) {
        matchedNgWords.push(ngWord);
      }
    });
    if (matchedNgWords.length > 0) {
      Logger.log(`NG word matched: ${matchedNgWords}`);
      Logger.log(`ignore ${tweet_url}`);
      continue;
    }
    Logger.log(tweet_url);
    postUrlToSlack(tweet_url);
  }
  PropertiesService.getScriptProperties().setProperty(
    "latest_tweet_id",
    latest_tweet.id_str
  );
}

function postUrlToSlack(text: string) {
  const url = PropertiesService.getScriptProperties().getProperty(
    "webhook_url"
  );
  if (!url) {
    return;
  }

  const jsonData = {
    username: "twivit",
    icon_emoji: ":twitter_bird:",
    text: text,
  };
  const payload = JSON.stringify(jsonData);
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    contentType: "application/json",
    payload: payload,
  };
  UrlFetchApp.fetch(url, options);
}

function getBearerToken(): string {
  const CONSUMER_KEY = PropertiesService.getScriptProperties().getProperty(
    "twitter_consumer_key"
  );
  const CONSUMER_SECRET = PropertiesService.getScriptProperties().getProperty(
    "twitter_consumer_secret"
  );

  const tokenUrl = "https://api.twitter.com/oauth2/token";
  const tokenCredential = Utilities.base64EncodeWebSafe(
    CONSUMER_KEY + ":" + CONSUMER_SECRET
  );

  const tokenOptions: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    headers: {
      Authorization: `Basic ${tokenCredential}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    method: "post",
    payload: "grant_type=client_credentials",
  };

  const response = UrlFetchApp.fetch(tokenUrl, tokenOptions);
  const parsedToken = JSON.parse(response.getContentText());
  return parsedToken.access_token;
}

function searchTwitter(bearerToken: string) {
  const apiUrl = "https://api.twitter.com/1.1/search/tweets.json";
  const params: { [key: string]: string | null } = {
    result_type: "recent",
    q: encodeURIComponent(getQuery()),
    since_id: getLatestTweetId(),
    until: getUntil(),
  };
  const query = Object.keys(params)
    .filter((key) => params[key])
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  const url = `${apiUrl}?${query}`;
  Logger.log(url);
  var apiOptions: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
    method: "get",
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

function getLatestTweetId() {
  return PropertiesService.getScriptProperties().getProperty("latest_tweet_id");
}

function getQuery() {
  // NOTE: example "rust OR python lang:ja exclude:retweets"
  const query = PropertiesService.getScriptProperties().getProperty("query");
  Logger.log(`query: ${query}`);
  return query;
}

function getUntil() {
  // NOTE: tweetが検索に引っかかるようになるまでにラグがあるためtweetを飛ばしてしまうことがある。
  //       5分間のディレイを入れることで軽減しようという意図。
  const now = new Date();
  now.setMinutes(now.getMinutes() - 5);
  const yyyy = now.getFullYear();
  const MM = ('0' + (now.getMonth() + 1)).slice(-2);
  const dd = ('0' + now.getDate()).slice(-2);
  const HH = ('0' + now.getHours()).slice(-2);
  const mm = ('0' + now.getMinutes()).slice(-2);
  const ss = ('0' + now.getSeconds()).slice(-2);
  return `${yyyy}-${MM}-${dd}_${HH}:${mm}:${ss}_JST`;
}
