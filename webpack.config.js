// process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

module.exports = {
  target: "electron-renderer",
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".js", ".tsx"],
  },
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
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
        },
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
      },
    ],
  },
};
