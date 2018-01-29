function myFunction() {
  const url = PropertiesService.getScriptProperties().getProperty('webhook_url');
  if (url) {
    Logger.log(url);
  }
}
