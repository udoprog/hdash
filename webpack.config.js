'use strict';

const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const babelOptions = {
  presets: [
    'react',
    ['es2015', { 'modules': false }],
    'es2016',
    'stage-0'
  ]
};

const babelLoader = { loader: 'babel-loader', options: babelOptions };
const html = new HtmlWebpackPlugin({
  template: path.resolve(__dirname, 'app/index.html')
});

const prod = process.env.NODE_ENV === 'production';
const plugins = [html];

plugins.push(new ExtractTextPlugin('[name].css'));

if (prod) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    },
    output: {
      comments: false
    }
  }));

  const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

  plugins.push(new OptimizeCssAssetsPlugin({
    assetNameRegExp: /\.css$/,
    cssProcessorOptions: { discardComments: { removeAll: true } }
  }));
}

module.exports = {
  entry: [
    'babel-polyfill',
    './app/main.tsx'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[id].js'
  },
  module: {
    rules: [{
      test: /\.ts(x?)$/,
      exclude: /node_modules/,
      use: [babelLoader, 'ts-loader']
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      use: [babelLoader]
    }, {
      test: /\.module\.less$/,
      exclude: /node_modules/,
      use: ExtractTextPlugin.extract({
        use: [
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          },
          'less-loader'
        ]
      })
    }, {
      test: /\.less$/,
      exclude: /node_modules/,
      include: path.resolve(__dirname, 'app/less'),
      use: ExtractTextPlugin.extract({
        use: 'css-loader!less-loader'
      })
    }, {
      test: /\.(png|woff|woff2|eot|ttf|svg)$/,
      use: 'url-loader?limit=100000'
    }]
  },
  plugins: plugins,
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: [
      path.resolve(__dirname, 'app'),
      path.resolve(__dirname, 'modules'),
      path.resolve(__dirname, 'node_modules')
    ]
  },
  devtool: 'source-map'
};
