const base = require('./karma.browserstack.base.conf');

module.exports = function(config) {
	config.set(Object.assign(base, {
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
			edge_windows: {
				base: 'BrowserStack',
				browser: 'Edge',
				os: 'Windows',
				os_version: '10'
			}
		},

		browsers: ['safari_mac', 'firefox_mac', 'chrome_mac', 'edge_windows']
	}));
};
