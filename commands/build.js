module.exports = {
	name: 'build',
	description: 'Build',
	usage: '- wee build [options]',
	options: [
		['-l, --local', 'wrap proxy around local dev domain']
	],
	action(config, options) {
		console.log(config);
	}
};