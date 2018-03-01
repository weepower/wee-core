const base = require('./karma.base.conf');

module.exports = function (config) {
	const customLaunchers = {
		'SL_Chrome_Mac': {
			base: 'SauceLabs',
			browserName: 'chrome',
			version: 'latest-1',
			platform: 'OS X 10.11'
		},
		'SL_Firefox_Mac': {
			base: 'SauceLabs',
			browserName: 'firefox',
			version: 'latest-1',
			platform: 'OS X 10.11'
		},
		'SL_Firefox_Windows': {
			base: 'SauceLabs',
			browserName: 'firefox',
			version: 'latest-1',
			platform: 'windows 10'
		},
		// TODO: Find out why these tests hang
		// 'SL_Safari_Mac': {
		// 	base: 'SauceLabs',
		// 	browserName: 'safari',
		// 	version: 'latest',
		// 	platform: 'OS X 10.11'
		// },
		'SL_Chrome_Win10': {
			base: 'SauceLabs',
			browserName: 'chrome',
			version: 'latest-1',
			platform: 'Windows 10'
		},
	};

	config.set(Object.assign(base, {
		customLaunchers: customLaunchers,
		browsers: Object.keys(customLaunchers),
		sauceLabs: {
			testName: 'Unit Tests',
			recordScreenshots: true,
		},
		frameworks: ['mocha', 'chai'],
		reporters: ['saucelabs', 'mocha'],
		concurrency: 5,
		captureTimeout: 600000,
		browserDisconnectTolerance: 2,
		logLevel: config.LOG_INFO,
		singleRun: true,
	}));
};
