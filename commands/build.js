const exec = require('child_process').exec;
const spawn = require('child_process').spawn;

module.exports = {
	name: 'build',
	description: 'Build sources and assets',
	usage: '- wee build [options]',
	options: [
		['-img, --images', 'copy image assets to public directory'],
		['-css, --styles', 'compile and minify Wee stylesheets only'],
		['-js, --scripts', 'compile and minify Wee scripts only']
	],
	action(config, options) {
		// Set Arguments array
		let args = ['run'];

		if (options.images) {
			args.push('build:images');
		}

		if (options.styles) {
			args.push('build:css');
		}

		if (options.scripts) {
			args.push('build:js');
		}

		if (! options.scripts && ! options.styles && ! options.images ) {
			args.push('build');
		}

		// Execute npm build [options]
		let child = spawn('npm', args, {
			cwd: config.rootPath,
			stdio: 'inherit'
		});

		child.on('error', data => {
			console.log(data);
		});

		child.on('close', (code) => {
			console.log(`child process exited with code ${code}`);
		});
	}
};