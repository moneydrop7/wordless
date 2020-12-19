const path = require('path');
const srcDir = path.resolve(__dirname, 'src');
const dstDir = path.resolve(__dirname, 'dist');
const javascriptsDstPath = path.join(dstDir, '/javascripts');
const _stylesheetsDstPath = path.join(dstDir, '/stylesheets');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ImageminWebpack = require('image-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const entries = ['main'];

module.exports = (env) => {
  let envOptions = require('./webpack.env')(env);

  return {
    mode: envOptions.mode,

    entry: entries.reduce((object, current) => {
      object[current] = path.join(srcDir, `${current}.js`);
      return object;
    }, {}),

    output: {
      filename: "[name].js",
      path: javascriptsDstPath
    },

    devtool: envOptions.devtool,

    module: {
      rules: [
        {
          test: /\.(js|es6)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      'useBuiltIns': 'usage',
                      'corejs': 3
                    }
                  ]
                ]
              }
            }
          ]
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: envOptions.styleLoaders
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
          },
        },
        {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: "url-loader"
        },
        {
          test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: "url-loader"
        }
      ]
    },

    plugins: [
      new BrowserSyncPlugin({
        host: "127.0.0.1",
        port: 3000,
        proxy: {
          target: "http://127.0.0.1:8080"
        },
        watchOptions: {
          ignoreInitial: true
        },
        files: [
          './views/**/*.pug',
          './views/**/*.php',
          './helpers/**/*.php'
        ]
      }),

      new MiniCssExtractPlugin({
        filename: '../stylesheets/[name].css'
      }),

      new ImageminWebpack({
        test: /\.(jpe?g|png|gif|svg)$/i,
        severityError: 'warning',
        minimizerOptions: {
          plugins: [
            ['gifsicle', { interlaced: true }],
            ['jpegtran', { progressive: true }],
            ['optipng', { optimizationLevel: 5 }],
            [
              'svgo',
              {
                plugins: [
                  {
                    removeViewBox: false,
                  },
                ],
              },
            ],
          ],
        },
      }),

      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(srcDir, '/images'),
            to: path.join(dstDir, '/images', '[path][name].[ext]'),
            toType: 'template'
          }
        ],
      }),
    ].concat(envOptions.plugins),

    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2
          }
        }
      }
    },

    stats: 'normal',

    externals: {
      jquery: 'jQuery'
    }
  };
};
