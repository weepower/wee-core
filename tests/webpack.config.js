const path = require('path');

module.exports = {
	resolve: {
		modules: [
			path.resolve(__dirname, '../lib'),
			path.resolve(__dirname, '../node_modules')
		]
	}
};