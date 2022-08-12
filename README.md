# twitter-ego-search-with-gas

## Install the dependencies

```
$ npm install
```

## Login with your google account

```
$ npx clasp login --no-localhost
```

プロンプトに表示されるURLにアクセスする。  
claspに渡す権限に問題なければ「許可」をクリックし、表示されるコードをプロンプトに入力する。  
credentialは `~/.clasprc.json` に保存される。  
ログインできているかの確認は
```
$ npx clasp login --status
```

## Deploy

```
$ npx clasp push
```

## 参照するGASのScript Properties

- twitter_consumer_key
- twitter_consumer_secret
- webhook_url
  - SlackのIncoming Webhook URLをセットする。ここ宛にtweetをPOSTする。
- latest_tweet_id
  - 前回取得したtweet IDを保存しておく。このIDよりも新しいtweetを検索する。
- query
  - Twitterを検索するクエリ
  - ex. `rust OR python lang:ja exclude:retweets`
- ignore_screen_name_list
  - 除外したいTwitterのアカウント
  - カンマ区切り
  - ex. `hoge,fuga`
- ng_word_list
  - 除外したい単語
  - カンマ区切り
  - ex. `hoge,fuga`
