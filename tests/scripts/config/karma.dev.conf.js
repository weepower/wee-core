const base = require('./karma.base.conf');

module.exports = function(config) {
	config.set(Object.assign(base, {
		browsers: ['Chrome-1024x768'],
		autoWatch: true,
		singleRun: false,
		customLaunchers: {
			'Chrome-1024x768': {
				base: 'Chrome',
				flags: [
					'--window-size=1024,768'
				]
			}
		},
		// console.error to print to terminal
		logLevel: config.LOG_ERROR,
	}));
};
