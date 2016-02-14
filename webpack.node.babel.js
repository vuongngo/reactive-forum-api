var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');
var path = require('path');
var fs = require('fs');

module.exports = {
  entry: ['babel-polyfill', './server.js'],
  target: 'node',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'backend.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: path.join(__dirname, '/node_modules/'),
    }]
  },
  externals: [nodeExternals()],
  plugins: [
    new webpack.IgnorePlugin(/\.(css|less)$/),
    new webpack.BannerPlugin('require("source-map-support").install();',
                             { raw: true, entryOnly: false})
  ],
  devtool: '#eval-source-map'
}
