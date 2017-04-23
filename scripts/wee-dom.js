import { $, $chain } from './core/chain';
import { $isObject } from './core/types';
import { U } from './core/variables';
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
	 * Get unique content of each matching selection
	 *
	 * @returns {$}
	 */
	contents() {
		return $(W.$contents(this));
	},

	/**
	 * Get CSS value of first matching selection or set value
	 * of each matching selection
	 *
	 * @param {(object|string)} a
	 * @param {(function|string)} [b]
	 * @returns {($|string)}
	 */
	css(a, b) {
		let r = W.$css(this, a, b);

		return b !== U || $isObject(a) ? this : r;
	},

	/**
	 * Get data of first matching selection or set data
	 * of each matching selection
	 *
	 * @param a
	 * @param [b]
	 * @returns {($|string)}
	 */
	data(a, b) {
		let resp = W.$data(this, a, b);

		return b !== U || $isObject(a) ? this : resp;
	},

	/**
	 * Remove child nodes from each matching selection
	 *
	 * @returns {$}
	 */
	empty() {
		W.$empty(this);

		return this;
	},

	/**
	 * Get indexed node of matching selection
	 *
	 * @param index
	 * @param {($|HTMLElement|string)} [context=document]
	 * @returns {$}
	 */
	eq(index, context) {
		return $(W.$eq(this, index, context));
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
	 * Get unique filtered descendants from each matching selection
	 *
	 * @param filter
	 * @returns {$}
	 */
	find(filter) {
		return $(W.$find(this, filter));
	},

	/**
	 * Get the first element of a matching selection
	 *
	 * @returns {$}
	 */
	first() {
		return this.eq(0);
	},

	/**
	 * Return node from Wee object at specific index
	 *
	 * @returns {HTMLElement}
	 */
	get: function(index) {
		return W.$eq(this, index);
	},

	/**
	 * Determine if the matching selection has a class
	 *
	 * @param className
	 * @returns {boolean}
	 */
	hasClass(className) {
		return W.$hasClass(this, className);
	},

	/**
	 * Hide each matching selection
	 *
	 * @returns {$}
	 */
	hide() {
		W.$hide(this);

		return this;
	},

	/**
	 * Get inner HTML of first selection or set each matching selection's HTML
	 *
	 * @param {(function|string)} value
	 * @returns {($|string)}
	 */
	html(value) {
		let r = W.$html(this, value);

		return value !== U ? this : r;
	},

	/**
	 * Get the zero-based index of a matching selection relative
	 * to it's siblings
	 *
	 * @returns {int}
	 */
	index() {
		return W.$index(this);
	},

	/**
	 * Insert each matching source selection element after
	 * each matching target selection
	 *
	 * @param {($|HTMLElement|string)} target
	 * @returns {$}
	 */
	insertAfter(target) {
		W.$insertAfter(this, target);

		return this;
	},

	/**
	 * Insert each matching source selection element before
	 * each matching target selection
	 *
	 * @param {($|HTMLElement|string)} target
	 * @returns {$}
	 */
	insertBefore(target) {
		W.$insertBefore(this, target);

		return this;
	},

	/**
	 * Get or set the height of each matching selection
	 *
	 * @param {(function|number|string)} value
	 * @returns {($|number)}
	 */
	height(value) {
		let r = W.$height(this, value);

		return value === U || value === true ? r : this;
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
	 * Get the last element of a matching selection
	 *
	 * @param {($|HTMLElement|string)} [context=document]
	 * @returns {$}
	 */
	last(context) {
		return $(W.$last(this, context));
	},

	/**
	 * Get unique parent from each matching selection
	 *
	 * @returns {$}
	 */
	parent(filter) {
		return $(W.$parent(this, filter));
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
	},

	/**
	 * Remove specified attribute of each matching selection
	 *
	 * @param {string} name
	 * @returns {$}
	 */
	removeAttr(name) {
		W.$removeAttr(this, name);

		return this;
	},

	/**
	 * Remove classes from each matching selection
	 *
	 * @param {(function|string)} value
	 * @returns {$}
	 */
	removeClass(value) {
		W.$removeClass(this, value);

		return this;
	},

	/**
	 * Replace each matching selection with selection or markup
	 *
	 * @param {($|HTMLElement|string)} source
	 * @returns {$}
	 */
	replaceWith(source) {
		W.$replaceWith(this, source);

		return this;
	},

	/**
	 * Get or set the X scroll position of each matching selection
	 *
	 * @param value
	 * @returns {($|number)}
	 */
	scrollLeft(value) {
		let r = W.$scrollLeft(this, value);

		return value === U || value === true ? r : this;
	},

	/**
	 * Get or set the Y scroll position of each matching selection
	 *
	 * @param value
	 * @returns {($|number)}
	 */
	scrollTop(value) {
		let r = W.$scrollTop(this, value);

		return value === U || value === true ? r : this;
	},

	/**
	 * Serialize input values from first matching form selection
	 *
	 * @param {boolean} json
	 * @returns {string}
	 */
	serialize(json) {
		return W.$serializeForm(this, json);
	},

	/**
	 * Show each matching selection
	 *
	 * @returns {$}
	 */
	show() {
		W.$show(this);

		return this;
	},

	/**
	 * Get unique siblings of each matching selection
	 *
	 * @param filter
	 * @returns {$}
	 */
	siblings(filter) {
		return $(W.$siblings(this, filter));
	},

	/**
	 * Get subset of selection matches from specified range
	 *
	 * @param start
	 * @param end
	 * @returns {$}
	 */
	slice(start, end) {
		return $(W.$slice(this, start, end));
	},

	/**
	 * Get inner text of first selection or set each matching selection's text
	 *
	 * @param {(function|string)} value
	 * @returns {($|string)}
	 */
	text(value) {
		let r = W.$text(this, value);
		return value !== U ? this : r;
	},

	/**
	 * Toggle the display of each matching selection
	 *
	 * @returns {$}
	 */
	toggle() {
		W.$toggle(this);

		return this;
	},

	/**
	 * Toggle adding and removing class(es) from the specified element
	 *
	 * @param {(function|string)} className
	 * @param {boolean} [state]
	 * @returns {$}
	 */
	toggleClass(className, state) {
		W.$toggleClass(this, className, state);

		return this;
	},

	/**
	 * Get value of first matching selection or set values of
	 * each matching selection
	 *
	 * @param {(function|string)} value
	 * @returns {($|string)}
	 */
	val(value) {
		let r = W.$val(this, value);

		return value !== U ? this : r;
	},

	/**
	 * Get or set the width of each matching selection
	 *
	 * @param {(function|number|string)} value
	 * @returns {($|number)}
	 */
	width(value) {
		let r = W.$width(this, value);

		return value === U || value === true ? r : this;
	},

	/**
	 * Wrap markup around each matching selection
	 *
	 * @param {(function|string)} html
	 * @returns {$}
	 */
	wrap(html) {
		W.$wrap(this, html);

		return this;
	},

	/**
	 * Wrap markup around the content of each matching selection
	 *
	 * @param {(function|string)} html
	 * @returns {$}
	 */
	wrapInner(html) {
		W.$wrapInner(this, html);

		return this;
	}
});

export default $;