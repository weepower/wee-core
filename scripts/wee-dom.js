import { $, $chain } from './core/chain';
import { $isObject } from './core/types';
import * as W from './dom/index';

// Add chainable methods to $
$chain({
	/**
	 * Add classes to each matching selection
	 *
	 * @param {(function|string)} value
	 * @returns {$}
	 */
	addClass(value) {
		W.$addClass(this, value);

		return this;
	},

	/**
	 * Insert selection or markup after each matching selection
	 *
	 * @param {($|function|HTMLElement|string)} source
	 * @param {boolean} [remove=false]
	 * @returns {$}
	 */
	after(source, remove) {
		W.$after(this, source, remove);

		return this;
	},

	/**
	 * Append selection or markup after each matching selection
	 *
	 * @param {($|function|HTMLElement|string)} source
	 * @returns {$}
	 */
	append(source) {
		W.$append(this, source);

		return this;
	},

	/**
	 * Append selection or markup to each matching selection
	 *
	 * @param {($|function|HTMLElement|string)} target
	 * @returns {$}
	 */
	appendTo(target) {
		W.$append(target, this);

		return this;
	},

	/**
	 * Get attribute of first matching selection or set attribute
	 * of each matching selection
	 *
	 * @param a
	 * @param b
	 * @returns {($|string)}
	 */
	attr(a, b) {
		let resp = W.$attr(this, a, b);

		return b !== undefined || $isObject(a) ? this : resp;
	},

	/**
	 * Insert selection or markup before each matching selection
	 *
	 * @param {($|function|HTMLElement|string)} source
	 * @param {boolean} [remove=false]
	 * @returns {$}
	 */
	before(source, remove) {
		W.$before(this, source, remove);

		return this;
	},

	/**
	 * Clone each matching selection
	 *
	 * @returns {$}
	 */
	clone() {
		return $(W.$clone(this));
	},

	/**
	 * Remove each matching selection from the document
	 *
	 * @returns {$}
	 * @param {($|HTMLElement|string)} [context=document]
	 */
	remove(context) {
		W.$remove(this, context);

		return this;
	}
});

export default $;