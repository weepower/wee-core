import { _slice, $copy, $toArray } from './types';
import { $sel, $each, $map } from './dom';

/**
 * Cast selection as Wee object
 *
 * @private
 * @param {($|HTMLElement|string)} sel
 * @param {($|HTMLElement|string)} [context=document]
 */
let Get = function(sel, context) {
		if (sel) {
			let els = Array.isArray(sel) ?
					sel :
					$toArray($sel(sel, context)),
				i = 0;

			for (; i < els.length; i++) {
				let el = els[i];

				if (el) {
					[].push.call(this, el);
				}
			}

			this.sel = sel;
		}
	};

/**
 * Create chainable Wee Object from selection
 *
 * @param {(HTMLElement|string)} sel
 * @param {Object} [context=document]
 */
export function $(sel, context) {
	return new Get(sel, context);
}

// Bind core chainable methods
$.fn = Get.prototype = {
	_$: true,
	length: 0,

	/**
	 * Execute function for each Object element
	 *
	 * @param {Function} fn
	 * @param {Object} [options]
	 * @param {Array} [options.args]
	 * @param {HTMLElement} [options.context=document]
	 * @param {boolean} [options.reverse=false]
	 * @param {Array} [options.scope]
	 */
	each: function(fn, options) {
		$each(this, fn, options);

		return this;
	},

	/**
	 * Translate Object elements to a new array
	 *
	 * @param {Function} fn
	 * @param {Object} [options]
	 * @param {Array} [options.args]
	 * @param {Object} [options.scope]
	 * @returns {Array}
	 */
	map: function(fn, options) {
		return $map(this, fn, options);
	},

	/**
	 * Reverse the order of Object elements
	 *
	 * @returns {$}
	 */
	reverse: function() {
		let copy = $copy(this),
			x = this.length,
			total = x,
			i = 0;

		for (; i < total; i++) {
			x--;
			this[i] = copy[x];
		}

		return this;
	},

	/**
	 * Convert selection to standard array
	 */
	toArray: function() {
		return _slice.call(this);
	}
};

/**
 * Register a new chainable method
 *
 * @param {(Object|string)} a - method name or Object
 * @param {Function} [b]
 */
export function $chain(a, b) {
	if (typeof a == 'string') {
		$.fn[a] = b;
	} else {
		for (let key in a) {
			$.fn[key] = a[key];
		}
	}
}