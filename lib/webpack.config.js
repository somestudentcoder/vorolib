const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const isDev = false;

const config = {
    mode: isDev ? 'development' : 'production',
    entry: './src/scripts/vorotree.ts',
    output: {
        path: path.resolve(__dirname, 'src/dist'),
        filename: 'vorotree.js',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        fallback: {
            "fs": false,//require.resolve("browserify-fs"),
            "path": require.resolve("path-browserify")
          } 
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist')
        },
        compress: true,
        port: 8080,
        hot: true,
        open: true
    },
    optimization: {
        minimize: !isDev
      }
};

module.exports = config;