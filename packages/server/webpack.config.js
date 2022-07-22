// @ts-check
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

/**
 * @type {(env: any) => webpack.Configuration}
 */
const config = (env) => {
  const { NODE_ENV, PORT } = env;
  return {
    mode: NODE_ENV,
    entry: {
      rtc: './src/room/static/rtc.ts',
      ws: './src/room/static/ws.ts',
    },
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: '[name].min.js',
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'src/room/index.html',
      }),
    ],
    resolve: {
      extensions: ['.ts', '.js', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.webpack.json',
          },
          exclude: /node_modules/,
        },
      ],
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'static'),
      },
      compress: true,
      port: PORT || 3002,
    },
  };
};
module.exports = config;
