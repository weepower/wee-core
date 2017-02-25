define(['js/tests/config'], function(conf) {
	conf.tunnel = 'BrowserStackTunnel';

	conf.environments = [
		{
			'os': 'OS X',
			'os_version': 'El Capitan',
			'browser': 'Chrome',
			'browser_version': '54.0 beta'
		}
	];

	return conf;
});