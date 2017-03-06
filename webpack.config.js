var path = require('path');

module.exports = {
	context: './scripts/',
	entry: {
		// TODO: This is an example of how to do multiple entry point library
		core: 'core/core',
		types: 'core/types'
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
		library: ['Wee', '[name]'],
		libraryTarget: 'umd'
	},
	resolve: {
		modules: [
			__dirname + '/scripts',
			path.resolve(__dirname, "./node_modules")
		]
	}
};