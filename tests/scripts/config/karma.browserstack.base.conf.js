const base = require('./karma.base.conf');

module.exports = Object.assign(base, {
	browserDisconnectTimeout: 10000,
	browserDisconnectTolerance: 1,
	browserNoActivityTimeout: 30000,
	captureTimeout: 30000,
	concurrency: 2,
	browserStack: {
		username: process.env.BROWSERSTACK_USERNAME,
		accessKey: process.env.BROWSERSTACK_ACCESS_KEY
	},
	autoWatch: false,
	singleRun: true,
	reporters: ['dots', 'BrowserStack', 'coverage']
});