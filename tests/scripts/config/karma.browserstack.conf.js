const base = require('./karma.base.conf');

module.exports = function(config) {
	config.set(Object.assign(base, {
		browserStack: {
			username: process.env.BROWSERSTACK_USERNAME,
			accessKey: process.env.BROWSERSTACK_ACCESS_KEY
		},

		customLaunchers: {
			safari_mac: {
				base: 'BrowserStack',
				browser: 'safari',
				os: 'OS X',
				os_version: 'Sierra'
			},
			firefox_mac: {
				base: 'BrowserStack',
				browser: 'firefox',
				os: 'OS X',
				os_version: 'Sierra'
			},
			chrome_mac: {
				base: 'BrowserStack',
				browser: 'chrome',
				os: 'OS X',
				os_version: 'Sierra'
			},
			ie10_windows: {
				base: 'BrowserStack',
				browser: 'IE',
				browser_version : '10',
				os: 'Windows',
				os_version: '7'
			}
		},

		browsers: ['safari_mac', 'firefox_mac', 'chrome_mac', 'ie10_windows'],
		autoWatch: false,
		singleRun: true,
		reporters: ['dots', 'BrowserStack', 'coverage']
	}));
};
