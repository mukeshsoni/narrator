const React = require("react");
const ReactDOM = require("react-dom");

const App = require("./src/renderer/App.js");

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");

  ReactDOM.render(React.createElement(App, null, null), root);
});
