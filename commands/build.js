module.exports = {
	name: 'build',
	description: 'Build',
	usage: '- wee build [options]',
	options: [
		['-img, --images', 'copy image assets to public directory'],
		['-css, --styles', 'compile and minify Wee stylesheets only'],
		['-js, --scripts', 'compile and minify Wee Scripts only']
	],
	action(config, options) {
		console.log(options);
	}
};