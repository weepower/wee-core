(function(W) {
	'use strict';

	/**
	 * Setup initial variables
	 */
	var bound = false,
		events = [],
		current;

	W.fn.make('screen', {
		/**
		 * Get current breakpoint value
		 *
		 * @returns {int} breakpoint value
		 */
		size: function() {
			var style = W._html.currentStyle,
				size = W._legacy ?
					(style ?
						style.fontFamily :
						null
					) :
					W._win.getComputedStyle(W._html, null)
						.getPropertyValue('font-family');

			return parseFloat(
				size.replace(/[^0-9\.]+/g, ''),
				10
			);
		},

		/**
		 * Map conditional events to breakpoint values
		 *
		 * @param {(Array|object)} rules - breakpoint rules
		 * @param {int} [rules.size] - specific breakpoint value
		 * @param {int} [rules.min] - minimum breakpoint value
		 * @param {int} [rules.max] - maximum breakpoint value
		 * @param {boolean} [rules.watch=true] - check event on screen resize
		 * @param {boolean} [rules.init=true] - check event on load
		 * @param {object} [rules.scope] - callback scope
		 * @param {Array} [rules.args] - callback arguments
		 * @param {function} rules.callback
		 */
		map: function(rules) {
			var priv = this.$private,
				sets = W.$toArray(rules),
				i = 0;

			// Delay check 100ms to prevent incorrect breakpoint value in IE
			setTimeout(function() {
				for (; i < sets.length; i++) {
					priv.addRule(sets[i]);
				}
			}, W._legacy ? 100 : 0);
		},

		/**
		 * Evaluate the current breakpoint
		 */
		check: function() {
			this.$private.check(2);
		},

		/**
		 * Reset all bound events
		 */
		reset: function() {
			events = [];
		}
	}, {
		/**
		 * Add individual rule to mapped events
		 *
		 * @private
		 * @param {object} conf - breakpoint rules
		 * @param {int} [conf.size] - specific breakpoint value
		 * @param {int} [conf.min] - minimum breakpoint value
		 * @param {int} [conf.max] - maximum breakpoint value
		 * @param {boolean} [conf.watch=true] - check event on screen resize
		 * @param {boolean} [conf.init=true] - check event on load
		 * @param {object} [conf.scope] - callback scope
		 * @param {Array} [conf.args] - callback arguments
		 * @param {function} conf.callback
		 */
		addRule: function(conf) {
			if (conf.callback) {
				var scope = this,
					check = scope.check.bind(scope);

				// Only setup watching when enabled
				if (conf.watch !== false) {
					events.push(conf);

					// Only attach event once
					if (! bound) {
						bound = 1;
						events = [conf];

						// Attach resize event
						W._legacy ?
							W._win.attachEvent('onresize', check) :
							W._win.addEventListener('resize', check);
					}
				}

				// Check current screen if not disabled
				if (conf.init !== false) {
					check(1, [conf]);
				}
			}
		},

		/**
		 * Check mapped events for matching conditions
		 *
		 * @private
		 * @param {number} [init] - initial page load
		 * @param {Array} [rules] - breakpoint rules
		 */
		check: function(init, rules) {
			var scope = W.screen,
				priv = scope.$private,
				size = scope.size();

			// If breakpoint has been hit or resize logic initialized
			if (size && (size !== current || ! isNaN(init))) {
				var evts = rules || events,
					i = 0;

				for (; i < evts.length; i++) {
					var evt = evts[i],
						sz = evt.size,
						mn = evt.min,
						mx = evt.max;

					// Check match against rules
					if ((! sz && ! mn && ! mx) ||
						(sz && sz === size) ||
						(mn && size >= mn && (init || current < mn) && (! mx || size <= mx)) ||
						(mx && size <= mx && (init || current > mx) && (! mn || size >= mn))) {
						priv.execute(evt, {
							dir: init == 1 ? 0 : (size > current ? 1 : -1),
							size: size,
							prev: current,
							init: init == 1
						});
					}
				}

				// Update current breakpoint value
				current = size;
			}
		},

		/**
		 * Execute a matching breakpoint callback
		 *
		 * @private
		 * @param {object} evt
		 * @param {object} data
		 */
		execute: function(evt, data) {
			var args = evt.args ? [data].concat(evt.args) : [data];

			W.$exec(evt.callback, {
				args: args,
				scope: evt.scope
			});

			// Disable future execution if set for once
			if (evt.once) {
				events = events.filter(function(el) {
					return el !== evt;
				});
			}
		}
	});
})(Wee);