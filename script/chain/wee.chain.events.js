(function(W, E) {
	'use strict';

	W.$chain({
		/**
		 * Bind event(s) to selection
		 *
		 * @param {(object|string)} a - event name or object of events
		 * @param {(function|object)} [b] - event callback or options object
		 * @param {(object|string)} [c] - event options
		 * @param {Array} [c.args] - callback arguments
		 * @param {(HTMLElement|string)} [c.context=document]
		 * @param {(HTMLElement|string)} [c.delegate]
		 * @param {boolean} [c.once=false] - remove event after first execution
		 * @param {object} [c.scope]
		 * @returns {$} selection
		 */
		on: function(a, b, c) {
			E.on(this, a, b, c);

			return this;
		},

		/**
		 * Remove event(s) from selection
		 *
		 * @param {(object|string)} a - event name or object of events
		 * @param {function} [b] - specific function to remove
		 * @returns {$} selection
		 */
		off: function(a, b) {
			E.off(this, a, b);

			return this;
		},

		/**
		 * Get currently bound events to optional specified element and event|function
		 *
		 * @param {string} [event] - event name to match
		 * @param {function} [fn] - specific function to match
		 * @returns {Array} matches
		 */
		bound: function(event, fn) {
			return E.bound(event, fn);
		},

		/**
		 * Execute event on selection
		 *
		 * @param {string} name
		 * @returns {$} selection
		 */
		trigger: function(name) {
			E.trigger(this, name);

			return this;
		}
	});
})(Wee, Wee.events);