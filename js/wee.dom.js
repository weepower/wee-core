/* jshint maxdepth: 4 */

(function(W, U) {
	'use strict';

	/**
	 * Get the selected options from a select
	 *
	 * @private
	 * @param {HTMLElement} select
	 * @returns {Array} selected
	 */
	var _getSelected = function(select) {
		var arr = [];

		W._slice.call(select.options).map(function(el) {
			if (el.selected) {
				arr.push(el.value);
			}
		});

		return arr;
	},

	/**
	 * Get class value of element
	 *
	 * @private
	 * @param {HTMLElement} el
	 * @returns {string}
	 */
	_getClass = function(el) {
		return el instanceof SVGElement ?
			el.getAttribute('class') :
			el.className;
	},

	/**
	 * Set class value of element
	 *
	 * @private
	 * @param {HTMLElement} el
	 * @param {string} className
	 */
	_setClass = function(el, className) {
		el instanceof SVGElement ?
			el.setAttribute('class', className) :
			el.className = className;
	},

	/**
	 * Return either direct previous or next sibling
	 *
	 * @private
	 * @param {($|HTMLElement|string)} target
	 * @param {int} dir
	 * @param filter
	 * @param {object} [options]
	 * @returns {HTMLElement}
	 */
	_getSibling = function(target, dir, filter, options) {
		var match;

		W.$each(target, function(el) {
			var index = W.$index(el) + dir;

			W.$children(W.$parent(el)).forEach(function(el, i) {
				if (i === index &&
					(! filter || filter && W.$is(el, filter, options))) {
					match = el;
				}
			});
		});

		return match;
	},

	/**
	 * Convert dash-separated string to camel-case
	 *
	 * @private
	 * @param {string} name
	 * @returns {string}
	 */
	_toCamel = function(name) {
		return name.toLowerCase()
			.replace(/-(.)/g, function(match, val) {
				return val.toUpperCase();
			});
	},

	/**
	 * Convert camel-cased string to dash-separated
	 *
	 * @private
	 * @param {string} name
	 * @returns {string}
	 */
	_toDashed = function(name) {
		return name.replace(/[A-Z]/g, function(match) {
			return '-' + match[0].toLowerCase();
		});
	};

	W.fn.extend({
		/**
		 * Add classes to each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {(function|string)} value
		 */
		$addClass: function(target, value) {
			var func = W._canExec(value);

			W.$each(target, function(el, i) {
				var cn = _getClass(el),
					name = func ?
						W.$exec(value, {
							args: [i, cn],
							scope: el
						}) :
						value;

				if (name) {
					var names = cn.split(' '),
						upd = name.split(' ').filter(function(val) {
							return names.indexOf(val) < 0;
						});

					upd.unshift(cn);

					_setClass(el, upd.join(' '));
				}
			});
		},

		/**
		 * Insert selection or markup after each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {($|function|HTMLElement|string)} source
		 * @param {boolean} [remove=false]
		 */
		$after: function(target, source, remove) {
			var func = W._canExec(source);

			W.$each(target, function(el, i) {
				var aft = func ?
					W.$exec(source, {
						args: [i, el.innerHTML],
						scope: el
					}) :
					source;

				if (typeof aft == 'string') {
					aft = W.$parseHTML(aft);
				}

				if (aft) {
					var par = el.parentNode;

					W.$each(aft, function(cel) {
						if (i > 0) {
							cel = W.$clone(cel)[0];
						}

						par.insertBefore(cel, el.nextSibling);

						W.$setRef(par);
					}, {
						reverse: true
					});
				}

				if (remove) {
					W.$remove(el);
				}
			});
		},

		/**
		 * Append selection or markup after each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {($|function|HTMLElement|string)} source
		 */
		$append: function(target, source) {
			var func = W._canExec(source);

			W.$each(target, function(el, i) {
				var app = func ?
					W.$exec(source, {
						args: [i, el.innerHTML],
						scope: el
					}) :
					source;

				if (typeof app == 'string') {
					app = W.$parseHTML(app);
				}

				if (app) {
					W.$each(app, function(cel) {
						el.appendChild(cel);
					});

					W.$setRef(el);
				}
			});
		},

		/**
		 * Get attribute of first matching selection or set attribute
		 * of each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param a
		 * @param b
		 * @returns {(string|undefined)}
		 */
		$attr: function(target, a, b) {
			var obj = W.$isObject(a);

			if (b !== U || obj) {
				var func = ! obj && W._canExec(b);

				W.$each(target, function(el, i) {
					obj ?
						Object.keys(a).forEach(function(key) {
							el.setAttribute(key, a[key]);
						}) :
						el.setAttribute(a, func ?
							W.$exec(b, {
								args: [i, el],
								scope: el
							}) :
							b
						);
				});
			} else {
				return W.$(target)[0].getAttribute(a);
			}
		},

		/**
		 * Insert selection or markup before each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {($|function|HTMLElement|string)} source
		 * @param {boolean} [remove=false]
		 */
		$before: function(target, source, remove) {
			var func = W._canExec(source);

			W.$each(target, function(el, i) {
				var bef = func ?
					W.$exec(source, {
						args: [i, el.innerHTML],
						scope: el
					}) :
					source;

				if (typeof bef == 'string') {
					bef = W.$parseHTML(bef);
				}

				if (bef) {
					var par = el.parentNode;

					W.$each(bef, function(cel) {
						if (i > 0) {
							cel = W.$clone(cel)[0];
						}

						par.insertBefore(cel, el);

						W.$setRef(par);
					}, {
						reverse: true
					});
				}

				if (remove) {
					W.$remove(el);
				}
			});
		},

		/**
		 * Get unique direct children of each matching selection
		 *
		 * @param {($|HTMLElement|string)} parent
		 * @param filter
		 * @returns {Array}
		 */
		$children: function(parent, filter) {
			var arr = [];

			W.$each(parent, function(el) {
				var children = W._slice.call(el.children);

				arr = arr.concat(
					filter ?
						W.$filter(children, filter) :
						children
				);
			});

			return W.$unique(arr);
		},

		/**
		 * Clone each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @returns {Array}
		 */
		$clone: function(target) {
			return W.$map(target, function(el) {
				return el.cloneNode(true);
			});
		},

		/**
		 * Get unique closest ancestors of each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param filter
		 * @param context
		 * @returns {HTMLElement}
		 */
		$closest: function(target, filter, context) {
			return W.$unique(W.$map(target, function(el) {
				if (W.$is(el, filter)) {
					return el;
				}

				while (el !== null) {
					el = el.parentNode;

					if (el === W._html) {
						return false;
					}

					if (W.$is(el, filter)) {
						return el;
					}
				}
			}, {
				context: context
			}));
		},

		/**
		 * Determine if any matching parent contains descendant selection
		 *
		 * @param {($|HTMLElement|string)} parent
		 * @param descendant
		 * @returns {boolean}
		 */
		$contains: function(parent, descendant) {
			var b = false;

			W.$each(parent, function(el) {
				if (W.$(descendant, el).length) {
					b = true;
					return false;
				}
			});

			return b;
		},

		/**
		 * Get unique content of each matching selection
		 *
		 * @param {($|HTMLElement|string)} parent
		 * @returns {Array}
		 */
		$contents: function(parent) {
			var arr = [];

			W.$each(parent, function(el) {
				arr = arr.concat(W._slice.call(el.childNodes));
			});

			return W.$unique(arr);
		},

		/**
		 * Get CSS value of first matching selection or set value
		 * of each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {(object|string)} a
		 * @param {(function|string)} [b]
		 * @returns {(string|undefined)}
		 */
		$css: function(target, a, b) {
			var obj = W.$isObject(a);

			if (b !== U || obj) {
				var func = ! obj && W._canExec(b);

				W.$each(target, function(el, i) {
					obj ?
						Object.keys(a).forEach(function(key) {
							el.style[key] = a[key];
						}) :
						el.style[a] = func ?
							W.$exec(b, {
								args: [i, el.style[a]],
								scope: el
							}) :
							b;
				});
			} else {
				var el = W.$(target)[0];

				return getComputedStyle(el, null)[a];
			}
		},

		/**
		 * Get data of first matching selection or set data
		 * of each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param a
		 * @param [b]
		 * @returns {(object|string|undefined)}
		 */
		$data: function(target, a, b) {
			if (a === U) {
				var el = W.$(target)[0],
					arr = {};

				W._slice.call(el.attributes).forEach(function(attr) {
					if (attr.name.substr(0, 5) == 'data-') {
						arr[_toCamel(attr.name.substr(5))] =
							W._castString(attr.value);
					}
				});

				return arr;
			}

			if (W.$isObject(a)) {
				var obj = {};

				Object.keys(a).forEach(function(key) {
					obj['data-' + _toDashed(key)] = a[key];
				});

				a = obj;
			} else {
				a = 'data-' + _toDashed(a);
			}

			return W._castString(W.$attr(target, a, b));
		},

		/**
		 * Remove child nodes from each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 */
		$empty: function(target) {
			W.$each(target, function(el) {
				while (el.firstChild) {
					el.removeChild(el.firstChild);
				}

				W.$setRef(el);
			});
		},

		/**
		 * Get indexed node of matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {int} index
		 * @param {($|HTMLElement|string)} [context=document]
		 * @returns {HTMLElement}
		 */
		$eq: function(target, index, context) {
			var el = W.$(target, context);

			return el[index < 0 ? el.length + index : index];
		},

		/**
		 * Return a filtered subset of elements from a matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param filter
		 * @param [options]
		 * @returns {Array} elements
		 */
		$filter: function(target, filter, options) {
			var func = W._canExec(filter);

			return W.$map(target, function(el, i) {
				var match = func ?
					W.$exec(filter, {
						args: [i, el],
						scope: el
					}) :
					W.$is(el, filter, options);

				return match ? el : false;
			});
		},

		/**
		 * Get unique filtered descendants from each matching selection
		 *
		 * @param {($|HTMLElement|string)} parent
		 * @param filter
		 * @returns {Array} elements
		 */
		$find: function(parent, filter) {
			var arr = [];

			W.$each(parent, function(el) {
				arr = arr.concat(W.$(filter, el));
			});

			return W.$unique(arr);
		},

		/**
		 * Get the first element of a matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {($|HTMLElement|string)} [context=document]
		 * @returns {HTMLElement}
		 */
		$first: function(target, context) {
			return W.$(target, context)[0];
		},

		/**
		 * Determine if the matching selection has a class
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {string} className
		 * @returns {boolean}
		 */
		$hasClass: function(target, className) {
			return W.$(target).some(function(el) {
				return new RegExp('(^| )' + className + '($| )', 'gim')
					.test(_getClass(el));
			});
		},

		/**
		 * Get or set the height of each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {(boolean|function|number|string)} value
		 * @returns {number}
		 */
		$height: function(target, value) {
			var func = value && W._canExec(value),
				height;

			if (value === U || value === true || func) {
				var el = W.$(target)[0];

				if (el === W._win) {
					height = el.innerHeight;
				} else if (el === W._doc) {
					height = el.documentElement.scrollHeight;
				} else {
					height = el.offsetHeight;

					if (value === true) {
						var style = getComputedStyle(el);
						height += parseFloat(style.marginTop) +
							parseFloat(style.marginBottom);
					}
				}

				if (! func) {
					return height;
				}
			}

			W.$each(target, function(el, i) {
				value = func ?
					W.$exec(value, {
						args: [i, height],
						scope: el
					}) :
					value;

				if (typeof value == 'number') {
					value += 'px';
				}

				W.$css(el, 'height', value);
			});
		},

		/**
		 * Hide each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 */
		$hide: function(target) {
			W.$addClass(target, 'js-hide');
		},

		/**
		 * Get inner HTML of first selection or set each matching selection HTML
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {(function|string)} value
		 * @returns {(string|undefined)}
		 */
		$html: function(target, value) {
			if (value === U) {
				return W.$(target)[0].innerHTML;
			}

			var func = W._canExec(value);

			W.$each(target, function(el, i) {
				var html = func ?
					W.$exec(value, {
						args: [i, el.innerHTML],
						scope: el
					}) :
					value;

				if (html !== false && html !== U) {
					if (el.nodeName == 'SELECT' && ! W._win.atob) {
						el.outerHTML = el.outerHTML.replace(
							el.innerHTML + '</s', html + '</s'
						);
					} else {
						el.innerHTML = html;
					}

					W.$setRef(el);
				}
			});
		},

		/**
		 * Get the zero-based index of a matching selection relative
		 * to it's siblings
		 *
		 * @param {($|HTMLElement|string)} target
		 * @returns {int}
		 */
		$index: function(target) {
			var el = W.$(target)[0],
				children = W._slice.call(el.parentNode.children),
				i = 0;

			for (; i < children.length; i++) {
				if (children[i] === el) {
					return i;
				}
			}

			return -1;
		},

		/**
		 * Insert each matching source selection element after
		 * each matching target selection
		 *
		 * @param {($|HTMLElement|string)} source
		 * @param {($|HTMLElement|string)} target
		 */
		$insertAfter: function(source, target) {
			W.$each(target, function(el, i) {
				var par = el.parentNode;

				W.$each(source, function(cel) {
					if (i > 0) {
						cel = W.$clone(cel)[0];
					}

					par.insertBefore(cel, el.nextSibling);

					W.$setRef(par);
				});
			});
		},

		/**
		 * Insert each matching source selection element before
		 * each matching target selection
		 *
		 * @param {($|HTMLElement|string)} source
		 * @param {($|HTMLElement|string)} target
		 */
		$insertBefore: function(source, target) {
			W.$each(target, function(el) {
				W.$each(source, function(cel) {
					el.parentNode.insertBefore(cel, el);
				});
			});
		},

		/**
		 * Determine if at least one matching selection matches
		 * a specified criteria
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param filter
		 * @param [options]
		 * @returns {boolean}
		 */
		$is: function(target, filter, options) {
			return W.$map(target, function(el, i) {
				if (typeof filter == 'string' && filter.slice(0, 4) == 'ref:') {
					return W.$(filter).indexOf(el) > -1;
				}

				if (W.$isObject(filter)) {
					for (var key in filter) {
						if (filter[key] === el) {
							return true;
						}
					}

					return false;
				}

				if (Array.isArray(filter)) {
					return filter.indexOf(el) > -1;
				}

				if (W._canExec(filter)) {
					return W.$exec(filter, W.$extend({
						args: [i, el],
						scope: el
					}, options));
				}

				return (
					el.matches ||
					el.msMatchesSelector ||
					el.webkitMatchesSelector ||
					el.mozMatchesSelector
				).call(el, filter);
			}).length > 0;
		},

		/**
		 * Get the last element of a matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {($|HTMLElement|string)} [context=document]
		 * @returns {HTMLElement}
		 */
		$last: function(target, context) {
			return W.$eq(target, -1, context);
		},

		/**
		 * Get the unique next sibling of each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param filter
		 * @param {object} [options]
		 * @returns {Array} elements
		 */
		$next: function(target, filter, options) {
			return W.$unique(W.$map(target, function(el) {
				return _getSibling(el, 1, filter, options);
			}));
		},

		/**
		 * Returns elements not matching the filtered selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param filter
		 * @param {object} [options]
		 * @returns {Array} elements
		 */
		$not: function(target, filter, options) {
			var func = W._canExec(filter);

			return W.$map(target, function(el, i) {
				return (func ?
					W.$exec(filter, {
						args: [i, el],
						scope: el
					}) :
					W.$is(el, filter, options)) ? false : el;
			});
		},

		/**
		 * Get the position of a matching selection relative to the document
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {(function|number)} value
		 * @returns {{top: number, left: number}}
		 */
		$offset: function(target, value) {
			var rect = W.$(target)[0].getBoundingClientRect(),
				offset = {
					top: rect.top + W._win.pageYOffset,
					left: rect.left + W._win.pageXOffset
				};

			if (value) {
				var func = W._canExec(value);

				W.$each(target, function(el, i) {
					var set = func ?
						W.$exec(value, {
							args: [i, offset],
							scope: el
						}) :
						value;

					if (typeof set.top == 'number') {
						set.top = set.top + 'px';
					}

					if (typeof set.left == 'number') {
						set.left = set.left + 'px';
					}

					W.$css(el, set);
				});
			} else {
				return offset;
			}
		},

		/**
		 * Get unique parent from each matching selection
		 *
		 * @param {($|HTMLElement|string)} child
		 * @param filter
		 * @returns {Array} elements
		 */
		$parent: function(child, filter) {
			return W.$unique(W.$map(child, function(el) {
				var parent = el.parentNode;
				return ! filter || W.$is(parent, filter) ? parent : false;
			}));
		},

		/**
		 * Get unique ancestors of each matching selection
		 *
		 * @param {($|HTMLElement|string)} child
		 * @param filter
		 * @returns {Array} elements
		 */
		$parents: function(child, filter) {
			var arr = [];

			W.$each(child, function(el) {
				while (el !== null) {
					el = el.parentNode;

					if (! filter || (filter && W.$is(el, filter))) {
						arr.push(el);
					}

					if (el === W._html) {
						return false;
					}
				}
			});

			return W.$unique(arr);
		},

		/**
		 * Get the position of the first matching selection relative
		 * to its offset parent
		 *
		 * @param {($|HTMLElement|string)} target
		 * @returns {{top: number, left: number}}
		 */
		$position: function(target) {
			var el = W.$(target)[0];

			return {
				top: el.offsetTop,
				left: el.offsetLeft
			};
		},

		/**
		 * Prepend selection or markup before each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {($|function|HTMLElement|string)} source
		 */
		$prepend: function(target, source) {
			var func = W._canExec(source);

			W.$each(target, function(el, i) {
				var pre = func ?
					W.$exec(source, {
						args: [i, el.innerHTML],
						scope: el
					}) :
					source;

				if (typeof pre == 'string') {
					pre = W.$parseHTML(pre);
				}

				if (pre) {
					W.$each(pre, function(cel) {
						el.insertBefore(cel, el.firstChild);
					});

					W.$setRef(el);
				}
			});
		},

		/**
		 * Get the unique previous sibling of each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param filter
		 * @param {object} [options]
		 * @returns {Array} elements
		 */
		$prev: function(target, filter, options) {
			return W.$unique(W.$map(target, function(el) {
				return _getSibling(el, -1, filter, options);
			}));
		},

		/**
		 * Get property of first matching selection or set property of
		 * each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param a
		 * @param b
		 * @returns {*}
		 */
		$prop: function(target, a, b) {
			var obj = W.$isObject(a);

			if (b !== U || obj) {
				var func = ! obj && W._canExec(b);

				W.$each(target, function(el, i) {
					obj ?
						Object.keys(a).forEach(function(key) {
							el[key] = a[key];
						}) :
						el[a] = func ?
							W.$exec(b, {
								args: [i, el],
								scope: el
							}) :
							b;
				});
			} else {
				var el = W.$(target)[0];

				return el[a];
			}
		},

		/**
		 * Remove each matching selection from the document
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {($|HTMLElement|string)} [context=document]
		 */
		$remove: function(target, context) {
			var arr = [];

			W.$each(target, function(el) {
				var par = el.parentNode;

				arr.push(el);

				par.removeChild(el);

				W.$setRef(par);
			}, {
				context: context
			});

			return arr;
		},

		/**
		 * Remove specified attribute of each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {string} name
		 */
		$removeAttr: function(target, name) {
			W.$each(target, function(el) {
				name.split(/\s+/).forEach(function(value) {
					el.removeAttribute(value);
				});
			});
		},

		/**
		 * Remove classes from each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {(function|string)} value
		 */
		$removeClass: function(target, value) {
			var func = W._canExec(value);

			W.$each(target, function(el, i) {
				var cn = _getClass(el),
					name = func ?
						W.$exec(value, {
							args: [i, cn],
							scope: el
						}) :
						value;

				if (name) {
					var names = name.split(' ');

					_setClass(el, cn.split(' ').filter(function(val) {
						return names.indexOf(val) < 0;
					}).join(' '));
				}
			});
		},

		/**
		 * Replace each matching selection with selection or markup
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {($|HTMLElement|string)} source
		 */
		$replaceWith: function(target, source) {
			W.$after(target, source, true);
		},

		/**
		 * Get or set the X scroll position of each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {number} value
		 * @returns {number}
		 */
		$scrollLeft: function(target, value) {
			if (value === U) {
				var el = target ? W.$(target)[0] : W._win;

				return el === W._win ?
					el.pageXOffset :
					el.scrollLeft;
			}

			W.$each(target, function(el) {
				el.scrollLeft = value;
			});
		},

		/**
		 * Get or set the Y scroll position of each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {number} value
		 * @returns {number}
		 */
		$scrollTop: function(target, value) {
			if (value === U) {
				var el = target ? W.$(target)[0] : W._win;

				return el === W._win ?
					el.pageYOffset :
					el.scrollTop;
			}

			W.$each(target, function(el) {
				el.scrollTop = value;
			});
		},

		/**
		 * Serialize input values from first matching form selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {boolean} json
		 * @returns {string}
		 */
		$serializeForm: function(target, json) {
			var el = W.$(target)[0],
				obj = {},
				i = 0;

			if (el.nodeName != 'FORM') {
				return '';
			}

			for (; i < el.elements.length; i++) {
				var child = el.elements[i],
					name = child.name,
					type = child.type;

				if (name && type != 'file' && type != 'reset') {
					var arr = name.slice(-2) == '[]';

					if (arr) {
						name = name.slice(0, -2);
					}

					if (type == 'select-multiple') {
						obj[name] = _getSelected(child);
					} else if (
						type != 'submit' && type != 'button' &&
						((type != 'checkbox' && type != 'radio') ||
						child.checked)) {
						if (arr || (type == 'checkbox' && obj[name])) {
							obj[name] = W.$toArray(obj[name]);
							obj[name].push(child.value);
						} else {
							obj[name] = child.value;
						}
					}
				}
			}

			return json ? obj : W.$serialize(obj);
		},

		/**
		 * Show each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 */
		$show: function(target) {
			W.$removeClass(target, 'js-hide');
		},

		/**
		 * Get unique siblings of each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param filter
		 * @returns {Array} elements
		 */
		$siblings: function(target, filter) {
			var arr = [];

			W.$each(target, function(el) {
				var siblings = W._slice.call(el.parentNode.children)
					.filter(function(a) {
						return a !== el;
					});

				arr = arr.concat(
					filter ?
						W.$filter(siblings, filter) :
						siblings
				);
			});

			return W.$unique(arr);
		},

		/**
		 * Get subset of selection matches from specified range
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {int} start
		 * @param {int} end
		 * @returns {Array} elements
		 */
		$slice: function(target, start, end) {
			if (! target._$) {
				target = W._selArray(target);
			}

			return W._slice.call(target, start, end);
		},

		/**
		 * Get inner text of first selection or set each matching selection text
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {(function|string)} value
		 * @returns {string}
		 */
		$text: function(target, value) {
			if (value === U) {
				return W.$map(target, function(el) {
					return el.textContent.trim();
				}).join('');
			}

			var func = W._canExec(value);

			W.$each(target, function(el, i) {
				el.textContent = func ?
					W.$exec(value, {
						args: [i, el.textContent.trim()],
						scope: el
					}) :
					value;
			});
		},

		/**
		 * Toggle the display of each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 */
		$toggle: function(target) {
			W.$each(target, function(el) {
				! W.$hasClass(el, 'js-hide') ?
					W.$hide(el) :
					W.$show(el);
			});
		},

		/**
		 * Toggle adding and removing class(es) from the specified element
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {(function|string)} className
		 * @param {boolean} [state]
		 */
		$toggleClass: function(target, className, state) {
			var func = W._canExec(className);

			W.$each(target, function(el, i) {
				if (func) {
					className = W.$exec(className, {
						args: [i, _getClass(el), state],
						scope: el
					});
				}

				if (className) {
					className.split(/\s+/).forEach(function(value) {
						state === false ||
						(state === U && W.$hasClass(el, value)) ?
							W.$removeClass(el, value) :
							W.$addClass(el, value);
					});
				}
			});
		},

		/**
		 * Get value of first matching selection or set match values
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {(function|string)} value
		 * @returns {(Array|string)}
		 */
		$val: function(target, value) {
			if (value === U) {
				var el = W.$(target)[0];

				if (el.type == 'select-multiple') {
					return _getSelected(el);
				}

				return el.value;
			}

			var func = W._canExec(value);

			W.$each(target, function(el, i) {
				if (el.type == 'select-multiple') {
					value = W.$toArray(value);

					W._slice.call(el.options).forEach(function(a) {
						if (value.indexOf(a.value) > -1) {
							a.selected = true;
						}
					});
				} else {
					el.value = func ?
						W.$exec(value, {
							args: [i, el.value],
							scope: el
						}) :
						value;
				}
			});
		},

		/**
		 * Get or set the width of each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {(boolean|function|number|string)} value
		 * @returns {number}
		 */
		$width: function(target, value) {
			var func = value && W._canExec(value),
				width;

			if (value === U || value === true || func) {
				var el = W.$(target)[0];

				if (el === W._win) {
					width = el.innerWidth;
				} else if (el === W._doc) {
					width = el.documentElement.scrollWidth;
				} else {
					width = el.offsetWidth;

					if (value === true) {
						var style = getComputedStyle(el);
						width += parseFloat(style.marginLeft) +
							parseFloat(style.marginRight);
					}
				}

				if (! func) {
					return width;
				}
			}

			W.$each(target, function(el, i) {
				value = func ?
					W.$exec(value, {
						args: [i, width],
						scope: el
					}) :
					value;

				if (typeof value == 'number') {
					value += 'px';
				}

				W.$css(el, 'width', value);
			});
		},

		/**
		 * Wrap markup around each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {(function|string)} html
		 */
		$wrap: function(target, html) {
			var func = W._canExec(html);

			W.$each(target, function(el, i) {
				var wrap = W.$(
					func ?
						W.$exec(html, {
							args: i,
							scope: el
						}) :
						html
				);

				if (wrap) {
					var par = el.parentNode;

					W.$each(wrap, function(cel) {
						cel = cel.cloneNode(true);

						par.insertBefore(cel, el);
						cel.appendChild(el);

						W.$setRef(par);
					});
				}
			});
		},

		/**
		 * Wrap markup around the content of each matching selection
		 *
		 * @param {($|HTMLElement|string)} target
		 * @param {(function|string)} html
		 */
		$wrapInner: function(target, html) {
			var func = W._canExec(html);

			W.$each(target, function(el, i) {
				var wrap = W.$parseHTML(
					func ?
						W.$exec(html, {
							args: i,
							scope: el
						}) :
						html
				);

				if (wrap) {
					var children = W.$children(el);

					if (! children.length) {
						children = W.$html(el);

						W.$empty(el);
						W.$html(wrap, children);
					} else {
						W.$each(children, function(cel) {
							wrap[0].appendChild(cel);
						});
					}

					W.$append(el, wrap);
				}
			});
		}
	});
})(Wee, undefined);