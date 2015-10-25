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
		 * @param {boolean} [conf.once=false] - only execute the callback once
		 * @param {boolean} [conf.each=false] - execute for each matching breakpoint
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
		run: function() {
			this.$private.run(true);
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
		 * @param {boolean} [conf.once=false] - only execute the callback once
		 * @param {boolean} [conf.each=false] - execute for each matching breakpoint
		 * @param {object} [conf.scope] - callback scope
		 * @param {Array} [conf.args] - callback arguments
		 * @param {function} conf.callback
		 */
		addRule: function(conf) {
			if (conf.callback) {
				var run = this.run.bind(this, false, 0);

				// Only setup watching when enabled
				if (conf.watch !== false) {
					events.push(conf);

					// Only attach event once
					if (! bound) {
						bound = 1;
						events = [conf];

						// Attach resize event
						W._legacy ?
							W._win.attachEvent('onresize', run) :
							W._win.addEventListener('resize', run);
					}
				}

				// Check current screen if not disabled
				if (conf.init !== false) {
					this.run(true, [conf]);
				}
			}
		},

		/**
		 * Check mapped events for matching conditions
		 *
		 * @private
		 * @param {boolean} [init=false] - initial page load
		 * @param {Array} [rules] - breakpoint rules
		 */
		run: function(init, rules) {
			var size = W.screen.size();

			// If breakpoint has been hit or resize logic initialized
			if (size && (init || size !== current)) {
				var evts = rules || events,
					i = 0;

				for (; i < evts.length; i++) {
					var evt = evts[i];

					if (this.eq(evt, size, init)) {
						var f = init && ! current;

						this.exec(evt, {
							dir: f ? 0 : (size > current ? 1 : -1),
							init: f,
							prev: current,
							size: size
						});
					}
				}

				// Update current breakpoint value
				current = size;
			}
		},

		/**
		 * Compare event rules against current size
		 *
		 * @param {object} evt
		 * @param {number} size
		 * @param {boolean} init
		 * @returns {boolean}
		 */
		eq: function(evt, size, init) {
			var sz = evt.size,
				mn = evt.min,
				mx = evt.max,
				ex = evt.each || init;

			// Check match against rules
			return (! sz && ! mn && ! mx) ||
				(sz && sz === size) ||
				(mn && size >= mn && (ex || current < mn) && (! mx || size <= mx)) ||
				(mx && size <= mx && (ex || current > mx) && (! mn || size >= mn));
		},

		/**
		 * Execute a matching breakpoint callback
		 *
		 * @private
		 * @param {object} evt
		 * @param {object} data
		 */
		exec: function(evt, data) {
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