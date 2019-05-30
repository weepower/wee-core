const base = require('./karma.base.conf');

module.exports = function (config) {
    const customLaunchers = {
        'SL_InternetExplorer_Win7': {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            version: '11.0',
            platform: 'Windows 7'
        },
        // TODO: Figure out why this test hangs
        // 'SL_Edge_Win10': {
        // 	base: 'SauceLabs',
        // 	browserName: 'MicrosoftEdge',
        // 	version: 'latest',
        // 	platform: 'Windows 10'
        // },
    };

    config.set(Object.assign(base, {
        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers),
        sauceLabs: {
            testName: 'Unit Tests - IE',
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
