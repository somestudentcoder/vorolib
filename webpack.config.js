const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const isDev = false;

const config = {
    mode: isDev ? 'development' : 'production',
    entry: './src/scripts/vorotree.ts',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'vorolib.js',
        libraryTarget: 'var',
        library: 'VoroLib'
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
};

module.exports = config;