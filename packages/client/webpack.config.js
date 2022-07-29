/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: webpack.config.js
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Jul 29 2022 21:35:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-check

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env) => {
  const { NODE_ENV, PORT } = env;
  return {
    mode: NODE_ENV,
    context: __dirname,
    entry: './src/package/Main.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'Main.js',
      libraryTarget: 'commonjs',
    },
    devtool: 'source-map',
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      alias: {
        react: path.resolve(__dirname, '../../node_modules/react'),
      },
    },
    plugins: [
      new CleanWebpackPlugin(),
      new webpack.BannerPlugin(fs.readFileSync(path.resolve(__dirname, '../../LICENSE'), 'utf8')),
    ],
    module: {
      rules: [
        { test: /\.tsx?$/, loader: 'ts-loader' },
        { test: /\.js$/, loader: 'source-map-loader' },
        {
          test: /\.(scss|css)$/i,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
      ],
    },
    externals: [
      {
        react: 'react',
      },
    ],
  };
};
