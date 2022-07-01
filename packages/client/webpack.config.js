/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-check

const path = require('path');
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
    plugins: [new CleanWebpackPlugin()],
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
