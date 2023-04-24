const path = require("path");

// console.log(__dirname);

module.exports = {
  entry: "./src/client/js/main.js",
  mode: "development",
  output: {
    filename: "main.js",
    // path: "./assets/js",
    path: path.resolve(__dirname, "assets", "js"),
  },
  module: {
    rules: [
      {
        test: /\.js$/, // js 코드를
        use: {
          loader: "babel-loader", // babel-loader라는 Loader로 가공
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
    ],
    ㅇ,
  },
};
