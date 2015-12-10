(function(W) {
	'use strict';

	var events = [],
		bound,
		current,

		/**
		 * Bind individual rule
		 *
		 * @private
		 * @param {object} conf - breakpoint rules
		 * @param {Array} [conf.args] - callback arguments
		 * @param {function} conf.callback
		 * @param {boolean} [conf.each=false] - execute for each matching breakpoint
		 * @param {boolean} [conf.init=true] - check event on load
		 * @param {int} [conf.max] - maximum breakpoint value
		 * @param {int} [conf.min] - minimum breakpoint value
		 * @param {boolean} [conf.once=false] - only execute the callback once
		 * @param {object} [conf.scope] - callback scope
		 * @param {int} [conf.size] - specific breakpoint value
		 * @param {boolean} [conf.watch=true] - check event on screen resize
		 */
		_addRule = function(conf) {
			if (conf.callback) {
				// Only setup watching when enabled
				if (conf.watch !== false) {
					events.push(conf);

					// Only attach event once
					if (! bound) {
						var run = _run.bind(this, false, 0);
						bound = 1;
						events = [conf];

						// Attach resize event
						W._win.addEventListener('resize', run);
					}
				}

				// Evaluate rule immediately if not disabled
				if (conf.init !== false) {
					_run(true, [conf]);
				}
			}
		},

		/**
		 * Check mapped rules for matching conditions
		 *
		 * @private
		 * @param {boolean} [init=false] - initial page load
		 * @param {Array} [rules] - breakpoint rules
		 */
		_run = function(init, rules) {
			var size = W.screen.size();

			// If breakpoint has been hit or resize logic initialized
			if (size && (init || size !== current)) {
				var evts = rules || events,
					i = 0;

				for (; i < evts.length; i++) {
					var evt = evts[i];

					if (_eq(evt, size, init)) {
						var f = init && ! current;

						_exec(evt, {
							dir: f ? 0 : (size > current ? 1 : -1),
							init: f,
							prev: current,
							size: size
						});
					}
				}

				// Cache current value
				current = size;
			}
		},

		/**
		 * Compare event rules against current size
		 *
		 * @private
		 * @param {object} evt
		 * @param {number} size
		 * @param {boolean} init
		 * @returns {boolean}
		 */
		_eq = function(evt, size, init) {
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
		 * Execute matching breakpoint callback
		 *
		 * @private
		 * @param {object} evt
		 * @param {object} data
		 */
		_exec = function(evt, data) {
			W.$exec(evt.callback, {
				args: evt.args ? [data].concat(evt.args) : [data],
				scope: evt.scope
			});

			// Disable future execution if once
			if (evt.once) {
				events = events.filter(function(el) {
					return el !== evt;
				});
			}
		};

	W.screen = {
		/**
		 * Get current breakpoint value
		 *
		 * @returns {number} size
		 */
		size: function() {
			return parseFloat(
				getComputedStyle(W._html, null)
					.getPropertyValue('font-family')
					.replace(/[^0-9\.]+/g, '')
			);
		},

		/**
		 * Map conditional events to breakpoint values
		 *
		 * @param {(Array|object)} rules - breakpoint rules
		 * @param {Array} [rules.args] - callback arguments
		 * @param {function} rules.callback
		 * @param {boolean} [rules.each=false] - execute for each matching breakpoint
		 * @param {boolean} [rules.init=true] - check event on load
		 * @param {int} [rules.max] - maximum breakpoint value
		 * @param {int} [rules.min] - minimum breakpoint value
		 * @param {boolean} [rules.once=false] - only execute the callback once
		 * @param {object} [rules.scope] - callback scope
		 * @param {int} [rules.size] - specific breakpoint value
		 * @param {boolean} [rules.watch=true] - check event on screen resize
		 */
		map: function(rules) {
			var sets = W.$toArray(rules),
				i = 0;

			// Delay check to prevent incorrect IE value
			for (; i < sets.length; i++) {
				_addRule(sets[i]);
			}
		},

		/**
		 * Evaluate the current breakpoint
		 */
		run: function() {
			_run(true);
		},

		/**
		 * Reset all bound events
		 */
		reset: function() {
			events = [];
		}
	};
})(Wee);