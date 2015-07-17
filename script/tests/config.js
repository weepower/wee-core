// Documentation available at https://theintern.github.io/intern/#common-config

define({
	proxyPort: 9010,
	proxyUrl: 'http://localhost:9010/',
	excludeInstrumentation: /^(?:bower_components|node_modules|tests)\//,
	tunnel: 'NullTunnel',
	loader: {
		packages: [
			{
				name: 'Wee',
				location: 'public/assets/js',
				main: 'script.min.js'
			}
		]
	},
	functionalSuites: [

	],
	suites: [
		'tests/unit/wee'
	],
	environments: [
		{
			browserName: 'chrome'
		}
	]
});