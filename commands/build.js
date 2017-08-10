const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const name = 'build';
const assets = {
	images: '--images',
	styles: '--styles',
	scripts: '--scripts',
	fonts: '--fonts'
};
const { logError, logSuccess } = require('../utils');

module.exports = {
	name: name,
	description: 'compile project assets',
	usage: '- wee build [options]',
	options: [
		['-i, ' + assets.images, 'copy and minify image assets'],
		['-c, ' + assets.styles, 'compile and minify stylesheets'],
		['-s, ' + assets.scripts, 'compile and minify scripts'],
		['-f, ' + assets.fonts, 'copy fonts'],
		['-w, --watch', 'watch files']
	],
	action(config, options) {
		// Set Arguments array
		const commands = [];
		const ansi = '--ansi';
		const baseCommand = 'run';
		let feedbackItems = [];
		let option = name;
		let spawnCount = 0;
		let error = null;

		if (options.images) {
			commands.push([baseCommand, 'build:images', ansi]);
			option = option + ' ' + assets.images;
			feedbackItems.push(assets.images);
		}

		if (options.styles) {
			commands.push([baseCommand, 'build:css', ansi]);
			option += ' ' + assets.styles;
			feedbackItems.push(assets.styles);
		}

		if (options.scripts) {
			commands.push([baseCommand, 'build:js', ansi]);
			option += ' ' + assets.scripts;
			feedbackItems.push(assets.scripts);
		}

		if (options.fonts) {
			commands.push([baseCommand, 'build:fonts', ansi]);
			option += ' ' + assets.fonts;
			feedbackItems.push(assets.fonts);
		}

		if (! commands.length) {
			commands.push([baseCommand, 'build', ansi]);
			feedbackItems.push('build');
		}

		const lastSpawn = commands.length;

		commands.forEach(command => {
			// Execute npm build [options]
			let child = spawn('npm', command, {
				cwd: config.rootPath,
				stdio: 'inherit'
			});

			child.on('error', data => {
				error = true;
				logError(data);
			});

			child.on('close', (code) => {
				spawnCount += 1;

				if (spawnCount === lastSpawn && ! error) {
					logSuccess(`Finished: ${buildFeedback(feedbackItems)}`);
				}

				if (options.watch) {
					// Execute npm build [options]
					let child = spawn('npm', [baseCommand, 'watch', ansi], {
						cwd: config.rootPath,
						stdio: 'inherit'
					});

					child.on('error', data => {
						logError(data);
					});
				}
			});
		});
	}
};

/**
 * Build out feedback string
 *
 * @param {Array} items
 * @return {string}
 */
function buildFeedback(items) {
	return items.map(item => {
			return item.replace('--', '');
		})
		.join(', ');
}