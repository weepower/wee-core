var path = require('path');

module.exports = {
	resolve: {
		modules: [
			path.resolve(__dirname, '../lib'),
			path.resolve(__dirname, '../node_modules')
		]
	},
	module: {
		rules: [
			{
				test: /\.js/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				options: {
					plugins: [
						['istanbul', {
							exclude: [
								'tests/**'
							]
						}]
					]
				}
			}
		]
	}
};