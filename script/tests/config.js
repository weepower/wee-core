define({
	proxyPort: 9010,
	proxyUrl: 'http://localhost:9010/',
	excludeInstrumentation: /^(?:bower_components|node_modules)\//,
	tunnel: 'NullTunnel',
	loader: {
		packages: [
			{
				name: 'Wee',
				location: 'script',
				main: 'wee.js'
			}
		]
	},
	functionalSuites: [

	],
	suites: [
		'script/tests/unit/wee',
		'script/tests/unit/wee.assets',
		'script/tests/unit/wee.chain',
		'script/tests/unit/wee.data',
		'script/tests/unit/wee.dom',
		'script/tests/unit/wee.events',
		'script/tests/unit/wee.routes',
		'script/tests/unit/wee.screen',
		'script/tests/unit/wee.view'
	],
	environments: [
		{
			browserName: 'chrome'
		}
	]
});