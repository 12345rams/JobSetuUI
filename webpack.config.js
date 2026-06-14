const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
require('dotenv').config();


module.exports = {
  entry: './src/main.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
    new webpack.DefinePlugin({
      'process.env.API_BASE': JSON.stringify(process.env.API_BASE || 'http://localhost:8080')
    })
  ],
  devServer: {
    port: 5173,
    host: '0.0.0.0',
    historyApiFallback: true,
    disableHostCheck: true,
    contentBase: path.resolve(__dirname, 'public')
  }
};

