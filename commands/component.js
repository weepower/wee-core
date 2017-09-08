const fs = require('fs-extra');
const { paths, logError, logSuccess, fileFormat } = require('../utils');

module.exports = {
	name: 'component',
	description: 'create component folder and files',
	usage: '- wee component [options]',
	options: [
		['-n, --name <component-name>', 'name of component'],
		['-v, --vue', 'create vue component'],
		['-c, --clean', 'strip out kick starter text in files'],
		['-r, --root', 'vue only - configure as root component (mounted to page)']
	],
	action(config, options) {
		// Require name option be provided
		if (typeof options.name !== 'string') {
			logError('--name is required');
			process.exit();
		}

		// Normalize directory name
		const fileName = fileFormat(options.name);
		const constructorName = fileName.split('-').map((word, i) => {
			return word.substr(0, 1).toUpperCase() + word.substr(1);
		}).join('');
		const variableName = constructorName.substr(0, 1).toLowerCase() + constructorName.substr(1);
		const componentPath = `${paths.project.components}/${fileName}`;
		const templatesPath = `${paths.commands}/helpers/component`;
		const filePath = `${componentPath}/${fileName}`;
		const fileExt = {
			style: 'pcss',
			script: options.vue ? 'vue' : 'js'
		};
		const rootComponentScript = eval('`' + fs.readFileSync(`${templatesPath}/root-component-template.js`) + '`');

		// Create component directory
		if (fs.existsSync(componentPath)) {
			logError(`component named "${fileName}" already exists`);
			process.exit();
		}

		fs.mkdirSync(componentPath);

		if (options.clean) {
			fs.ensureFileSync(`${componentPath}/index.${fileExt.script}`);
			fs.ensureFileSync(`${componentPath}/index.${fileExt.style}`);

			if (options.hasOwnProperty('root') && options.hasOwnProperty('vue')) {
				fs.ensureFileSync(`${componentPath}/index.js`);
			}
		} else {
			fs.copySync(`${templatesPath}/template.${fileExt.script}`, `${componentPath}/index.${fileExt.script}`);
			fs.copySync(`${templatesPath}/template.${fileExt.style}`, `${componentPath}/index.${fileExt.style}`);

			if (options.hasOwnProperty('root') && options.hasOwnProperty('vue')) {
				fs.writeFileSync(`${componentPath}/index.js`, rootComponentScript);
			}
		}

		logSuccess(`Component created successfully`);
	}
};