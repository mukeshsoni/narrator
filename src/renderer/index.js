import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("app");

  ReactDOM.render(React.createElement(App, null, null), root);
});

