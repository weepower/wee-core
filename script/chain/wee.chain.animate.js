(function(W) {
	'use strict';

	W.$chain({
		/**
		 * Transition to a specified attribute or property value
		 *
		 * @param {object} props
		 * @param {object} [options]
		 * @param {number} [options.duration]
		 * @param {string} [options.ease]
		 * @returns {$} selection
		 */
		tween: function(props, options) {
			W.animate.tween(this, props, options);

			return this;
		}
	});
})(Wee);