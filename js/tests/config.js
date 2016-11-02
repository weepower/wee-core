define({
	proxyPort: 9010,
	proxyUrl: 'http://localhost:9010',
	initialBaseUrl: '../../',
	excludeInstrumentation: /^(?:node_modules|js\/tests)\//,
	tunnel: 'NullTunnel',
	suites: [
		'js/tests/unit/wee',
		'js/tests/unit/wee.animate',
		'js/tests/unit/wee.assets',
		'js/tests/unit/wee.chain',
		'js/tests/unit/wee.data',
		'js/tests/unit/wee.dom',
		'js/tests/unit/wee.events',
		'js/tests/unit/wee.history',
		'js/tests/unit/wee.routes',
		'js/tests/unit/wee.screen',
		'js/tests/unit/wee.touch',
		'js/tests/unit/wee.view'
	],
	environments: [
		{
			'browserName': 'chrome'
		}
	],
	tunnelOptions: {
		verbose: true,
		username: 'caddis'
	},
	capabilities: {
		'browserstack.local': true,
		'browserstack.debug': true,
		fixSessionCapabilities: false,
		acceptSslCerts: true
	}
});