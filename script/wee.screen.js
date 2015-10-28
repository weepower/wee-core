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
		 * @param {function} conf.callback
		 * @param {number} [conf.min] - minimum breakpoint value
		 * @param {number} [conf.max] - maximum breakpoint value
		 * @param {number} [conf.size] - specific breakpoint value
		 * @param {Array} [conf.args] - callback arguments
		 * @param {boolean} [conf.each=false] - execute for each matching breakpoint
		 * @param {boolean} [conf.init=true] - check event on load
		 * @param {boolean} [conf.once=false] - only execute the callback once
		 * @param {object} [conf.scope] - callback scope
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
						W._legacy ?
							W._win.attachEvent('onresize', run) :
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

	W.fn.make('screen', {
		/**
		 * Get current breakpoint value
		 *
		 * @returns {number} size
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
			var sets = W.$toArray(rules),
				i = 0;

			// Delay check to prevent incorrect IE value
			setTimeout(function() {
				for (; i < sets.length; i++) {
					_addRule(sets[i]);
				}
			}, W._legacy ? 100 : 0);
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
	});
})(Wee);