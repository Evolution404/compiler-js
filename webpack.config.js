var Htmlwp = require('html-webpack-plugin')
const { VueLoaderPlugin, } = require('vue-loader')
const path = require('path')

module.exports = {
    entry: './src/index.js', // 指定打包的入口文件
    mode: 'development',
    devServer: {
        host: '0.0.0.0',
        useLocalIp: true,
        open: true,
        openPage: '',
        proxy: {
            '*': {
                target: 'http://xxx',
                secure: false,
            },
        },
    },
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'bulid.js',
    },
    module: {
        rules: [{
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader'],
            },
            {
                test: /\.(gif|png|jpg|woff|svg|ttf|eot)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 40000,
                    },
                }],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.vue$/,
                use: 'vue-loader',
            }
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
        new Htmlwp({
            title: '首页',
            filename: 'index.html',
            template: 'index.html',
        })
    ],
}
