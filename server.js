#!/usr/bin/env node

var host = 'localhost';
var port = 3000;
var hot = true;

var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var WebpackDevServerClient = require.resolve("webpack-dev-server/client/");
var config = require('./webpack.config.js');

var originalEntry = config.entry;

var entries = [];

/* dev server client */
entries.push(WebpackDevServerClient + '?http://' + host + ':' + port);

if (hot) {
  entries.push('react-hot-loader/patch');
  entries.push('webpack/hot/dev-server');
  config.plugins.push(new webpack.HotModuleReplacementPlugin());

  /* add react hot loader to all rules using ts-loader */
  config.module.rules.forEach(rule => {
    if (rule.use.some && rule.use.some(u => u === 'ts-loader')) {
      rule.use = ['react-hot-loader/webpack'].concat(rule.use);
    }

    var babelLoader = rule.use.find && rule.use.find(u => u.loader && u.loader === 'babel');

    if (babelLoader) {
      babelLoader.options.plugins = ['react-hot-loader/babel'];
    }
  });
}

// insert original entries at end
if (config.entry instanceof Array) {
  config.entry = entries.concat(config.entry);
} else {
  config.entry = entries.concat([config.entry]);
}

try {
  new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    historyApiFallback: true,
    inline: true,
    hot: hot,
    proxy: {
      '/heroic': {
        target: 'http://localhost:8080',
        secure: false,
        pathRewrite: { '^/heroic': '' }
      }
    }
  }).listen(port, host, function (err, result) {
    if (err) {
      return console.log(err);
    }

    console.log('Listening at http://' + host + ':' + port);
  });
} catch (e) {
  console.error('Error: ' + e.message, e.stack);
}
