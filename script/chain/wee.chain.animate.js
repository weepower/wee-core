(function(W) {
	'use strict';

	W.$chain({
		/**
		 * Transition to a specified attribute or property value
		 *
		 * @param {object} props
		 * @param {object} options
		 */
		tween: function(props, options) {
			Wee.animate.tween(this, props, options);

			return this;
		}
	});
})(Wee);