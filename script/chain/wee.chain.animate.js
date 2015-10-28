(function(W) {
	'use strict';

	W.$chain({
		/**
		 * Transition an attribute or property value
		 *
		 * @param {object} props
		 * @param {object} [options]
		 * @param {number} [options.duration=400]
		 * @param {string} [options.ease='ease']
		 * @param {(Array|function|string)} [options.complete]
		 * @returns {$} selection
		 */
		tween: function(props, options) {
			W.animate.tween(this, props, options);

			return this;
		}
	});
})(Wee);