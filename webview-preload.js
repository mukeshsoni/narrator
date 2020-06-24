/**
 * We load this script into the webview where we load the page we want to test
 * This script listens to all events on this page and sends them to
 * the electron rendered page.
 * We use ipcRenderer.sentToHost to send the information about the events
 * to the webview. In our html page, we listen to these events using
 * webview.on('ipc-message')
 */
const { ipcRenderer } = require("electron");
const { finder } = require("./finder.js");
const Recorder = require("./src/recorder/recorder");

const events = [
  "click",
  "dblclick",
  "change",
  "keydown",
  // we need to capture mousedown and mouseup too because some sites don't
  // let the click event happen at all. click event is fire after mousedown
  // and mouseup. google's search page does it too.
  // "mousedown",
  // "mouseup",
  "select",
  "submit",
  "load",
  "unload",
];

function formatDataSelector(element, attribute) {
  return `[${attribute}="${element.getAttribute(attribute)}"]`;
}

function getCoordinates(evt) {
  const eventsWithCoordinates = {
    mouseup: true,
    mousedown: true,
    mousemove: true,
    mouseover: true,
  };
  return eventsWithCoordinates[evt.type]
    ? { x: evt.clientX, y: evt.clientY }
    : null;
}

// this is copied from puppeteer-recorder repo
function transformEvent(e) {
  // we explicitly catch any errors and swallow them, as none node-type events are also ingested.
  // for these events we cannot generate selectors, which is OK
  try {
    const optimizedMinLength = e.target.id ? 2 : 10; // if the target has an id, use that instead of multiple other selectors
    const selector =
      this._dataAttribute &&
      e.target.hasAttribute &&
      e.target.hasAttribute(this._dataAttribute)
        ? formatDataSelector(e.target, this._dataAttribute)
        : finder(e.target, {
            seedMinLength: 5,
            optimizedMinLength: optimizedMinLength,
          });

    const msg = {
      selector: selector,
      value: e.target.value,
      tagName: e.target.tagName,
      action: e.type,
      keyCode: e.keyCode ? e.keyCode : null,
      href: e.target.href ? e.target.href : null,
      coordinates: getCoordinates(e),
    };
    return msg;
  } catch (e) {
    console.log("oops", e);
    return { type: "DONOT_WORRY" };
  }
}

// document.addEventListener("DOMContentLoaded", () => {
// events.forEach((eventName) => {
// document.addEventListener(eventName, (event) => {
// // console.log(" event deteced", eventName );
// ipcRenderer.sendToHost("user-event", transformEvent(event));
// });
// });
// });

function sendCommandToParent(command) {
  console.log("sending command to parent", command);
  ipcRenderer.sendToHost("new-command", command);
}

console.log("inside preload");
const recorder = new Recorder(window);

recorder.onNewCommand(sendCommandToParent);
