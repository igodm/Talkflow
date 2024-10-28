const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  target: "web",
  devServer: {
    historyApiFallback: true,
    hot: true,
  },
  entry: "./src/index.js",
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        use: "babel-loader",
        exclude: [/node_modules/],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|gif|ico)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html",
      favicon: "./public/favicon.ico",
    }),
  ],
  mode: "development",
};
