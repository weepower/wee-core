let env = process.env.NODE_ENV;

module.exports = function(config) {
	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['mocha', 'chai'],

		// list of files / patterns to load in the browser
		files: [
			'./index.js'
		],

		// Process files before serving to browser
		// karma-coverage not registered here because of babel-plugin-istanbul
		preprocessors: {
			'./index.js': ['webpack']
		},
		webpackMiddleware: {
			stats: 'errors-only'
		},
		webpack: require('./webpack.config.js'),

		// Reporters
		reporters: ['mocha', 'coverage'],
		mochaReporter: {
			showDiff: true
		},
		coverageReporter: {
			reporters: [
				{
					type: 'lcovonly',
					dir: './coverage',
					subdir: '.'
				},
				{
					type: 'text'
				}
			]
		},

		// web server port
		protocol: 'http',
		port: 9876,
		httpsServerOptions: {
			// key: fs.readFileSync(resolve(__dirname, './https/server.key'), 'utf8'),
			// cert: fs.readFileSync(resolve(__dirname, './https/server.crt'), 'utf8')
		},

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_ERROR,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: env !== 'ci',

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: env === 'ci' ? ['Firefox'] : ['Chrome'],

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: env === 'ci',

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity
	})
};
