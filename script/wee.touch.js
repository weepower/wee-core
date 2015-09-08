(function(W, E) {
	'use strict';

	var events = [
			['swipeLeft', 'X', 1],
			['swipeRight', 'X', -1],
			['swipeUp', 'Y', 1],
			['swipeDown', 'Y', -1]
		],
		down = 'mousedown',
		up = 'mouseup';

	/**
	 * Loop through custom events and bind applicable standard events
	 */
	events.forEach(function(event) {
		E.addEvent(event[0], function(el, fn, conf) {
			var scope = this;
			conf = W.$extend({
				distance: 50
			}, conf);

			E.on(el, down + '.' + event[0], function(e) {
				scope.start = e['client' + event[1]];
			}, conf);

			E.on(el, up + '.' + event[0], function(e, el) {
				var travel = (scope.start - e['client' + event[1]]) * event[2];

				if (travel > conf.distance) {
					fn.apply(conf.scope || el, W._slice.call(arguments));
				}
			}, conf);
		}, function(el, fn) {
			E.off(el, down + '.' + event[0] + ' ' + up + '.' + event[0], fn);
		});
	});
})(Wee, Wee.events);