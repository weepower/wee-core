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
	 * Get unique direct children of each matching selection
	 *
	 * @param filter
	 * @returns {$}
	 */
	children(filter) {
		return $(W.$children(this, filter));
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
	 * Get unique closest ancestors of each matching selection
	 *
	 * @param filter
	 * @param context
	 * @returns {$}
	 */
	closest(filter, context) {
		return $(W.$closest(this, filter, context));
	},

	/**
	 * Determine if any matching parent selection contains descendant selection
	 *
	 * @param descendant
	 * @returns {boolean}
	 */
	contains(descendant) {
		return W.$contains(this, descendant);
	},

	/**
	 * Return a filtered subset of elements from a matching selection
	 *
	 * @param filter
	 * @param [options]
	 * @returns {$}
	 */
	filter(filter, options) {
		return $(W.$filter(this, filter, options));
	},

	/**
	 * Determine if at least one matching selection matches
	 * a specified criteria
	 *
	 * @param filter
	 * @param [options]
	 * @returns {boolean}
	 */
	is(filter, options) {
		return W.$is(this, filter, options);
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