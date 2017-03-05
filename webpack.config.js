const path = require('path');

module.exports = {
	resolve: {
		modules: [
			__dirname + '/scripts',
			path.resolve(__dirname, "./node_modules")
		]
	}
};