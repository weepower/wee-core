const base = require('./karma.base.conf');

module.exports = Object.assign(base, {
	browserDisconnectTimeout: 10000,
	browserDisconnectTolerance: 1,
	browserNoActivityTimeout: 30000,
	captureTimeout: 30000,
	concurrency: 1,
	browserStack: {
		username: process.env.BROWSER_STACK_USERNAME,
		accessKey: process.env.BROWSER_STACK_ACCESS_KEY
	},
	autoWatch: false,
	singleRun: true,
	reporters: ['mocha', 'BrowserStack']
});
