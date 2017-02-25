(function(W, E) {
	'use strict';

	var events = [
		['swipeLeft', 'X', 'Y', 1],
		['swipeRight', 'X', 'Y',-1],
		['swipeUp', 'Y', 'X', 1],
		['swipeDown', 'Y','X', -1]
	];

	/**
	 * Loop through custom events and bind applicable standard events
	 */
	events.forEach(function(event) {
		var ns = event[0],
			start = 'mousedown.' + ns + ' touchstart.' + ns,
			end = 'mouseup.' + ns + ' touchend.' + ns;

		E.addEvent(ns, function(el, fn, conf) {
			var scope = this,
				distance = conf.distance || 50,
				movement = conf.movement || 25;

			E.on(el, start, function(e) {
				var a = e.touches ? e.touches[0] : e;
				scope.start = a['page' + event[1]];
				scope.scroll = W._win['page' + event[2] + 'Offset'];
			}, conf);

			E.on(el, end, function(e, el) {
				var a = e.changedTouches ? e.changedTouches[0] : e,
					travel = (scope.start - a['page' + event[1]]) * event[3],
					scroll = Math.abs(scope.scroll - W._win['page' + event[2] + 'Offset']);

				if (travel > distance && scroll < movement) {
					fn.apply(conf.scope || el, W._slice.call(arguments));
				}
			}, conf);
		}, function(el, fn) {
			E.off(el, start + ' ' + end, fn);
		});
	});
})(Wee, Wee.events);