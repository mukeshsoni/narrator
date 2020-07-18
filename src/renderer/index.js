import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

if (module.hot) {
  module.hot.accept();
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("app");

  ReactDOM.render(React.createElement(App, null, null), root);
});

