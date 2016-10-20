define({
	proxyPort: 9010,
	proxyUrl: 'http://localhost:9010',
	initialBaseUrl: '../../',
	excludeInstrumentation: /^(?:node_modules|js\/tests)\//,
	tunnel: 'BrowserStackTunnel',
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
			'browser': 'Chrome',
			'os': 'Windows',
			'os_version': '10',
			'browser_version': '54.0 beta'
		},
		{
			'os': 'OS X',
			'os_version': 'El Capitan',
			'browser': 'Chrome',
			'browser_version': '54.0 beta'
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