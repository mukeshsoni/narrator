process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

module.exports = {
  target: "electron-renderer",
  entry: {
    renderer: "./src/renderer/renderer.js",
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/build",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
};
