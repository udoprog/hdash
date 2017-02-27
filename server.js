#!/usr/bin/env node

var host = 'localhost';
var port = 3000;
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var WebpackDevServerClient = require.resolve("webpack-dev-server/client/");
var config = require('./webpack.config.js');

config.entry = [
   config.entry, 
   WebpackDevServerClient + '?http://' + host + ':' + port,
   'webpack/hot/dev-server'
]

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  historyApiFallback: true
}).listen(port, host, function (err, result) {
  if (err) {
    return console.log(err);
  }

  console.log('Listening at http://' + host + ':' + port);
});
