var exports;
var Wee;

define(function(require) {
	require('intern/order!js/wee.js');
	require('intern/order!js/wee.animate.js');
	require('intern/order!js/wee.assets.js');
	require('intern/order!js/wee.chain.js');
	require('intern/order!js/wee.fetch.js');
	require('intern/order!js/wee.dom.js');
	require('intern/order!js/wee.events.js');
	require('intern/order!js/wee.history.js');
	require('intern/order!js/wee.routes.js');
	require('intern/order!js/wee.screen.js');
	require('intern/order!js/wee.touch.js');
	require('intern/order!js/wee.view.js');
	require('intern/order!js/wee.view.diff.js');
	require('intern/order!js/chain/wee.chain.animate.js');
	require('intern/order!js/chain/wee.chain.dom.js');
	require('intern/order!js/chain/wee.chain.events.js');
	require('intern/order!js/chain/wee.chain.view.js');

	return function() {
		return Wee;
	};
});