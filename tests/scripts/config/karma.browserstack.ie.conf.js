const base = require('./karma.browserstack.base.conf');

module.exports = function(config) {
	config.set(Object.assign(base, {
		customLaunchers: {
			ie10_windows: {
				base: 'BrowserStack',
				browser: 'IE',
				browser_version : '10',
				os: 'Windows',
				os_version: '7',
				resolution: '1024x768'
			},
			ie11_windows: {
				base: 'BrowserStack',
				browser: 'IE',
				browser_version : '11',
				os: 'Windows',
				os_version: '10',
				resolution: '1024x768'
			}
		},

		browsers: ['ie11_windows', 'ie10_windows']
	}));
};