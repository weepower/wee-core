const base = require('./karma.base.conf');

module.exports = function(config) {
	config.set(Object.assign(base, {
		browserStack: {
			username: process.env.BROWSERSTACK_USERNAME,
			accessKey: process.env.BROWSERSTACK_ACCESS_KEY
		},

		customLaunchers: {
			bs_safari_mac: {
				base: 'BrowserStack',
				browser: 'safari',
				os: 'OS X',
				os_version: 'Sierra'
			},
			bs_firefox_mac: {
				base: 'BrowserStack',
				device: 'firefox',
				os: 'OS X',
				os_version: 'Sierra'
			},
			bs_chrome_mac: {
				base: 'BrowserStack',
				device: 'chrome',
				os: 'OS X',
				os_version: 'Sierra'
			}
		},

		browsers: ['bs_safari_mac', 'bs_firefox_mac', 'bs_chrome_mac'],
		autoWatch: true,
		singleRun: false
	}));
};
