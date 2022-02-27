const gulp = require('gulp');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
const del = require('del');
const dirTree = require('directory-tree');
const fs = require('fs');


var folderconfig = require('./data/folderdatasetconfig.js')

var exec = require ('child_process').exec;

// Build/Serve

function build(cb) {
    return new Promise((resolve, reject) => {
        webpack(webpackConfig, (err, stats) => {
            if (err) {
                return reject(err)
            }
            if (stats.hasErrors()) {
                return reject(new Error(stats.compilation.errors.join('\n')))
            }
            resolve()
        })
    })
}

function serve(cb) {
    exec('npx http-server -o "./docs"', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
      });
}


// Cleaning
function cleanDist() {
    return del('dist/**', { force: true });
}

function cleanNodeModules() {
    return del('node_modules/**', { force: true });
}

// Create Folder Dataset
function scanFileSystem(cb)
{
    const tree = dirTree(folderconfig.src, {attributes:['size']});

    let JSONdata = JSON.stringify(tree);
    fs.writeFile(folderconfig.output, JSONdata, function(err) {
        if (err) {
            cb(err)
        }
    })
    cb();
}


exports.build = build;
exports.serve = serve;
exports.default = serve;
exports.clean = cleanDist;
exports.cleanAll = gulp.series([cleanDist, cleanNodeModules]);
exports.constructFolderDataset = scanFileSystem;