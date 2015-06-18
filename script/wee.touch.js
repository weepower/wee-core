(function(W) {
	'use strict';

	W.fn.make('touch', {
		/**
		 *
		 */
		_construct: function() {
			this.supported = 'ontouchend' in W._doc;
		}
	});
})(Wee);