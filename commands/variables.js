const utils = require('../utils');
const chalk = require('chalk');
const variables = require(`${utils.paths.project.styles}/variables.js`)();
const parsedVars = require('postcss-variables/lib/register')(variables);

module.exports = {
	name: 'variables',
	description: 'Print postcss variables',
	usage: '- wee variables [options]',
	options: [
		['-a, --all', 'prints all variables and their values']
	],

	action(config, a) {
		let blocks = Object.keys(parsedVars());

		if (a.all) {
			parseKey(parsedVars());
			return;
		}
		if (typeof a === 'string') {
			find(parsedVars(), a);
		} else {
			console.log(chalk.green('Variable Groups'));
			blocks.forEach(block => {
				console.log(block);
			});
		}

		function find(obj, prop) {
			if (prop.includes('.')) {
				let propArray = prop.split('.');

				if (obj.hasOwnProperty(propArray[0])) {
					return find(obj[propArray[0]], propArray[1]);
				} else {
					console.log( `${prop} not found`);
				}
			} else {
				if (obj.hasOwnProperty(prop)) {
					if (typeof obj[prop] === 'object') {
						let newObj = obj[prop];

						parseKey(newObj);
					} else {
						console.log(chalk.green(prop) + ' : ' + obj[prop]);
					}
				} else {
					console.log(`${prop} not found`);
				}
			}
		}

		function parseKey(obj, parent) {
			Object.getOwnPropertyNames(obj).forEach(key => {
				if (typeof obj[key] === 'object') {
					console.log(chalk.white.bold(key));
					return parseKey(obj[key], true);
				} else {
					if (parent) {
						console.log(`  ${chalk.green(key)} - ${obj[key]}`);
					} else {
						console.log(`${chalk.green(key)} - ${obj[key]}`);
					}
				}
			});
		}
	}
};