define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	require('script/wee.chain.js');
	require('script/chain/wee.chain.dom.js');
	require('script/chain/wee.chain.events.js');
	require('script/chain/wee.chain.view.js');

	registerSuite({
		// ...
	});
});