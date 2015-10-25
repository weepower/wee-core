define({
	proxyPort: 9010,
	proxyUrl: 'http://localhost:9010/',
	initialBaseUrl: '../../',
	excludeInstrumentation: /^(?:node_modules|script\/tests)\//,
	tunnel: 'NullTunnel',
	loaderOptions: {
		packages: [
			{
				name: 'Wee',
				location: 'script',
				main: 'wee.js'
			}
		]
	},
	suites: [
		'script/tests/unit/wee',
		'script/tests/unit/wee.animate',
		'script/tests/unit/wee.assets',
		'script/tests/unit/wee.chain',
		'script/tests/unit/wee.data',
		'script/tests/unit/wee.dom',
		'script/tests/unit/wee.events',
		'script/tests/unit/wee.history',
		'script/tests/unit/wee.routes',
		'script/tests/unit/wee.screen',
		'script/tests/unit/wee.touch',
		'script/tests/unit/wee.view'
	],
	environments: [
		{
			browserName: 'chrome'
		}
	]
});