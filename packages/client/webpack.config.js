// @ts-check
/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: webpack.config.js
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable @typescript-eslint/no-var-requires */

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = ({ NODE_ENV }) => ({
  mode: NODE_ENV,
  target: 'node',
  context: __dirname,
  entry: './src/package/Main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'Main.js',
    libraryTarget: 'umd',
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new webpack.BannerPlugin(fs.readFileSync(path.resolve(__dirname, '../../LICENSE'), 'utf8')),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.compile.json',
        },
      },
      { test: /\.js$/, loader: 'source-map-loader' },
      {
        test: /\.(scss|css)$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
      },
    ],
  },
  externals: [
    {
      react: 'react',
    },
  ],
});
