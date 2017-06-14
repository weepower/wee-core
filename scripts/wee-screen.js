import { $exec } from 'core/core';
import { $toArray } from 'core/types';
import { _win, _html } from 'core/variables';

let events = [];
let id = 0;
let bound;
let current;

/**
 * Bind individual rule
 *
 * @private
 * @param {Object} conf - breakpoint rules
 * @param {Array} [conf.args] - callback arguments
 * @param {function} conf.callback
 * @param {boolean} [conf.each=false] - execute for each matching breakpoint
 * @param {boolean} [conf.init=true] - check event on load
 * @param {number} [conf.max] - maximum breakpoint value
 * @param {number} [conf.min] - minimum breakpoint value
 * @param {boolean} [conf.once=false] - only execute the callback once
 * @param {Object} [conf.scope] - callback scope
 * @param {number} [conf.size] - specific breakpoint value
 * @param {boolean} [conf.watch=true] - check event on screen resize
 * @param {string} [conf.namespace] - namespace the event
 */
function _addRule(conf) {
	// Attach unique identifier
	conf.i = id++;

	// Only setup watching when enabled
	if (conf.watch !== false) {
		events.push(conf);

		// Only attach event once
		if (! bound) {
			const run = _run.bind(this, false, 0, null);
			bound = 1;
			events = [conf];

			// Attach resize event
			_win.addEventListener('resize', run);
		}
	}

	// Evaluate rule immediately if not disabled
	if (conf.init !== false) {
		_run(true, [conf]);
	}
}

/**
 * Compare event rules against current size
 *
 * @private
 * @param {Object} evt
 * @param {number} size
 * @param {boolean} init
 * @returns {boolean}
 */
function _eq(evt, size, init) {
	const sz = evt.size;
	const mn = evt.min;
	const mx = evt.max;
	const ex = evt.each || init;

	// Check match against rules
	return (! sz && ! mn && ! mx) ||
		(sz && sz === size) ||
		(mn && size >= mn && (ex || current < mn) && (! mx || size <= mx)) ||
		(mx && size <= mx && (ex || current > mx) && (! mn || size >= mn));
}

/**
 * Check mapped rules for matching conditions
 *
 * @private
 * @param {boolean} [init=false] - initial page load
 * @param {Array} [rules] - breakpoint rules
 * @param {string} [namespace] - namespace for map object
 */
function _run(init, rules, namespace) {
	const size = _size();
	let evts = rules || events;
	let	i;

	// If breakpoint has been hit or resize logic initialized
	if (size && (init || size !== current)) {
		if (namespace) {
			evts = evts.filter(obj => obj.namespace === namespace);
		}

		i = evts.length;

		while (i--) {
			const evt = evts[i];

			if (_eq(evt, size, init)) {
				const f = init && ! current;
				const data = {
						dir: f ? 0 : (size > current ? 1 : -1),
						init: f,
						prev: current,
						size: size
					};

				$exec(evt.callback, {
					args: evt.args ? [data].concat(evt.args) : [data],
					scope: evt.scope
				});

				// Disable future execution if once
				if (evt.once) {
					events = events.filter(obj => obj.i !== evt.i);
				}
			}
		}

		// Cache current value
		current = size;
	}
}

function _size() {
	return parseFloat(
		getComputedStyle(_html, null)
			.getPropertyValue('font-family')
			.replace(/[^0-9\.]+/g, '')
	)
}

export default {
	/**
	 * Retrieve bound mappings
	 *
	 * @param {string} namespace
	 * @returns {*}
	 */
	bound(namespace) {
		if (! namespace) {
			return events;
		}

		return events.filter(obj => obj.namespace === namespace);
	},

	/**
	 * Get current breakpoint value
	 *
	 * @returns {number} size
	 */
	size() {
		return _size();
	},

	/**
	 * Map conditional events to breakpoint values
	 *
	 * @param {(Array|Object)} rules - breakpoint rules
	 * @param {Array} [rules.args] - callback arguments
	 * @param {function} rules.callback
	 * @param {boolean} [rules.each=false] - execute for each matching breakpoint
	 * @param {boolean} [rules.init=true] - check event on load
	 * @param {number} [rules.max] - maximum breakpoint value
	 * @param {number} [rules.min] - minimum breakpoint value
	 * @param {string} [rules.namespace] - namespace the event
	 * @param {boolean} [rules.once=false] - only execute the callback once
	 * @param {Object} [rules.scope] - callback scope
	 * @param {number} [rules.size] - specific breakpoint value
	 * @param {boolean} [rules.watch=true] - check event on screen resize
	 */
	map(rules) {
		const sets = $toArray(rules);
		let i = sets.length;

		while (i--) {
			_addRule(sets[i]);
		}
	},

	/**
	 * Evaluate the current breakpoint
	 */
	run(namespace) {
		_run(true, null, namespace);
	},

	/**
	 * Remove events from bound rules
	 *
	 * @param {string} [namespace] - remove screen events in this namespace
	 */
	reset(namespace) {
		events = events.filter(obj => {
			if (namespace) {
				return obj.namespace !== namespace
			}

			return false;
		});
	}
}