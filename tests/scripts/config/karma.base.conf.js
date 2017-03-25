module.exports = {
	// base path that will be used to resolve all patterns (eg. files, exclude)
	basePath: '',

	// frameworks to use
	// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
	frameworks: ['mocha', 'chai'],

	// list of files / patterns to load in the browser
	files: [
		'../index.js'
	],

	// Process files before serving to browser
	// karma-coverage not registered here because of babel-plugin-istanbul
	preprocessors: {
		'../index.js': ['webpack']
	},
	webpackMiddleware: {
		noInfo: true
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
				dir: '../../../coverage',
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

	// Concurrency level
	// how many browser should be started simultaneous
	concurrency: Infinity,

	// This is a hack to keep karma from re-running tests over and over
	browserNoActivityTimeout: 2000
};