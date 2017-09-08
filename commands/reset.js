const fs = require('fs-extra');
const { paths, logSuccess } = require('../utils');

const files = [
	'/LICENSE',
	'/README.md',
	'/source/components/welcome'
];

module.exports = {
	name: 'reset',
	description: 'Remove sample project files',
	usage: '- wee reset',
	options: [],
	action() {
		files.forEach(file => fs.removeSync(paths.project.root + file));

		logSuccess('Sample project files have been removed');
	}
};