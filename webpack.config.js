var path = require("path");
var webpack = require("webpack");
module.exports = {
    entry: './client/src/app.js',
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
    },
    // plugins: [
    //     new webpack.optimize.UglifyJsPlugin({
    //         comments: false,
    //         minimize: true
    //     })
    // ]
};