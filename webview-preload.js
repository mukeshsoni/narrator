/**
 * We load this script into the webview where we load the page we want to test
 * This script listens to all events on this page and sends them to
 * the electron rendered page.
 * We use ipcRenderer.sentToHost to send the information about the events
 * to the webview. In our html page, we listen to these events using
 * webview.on('ipc-message')
 */
const { ipcRenderer } = require("electron");
const Recorder = require("./src/recorder/recorder");

function sendCommandToParent(command) {
  console.log("sending command to parent", command);
  ipcRenderer.sendToHost("new-command", command);
}

console.log("inside preload");
const recorder = new Recorder(window);

recorder.onNewCommand(sendCommandToParent);
