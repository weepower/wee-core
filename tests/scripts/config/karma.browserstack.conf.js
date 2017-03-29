const base = require('./karma.browserstack.base.conf');

module.exports = function(config) {
	config.set(Object.assign(base, {
		customLaunchers: {
			safari_mac: {
				base: 'BrowserStack',
				browser: 'safari',
				os: 'OS X',
				os_version: 'Sierra',
				resolution: '1280x800'
			},
			firefox_mac: {
				base: 'BrowserStack',
				browser: 'firefox',
				os: 'OS X',
				os_version: 'Sierra',
				resolution: '1280x800'
			},
			chrome_mac: {
				base: 'BrowserStack',
				browser: 'chrome',
				os: 'OS X',
				os_version: 'Sierra',
				resolution: '1280x800'
			},
			edge_windows: {
				base: 'BrowserStack',
				browser: 'Edge',
				os: 'Windows',
				os_version: '10',
				resolution: '1280x800'
			}
		},

		browsers: ['safari_mac', 'firefox_mac', 'chrome_mac', 'edge_windows']
	}));
};
