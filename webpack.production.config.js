const webpack = require('webpack');
const HtmlwebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');

const config = require('./config');

const extractSass = new ExtractTextPlugin({
  filename: "[name].[hash].css",
  allChunks: true,
  ignoreOrder: true
});

module.exports = {

  entry: {
    app: [
      'babel-polyfill',
      'bootstrap/dist/css/bootstrap.min.css',
      './src/client/index'
    ],
    // 一些主要依赖打包在一起
    vendors: [
      'react',
      'react-dom',
      'react-router',
      'react-router-dom',
      'redux',
      'react-redux',
      'react-meta-tags',
      'axios',
      'jquery',
      'popper.js',
      'bootstrap/dist/js/bootstrap.min.js',
      'apollo-client',
      'graphql',
      'graphql-tag'
    ],
    vendors2: [
      'socket.io-client',
      'draft-js',
      'redraft',
      'reactjs-localstorage',
      'react-ga',
      'react-css-modules',
      'lodash',
      'qrcode.react',
      'whatwg-fetch'
    ]
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].js',
    publicPath: config.public_path + "/"
    // chunkFilename: 'js/[name].[hash].js'
  },

  resolveLoader: {
    moduleExtensions: ["-loader"]
  },

  module: {

    rules: [

      // js 文件解析
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          cacheDirectory: true,
          plugins: [
            // http://technologyadvice.github.io/es7-decorators-babel6/
            'transform-decorators-legacy'
          ],
          presets: ['es2015', 'react', 'stage-0']
        }
      },

      // scss 文件解析
      {
        test: /\.scss$/,
        include: path.resolve(__dirname, 'src'),
        use: extractSass.extract({
          use: [
            {
              loader: `css`,
              options: {
                modules: true,
                localIdentName: config.class_scoped_name,
                minimize: true
              }
            },
            {
              loader: `sass`,
            }
          ],
          fallback: "style"
        })
      },

      // 支持
      {
        test: /\.css$/,
        use: extractSass.extract({
          use: [{ loader: `css` }],
          fallback: "style"
        })
      },

      // 小于8K的图片，转 base64
      { test: /\.(png|jpg|gif)$/, loader: 'url?limit=8192' },

      // 小于8K的字体，转 base64
      { test: /\.(ttf|eot|svg|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file?limit=8192" }

    ]
  },


  plugins: [

    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),

    // 定义环境变量
    new webpack.DefinePlugin({
      // 是否是生产环境
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
      // 是否是 Node
      '__NODE__': JSON.stringify(process.env.__NODE__),
      // 是否是开发环境
      '__DEV__': JSON.stringify(process.env.NODE_ENV == 'development')
    }),

    // 清空打包目录
    new CleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname),
      verbose: true,
      dry: false
    }),

    extractSass,

    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'common',
    //   filename: 'common.[hash].js'
    // }),

    new webpack.optimize.CommonsChunkPlugin({
      name:['app','vendors','vendors2'],
      minChunks:2
    }),

    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false,
      },
      minimize: true,
      compress: {
        warnings: false
      }
    }),

    new HtmlwebpackPlugin({
      filename: path.resolve(__dirname, 'dist/index.ejs'),
      template: 'src/views/index.html',
      head: config.head,
      meta: '<%- meta %>',
      analysis_script: config.analysis_script,
      htmlDom: '<%- html %>',
      reduxState: '<%- reduxState %>',
      inject: false
      // chunks: [ "common", "app", "vendors"], // 选择使用哪些生成的文件
      // chunksSortMode: "manual" // manual根据chunks的位置手动排序
    }),

    // new ServiceWorkerWebpackPlugin({
    //   entry: path.join(__dirname, 'client/sw.js'),
    // })

  ]
}
