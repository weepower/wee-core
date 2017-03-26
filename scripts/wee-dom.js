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
	after: function(source, remove) {
		W.$after(this, source, remove);

		return this;
	},

	/**
	 * Append selection or markup after each matching selection
	 *
	 * @param {($|function|HTMLElement|string)} source
	 * @returns {$}
	 */
	append: function(source) {
		W.$append(this, source);

		return this;
	},

	/**
	 * Append selection or markup to each matching selection
	 *
	 * @param {($|function|HTMLElement|string)} target
	 * @returns {$}
	 */
	appendTo: function(target) {
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
	attr: function(a, b) {
		let resp = W.$attr(this, a, b);

		return b !== undefined || $isObject(a) ? this : resp;
	},

	/**
	 * Clone each matching selection
	 *
	 * @returns {$}
	 */
	clone: function() {
		return $(W.$clone(this));
	},

	/**
	 * Remove each matching selection from the document
	 *
	 * @returns {$}
	 * @param {($|HTMLElement|string)} [context=document]
	 */
	remove: function(context) {
		W.$remove(this, context);

		return this;
	}
});

export default $;