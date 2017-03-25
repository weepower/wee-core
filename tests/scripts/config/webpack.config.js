const path = require('path');

module.exports = {
	resolve: {
		modules: [
			path.resolve(__dirname, '../../../scripts'),
			path.resolve(__dirname, '../../../node_modules')
		]
	},
	module: {
		rules: [
			{
				test: /\.js/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				options: {
					presets: [['es2015', { modules: false }]],
					plugins: [
						['istanbul', {
							exclude: [
								'tests/**/*.js'
							]
						}]
					]
				}
			}
		]
	}
};