const base = require('./karma.base.conf');

module.exports = Object.assign(base, {
	browserStack: {
		username: process.env.BROWSERSTACK_USERNAME,
		accessKey: process.env.BROWSERSTACK_ACCESS_KEY
	},
	autoWatch: false,
	singleRun: true,
	reporters: ['dots', 'BrowserStack', 'coverage']
});