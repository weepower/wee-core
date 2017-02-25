(function(W) {
	'use strict';

	W.$chain({
		/**
		 * Bind element events and form submit events to PJAX
		 *
		 * @param {(boolean|object)} [events]
		 * @param {Object} [a] - settings
		 * @returns {$} selection
		 */
		bind: function(events, a) {
			W.history.bind(events, a, this);

			return this;
		}
	});
})(Wee);