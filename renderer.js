const React = require("react");
const ReactDOM = require("react-dom");

const App = require("./src/App.js");

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");

  ReactDOM.render(React.createElement(App, null, null), root);
});
