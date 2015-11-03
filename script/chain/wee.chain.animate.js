(function(W) {
	'use strict';

	W.$chain({
		/**
		 * Transition an attribute or property value
		 *
		 * @param {object} values
		 * @param {object} [options]
		 * @param {number} [options.duration=400]
		 * @param {string} [options.ease='ease']
		 * @param {(Array|function|string)} [options.complete]
		 * @returns {$} selection
		 */
		tween: function(values, options) {
			W.animate.tween(this, values, options);

			return this;
		}
	});
})(Wee);