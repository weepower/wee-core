const fs = require('fs-extra');
const { paths, logError, logSuccess, fileFormat } = require('../utils');

module.exports = {
	name: 'component',
	description: 'Create component folder and files',
	usage: '- wee component [options]',
	options: [
		['-n, --name <name>', 'name of component'],
		['-v, --vue', 'create vue component'],
		['-c, --clean', 'strip out kick starter text in files']
	],
	action(config, options) {
		// Require name option be provided
		if (typeof options.name !== 'string') {
			logError('--name is required');
			process.exit();
		}

		// Normalize directory name
		const name = fileFormat(options.name);
		const componentPath = `${paths.project.components}/${name}`;
		const templatesPath = `${paths.commands}/helpers/component`;
		const filePath = `${componentPath}/${name}`;
		const fileExt = {
			style: 'pcss',
			script: options.vue ? 'vue' : 'js'
		};

		// Create component directory
		if (fs.existsSync(componentPath)) {
			logError(`component named "${name}" already exists`);
			process.exit();
		}

		fs.mkdirSync(componentPath);

		if (options.clean) {
			fs.ensureFileSync(`${componentPath}/${name}.${fileExt.script}`);
			fs.ensureFileSync(`${componentPath}/${name}.${fileExt.style}`);
		} else {
			fs.copySync(`${templatesPath}/template.${fileExt.script}`, `${componentPath}/${name}.${fileExt.script}`);
			fs.copySync(`${templatesPath}/template.${fileExt.style}`, `${componentPath}/${name}.${fileExt.style}`);
		}

		logSuccess(`Component created successfully.`);
	}
};