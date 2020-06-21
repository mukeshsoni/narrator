/**
 * We listen to the messages our script we injected into the webview sends
 * us. That script sends us information about the events which happen in the
 * loaded page.
 */
onload = () => {
  const webview = document.getElementById("wv");

  webview.addEventListener("dom-ready", () => {
    webview.openDevTools();
  });

  webview.addEventListener("ipc-message", (event, msg) => {
    console.log("got ipc message", event.channel, event.args);
    // electron tip - if we want to send mesage from our electron index.html
    // file to the script inejected inside webview, we have to invoke `send`
    // on webview itself. Not on ipcMain or ipcRenderer
    webview.send("abcd", "got it");
  });
};
