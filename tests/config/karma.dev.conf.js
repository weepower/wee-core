const base = require('./karma.base.conf');

module.exports = function(config) {
	config.set(Object.assign(base, {
		browsers: ['Chrome'],
		autoWatch: true,
		singleRun: false,

		// console.error to print to terminal
		logLevel: config.LOG_ERROR,
	}));
};
