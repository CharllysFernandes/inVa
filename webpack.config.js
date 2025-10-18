const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  mode: isProduction ? "production" : "development",
  devtool: isProduction ? false : "inline-source-map",
  entry: {
    background: path.resolve(__dirname, "src/background/background.ts"),
    contentScript: path.resolve(__dirname, "src/content/contentScript.ts"),
    popup: path.resolve(__dirname, "src/popup/popup.ts"),
    options: path.resolve(__dirname, "src/options/options.ts")
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@shared": path.resolve(__dirname, "src/shared")
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "manifest.json", to: "." },
        { from: "src/popup/popup.html", to: "popup.html" },
        { from: "src/popup/popup.css", to: "popup.css" },
        { from: "src/options/options.html", to: "options.html" },
        { from: "src/options/options.css", to: "options.css" }
      ]
    })
  ]
};
