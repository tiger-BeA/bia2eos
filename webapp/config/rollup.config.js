const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const eslint = require('rollup-plugin-eslint');
const sass = require('rollup-plugin-sass');

module.exports = function(params) {
    return {
        input: params,
        format: 'iife',
        // !IMPORTANT, it avoids the hypothetical file system error
        allowRealFiles: true,
        plugins: [
            // Disable any style output or callbacks, import as string 
            sass({
                output: false
            }),
            resolve({
                jsnext: true,
                main: true,
                browser: true
            }),
            commonjs(),
            eslint(),
            babel({
                exclude: './node_modules/**'
            })
        ]
    }
};