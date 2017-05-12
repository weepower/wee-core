const exec = require('child_process').exec;
const spawn = require('child_process').spawn;

module.exports = {
	name: 'build',
	description: 'Build source directory and image assets',
	usage: '- wee build [options]',
	options: [
		['-i, --images', 'copy image assets to public directory'],
		['-c, --styles', 'compile and minify Wee stylesheets'],
		['-s, --scripts', 'compile and minify Wee scripts']
	],
	action(config, options) {
		// Set Arguments array
		let args = ['run'];
		let option = 'build';

		if (options.images) {
			args.push('build:images');
			option = 'build --images';
		}

		if (options.css) {
			args.push('build:css');
			option = 'build --styles';
		}

		if (options.scripts) {
			args.push('build:js');
			option = 'build --scripts';
		}

		if (! options.scripts && ! options.styles && ! options.images) {
			args.push('build');
		}

		args.push('--ansi');

		// Execute npm build [options]
		let child = spawn('npm', args, {
			cwd: config.rootPath,
			stdio: 'inherit'
		});

		child.on('error', data => {
			console.log(data);
		});

		child.on('close', (code) => {
			console.log(`Command: wee ` + option + ` was executed!`);
		});
	}
};