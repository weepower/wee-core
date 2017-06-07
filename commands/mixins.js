const utils = require('../utils');
const fs = require('fs-extra');
const path = require('path');
const comments = require('../scripts/helpers/parse-comments');
const chalk = require('chalk');
const Table = require('cli-table');

module.exports = {
	name: 'mixins',
	description: 'Print postcss mixins',
	usage: '- wee mixins [options]',
	options: [
		['-p, --project', 'print project specific mixins']
	],

	action(config, a, b) {
		let mixin;
		let options;
		let str;
		let list;
		let found = false;

		if (typeof a === 'string') {
			mixin = a;
			options = b;
		}

		if (typeof a === 'object') {
			options = a;
		}

		if (options.project) {
			str = fs.readFileSync(`${utils.paths.project.styles}/mixins.js`, 'utf8');
			list = comments(str);
		} else {
			str = fs.readFileSync(`${utils.paths.styles}/mixins.js`, 'utf8');
			list = comments(str);
		}

		if (mixin === undefined) {
			list.sort((a, b) => {
			if (a.code < b.code)
				return -1;
			  if (a.code > b.code)
				return 1;
		 	return 0;
		});
			list.forEach(item => {
				found = true;
				if (! item.private === true) {
					utils.logList(item.code.split('(')[0], item.description);
				}
			});
		} else {
			list.forEach(item => {
				let mixinName = item.code.split('(')[0];
				let mixinTable = new Table({
					head: [chalk.green('Name'), chalk.green('Type'), chalk.green('Description'), chalk.green('Required')],
					colWidths: [18, 20, 25, 10]
				});

				if (mixinName.includes(mixin)) {
					found = true;

					if (item.params.length && item.private !== true) {
						utils.logList(mixinName.charAt(0).toUpperCase() + mixinName.slice(1), item.description);

						item.params.forEach(param => {
							mixinTable.push([
								[param.name],
								[param.type],
								[param.description],
								[param.required === true ? '\u2713' : '']

							]);
						});

						console.log(mixinTable.toString());
						console.log('\n');
					} else {
						if (item.private !== true) {
							utils.logList(mixinName.charAt(0).toUpperCase() + mixinName.slice(1), item.description);
							console.log(chalk.bold('Mixin has no parameters'));
						}
					}
				}
			 });
		}

		if (found === false) {
			console.log(`${mixin} not found`);
		}
	}
};