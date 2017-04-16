module.exports = {
	name: 'run [proxyType]',
	description: 'Run development server',
	usage: '- wee run [static or local]',
	options: [
		['-l, --local', 'run proxy wrapper around local dev domain', {isDefault: true, bool: true}],
		['-s, --static', 'run proxy to serve static files', {bool: true}]
	],
	action(proxy) {
		// TODO: run local or static - set properties in bs-config and call npm run
		// TODO: Look at https://dzone.com/articles/execute-unix-command-nodejs for exec example

		if (proxy === 'local') {
			console.log('RUN LOCAL');
		} else if (proxy === 'static') {
			console.log('RUN STATIC');
		}
	}
};