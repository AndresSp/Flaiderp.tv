const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ExtensionReloader  = require('webpack-extension-reloader');
const CopyPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssnanoPlugin = require('cssnano-webpack-plugin');

module.exports = (env, argv) => { 
    return { // The plugin is activated only if mode is set to development
        watch: true,
        entry: {
            background: './background.js',
            './popup/js/init': './popup/js/init.js',
            './popup/js/popup': './popup/js/popup.js',
            './options/js/init': './options/js/init.js',
            './options/js/options': './options/js/options.js'
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: path.resolve(__dirname, 'dist')
        },
        optimization: {
            minimize: argv.mode == 'production' 
        },
        module:{
            rules:[
                {
                    test: /\.css$/i,
                    loader: ['style-loader','css-loader']
                },
                {
                    test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
                    loader: 'url-loader?limit=100000' 
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin(),
            new ExtensionReloader({
                port: 9090,
                reloadPage: true,
                entries: {
                    background: 'background',
                    extensionPage: ['initPopup','popup', 'initOptions', 'options']
                }
            }),
            new CopyPlugin([
                {from: './icon', to: './icon'},
                {from: './materialize', to: './materialize'},
                {from: './popup/popup.html', to: './popup/popup.html'},
                {from: './popup/assets/', to: './popup/assets/'},
                {from: './options/options.html', to: './options/options.html'},
                {from: './options/html', to: './options/html'},
                {from: './config.json'},
                {from: './streamers', to: './streamers'},
                { from: './manifest.json' }
            ]),
            new ImageminPlugin({
                test: /\.(jpe?g|png|gif|svg)$/i,
                pngquant: {
                    quality: '30-50'
                }
            })
        ]
    }
}