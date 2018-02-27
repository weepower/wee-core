const glob = require('glob');
const fs = require('fs-extra');
const paths = require('../../../utils').paths;

const reporters = ['mocha', 'coverage'];
const files = [];
const preprocessors = [];

/**
 * Add file for processing
 *
 * @param {string} file
 */
function addFile(file) {
	files.push(file);

	// Files need to be pre-processed with webpack since we are writing ES2015 in tests
	preprocessors[file] = ['webpack'];
}

glob.sync(paths.tests.scripts + '/unit/**/*.js').forEach(file => addFile(file));

// Inject test file for assets module
files.push({
	pattern: paths.tests.scripts + '/helpers/files/*',
	watched: false,
	served: true,
	included: false
});

module.exports = {
	basePath: '../..',

	proxies: {
		'/files/': '/base/scripts/helpers/files/'
	},

	frameworks: ['mocha', 'chai'],

	webpack: require('./webpack.config.js'),

	// Concurrency level
	// how many browser should be started simultaneous
	concurrency: Infinity,

	captureTimeout: 120000,

	browserNoActivityTimeout: 120000,

	webpackMiddleware: {
		noInfo: true
	},

	files,
	preprocessors,
	reporters,
};
