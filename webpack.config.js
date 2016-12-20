var path = require("path");
var webpack = require("webpack");
module.exports = {
    entry: './client/dist/src/app.js',
	output: {
        filename: './client/dist/client.js'
	},
    module: {
        preLoaders: [
        {
            test: /\.js$/,
            loader: "source-map-loader"
        }
        ]
  }
};