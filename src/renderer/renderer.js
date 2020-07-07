import React from "react";
import ReactDOM from "react-dom";

import App from "./App.js";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");

  ReactDOM.render(React.createElement(App, null, null), root);
});
