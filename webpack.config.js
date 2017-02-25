'use strict';

const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const babelOptions = {
  "presets": [
    "react",
    ["es2015", {"modules": false}],
    "es2016",
    "stage-0"
  ]
};

const babelLoader = {loader: 'babel-loader', options: babelOptions};
const html = new HtmlWebpackPlugin({
  template: path.resolve(__dirname, 'app/index.html')
});

const prod = process.env.ENV === 'production';
const plugins = [html];

if (prod) {
  const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

  plugins.push(new ExtractTextPlugin('[name].min.css'));

  plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false }
  }));

  plugins.push(new OptimizeCssAssetsPlugin({
    assetNameRegExp: /\.min\.css$/,
    cssProcessorOptions: {discardComments: {removeAll: true}}
  }));
} else {
  plugins.push(new ExtractTextPlugin('[name].css'));
}

module.exports = {
  entry: './app/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: prod ? '[name].min.js' : '[name].js',
    chunkFilename: '[id].js'
  },
  module: {
    rules: [{
      test: /\.ts(x?)$/,
      exclude: /node_modules/,
      use: ['ts-loader']
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      use: [babelLoader]
    }, {
      test: /\.less$/,
      exclude: /node_modules/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: ['css-loader', 'less-loader']
      })
    },
    {
      test: /\.(png|woff|woff2|eot|ttf|svg)$/,
      use: 'url-loader?limit=100000'
    }]
  },
  plugins: plugins,
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: [
      path.resolve(__dirname, "app"), path.resolve(__dirname, "modules"), "node_modules"
    ]
  },
  devtool: 'source-map'
};
