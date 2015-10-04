(function(W) {
	'use strict';

	W.$chain({
		/**
		 * Parse data into DOM selection
		 *
		 * @param {object} data
		 * @returns {$} selection
		 */
		render: function(data) {
			W.$each(this, function(el) {
				W.$html(el, W.view.render(W.$text(el), data));
			});

			return this;
		}
	});
})(Wee);