import { $exec } from '../core/core';
import { _castString, _slice, $extend, $isFunction, $isNumber, $isObject, $isString, $serialize, $toArray } from '../core/types';
import { _doc, _html, _win, U } from '../core/variables';
import { $each, $map, $parseHTML, $sel, $setRef, $unique, _selArray } from '../core/dom';

/**
 * Get class value of element
 *
 * @private
 * @param {HTMLElement} el
 * @returns {string}
 */
function _getClass(el) {
	return el instanceof SVGElement ?
		el.getAttribute('class') :
		el.className;
}

/**
 * Set class value of element
 *
 * @private
 * @param {HTMLElement} el
 * @param {string} className
 */
function _setClass(el, className) {
	el instanceof SVGElement ?
		el.setAttribute('class', className) :
		el.className = className;
}

/**
 * Convert dash-separated string to camel-case
 *
 * @private
 * @param {string} name
 * @returns {string}
 */
function _toCamel (name) {
	return name.toLowerCase()
		.replace(/-(.)/g, (match, val) => {
			return val.toUpperCase();
		});
}

/**
 * Convert camel-cased string to dash-separated
 *
 * @private
 * @param {string} name
 * @returns {string}
 */
function _toDashed(name) {
	return name.replace(/[A-Z]/g, match => {
		return '-' + match[0].toLowerCase();
	});
}

/**
 * Get the selected options from a select
 *
 * @private
 * @param {HTMLElement} select
 * @returns {Array} selected
 */
 function _getSelected(select) {
	let arr = [];

	_slice.call(select.options).map(el => {
		if (el.selected) {
			arr.push(el.value);
		}
	});

	return arr;
}

/**
 * Return either direct previous or next sibling
 *
 * @private
 * @param {($|HTMLElement|string)} target
 * @param {number} dir
 * @param filter
 * @param {Object} [options]
 * @returns {HTMLElement}
 */
function _getSibling(target, dir, filter, options) {
	let match;

	$each(target, el => {
		let index = $index(el) + dir;

		$children($parent(el)).forEach((el, i) => {
			if (i === index &&
				(! filter || filter && $is(el, filter, options))) {
				match = el;
			}
		});
	});

	return match;
}

/**
 * Add classes to each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {(function|string)} value
 */
export function $addClass(target, value) {
	let func = $isFunction(value);

	$each(target, (el, i) => {
		let cn = _getClass(el),
			name = func ?
				$exec(value, {
					args: [i, cn],
					scope: el
				}) :
				value;

		if (name) {
			let names = cn.split(' '),
				upd = name.split(' ').filter(val => {
					return names.indexOf(val) < 0;
				});

			upd.unshift(cn);

			_setClass(el, upd.join(' '));
		}
	});
}

/**
 * Insert selection or markup after each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {($|function|HTMLElement|string)} source
 * @param {boolean} [remove=false]
 */
export function $after(target, source, remove) {
	const func = $isFunction(source);

	$each(target, (el, i) => {
		let aft = func ?
			$exec(source, {
				args: [i, el.innerHTML],
				scope: el
			}) :
			source;

		if ($isString(aft)) {
			aft = $parseHTML(aft);
		}

		if (aft) {
			let par = el.parentNode;

			$each(aft, cel => {
				if (i > 0) {
					cel = $clone(cel)[0];
				}

				par.insertBefore(cel, el.nextSibling);

				$setRef(par);
			}, {
				reverse: true
			});
		}

		if (remove) {
			$remove(el);
		}
	});
}

/**
 * Append selection or markup after each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {($|function|HTMLElement|string)} source
 */
export function $append(target, source) {
	let func = $isFunction(source);

	$each(target, (el, i) => {
		let app = func ?
			$exec(source, {
				args: [i, el.innerHTML],
				scope: el
			}) :
			source;

		if ($isString(app)) {
			app = $parseHTML(app);
		}

		if (app) {
			$each(app, cel => {
				el.appendChild(cel);
			});

			$setRef(el);
		}
	});
}

/**
 * Get attribute of first matching selection or set attribute
 * of each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param a
 * @param b
 * @returns {(string|undefined)}
 */
export function $attr(target, a, b) {
	let obj = $isObject(a);

	if (b !== U || obj) {
		let func = ! obj && $isFunction(b);

		$each(target, function(el, i) {
			obj ?
				Object.keys(a).forEach(function(key) {
					el.setAttribute(key, a[key]);
				}) :
				el.setAttribute(a, func ?
					$exec(b, {
						args: [i, el],
						scope: el
					}) :
					b
				);
		});
	} else {
		return $sel(target)[0].getAttribute(a);
	}
}

/**
 * Insert selection or markup before each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {($|function|HTMLElement|string)} source
 * @param {boolean} [remove=false]
 */
export function $before(target, source, remove) {
	let func = $isFunction(source);

	$each(target, function(el, i) {
		let bef = func ?
			$exec(source, {
				args: [i, el.innerHTML],
				scope: el
			}) :
			source;

		if ($isString(bef)) {
			bef = $parseHTML(bef);
		}

		if (bef) {
			let par = el.parentNode;

			$each(bef, function(cel) {
				if (i > 0) {
					cel = $clone(cel)[0];
				}

				par.insertBefore(cel, el);

				$setRef(par);
			}, {
				reverse: true
			});
		}

		if (remove) {
			$remove(el);
		}
	});
}

/**
 * Get unique direct children of each matching selection
 *
 * @param {($|HTMLElement|string)} parent
 * @param filter
 * @returns {Array}
 */
export function $children(parent, filter) {
	let arr = [];

	$each(parent, function(el) {
		let children = _slice.call(el.children);

		arr = arr.concat(
			filter ?
				$filter(children, filter) :
				children
		);
	});

	return $unique(arr);
}

/**
 * Clone each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @returns {Array}
 */
export function $clone(target) {
	return $map(target, el => {
		return el.cloneNode(true);
	});
}

/**
 * Get unique closest ancestors of each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param filter
 * @param context
 * @returns {HTMLElement|boolean}
 */
export function $closest(target, filter, context) {
	return $unique($map(target, function(el) {
		if ($is(el, filter)) {
			return el;
		}

		while (el !== null) {
			el = el.parentNode;

			if (el === _html || el === document) {
				return false;
			}

			if ($is(el, filter)) {
				return el;
			}
		}
	}, {
		context: context
	}));
}

/**
 * Determine if any matching parent contains descendant selection
 *
 * @param {($|HTMLElement|string)} parent
 * @param descendant
 * @returns {boolean}
 */
export function $contains(parent, descendant) {
	let b = false;

	$each(parent, function(el) {
		if ($sel(descendant, el).length) {
			b = true;
			return false;
		}
	});

	return b;
}

/**
 * Get unique content of each matching selection
 *
 * @param {($|HTMLElement|string)} parent
 * @returns {Array}
 */
export function $contents(parent) {
	let arr = [];

	$each(parent, el => {
		arr = arr.concat(_slice.call(el.childNodes));
	});

	return $unique(arr);
}

/**
 * Get CSS value of first matching selection or set value
 * of each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {(object|string)} a
 * @param {(function|string)} [b]
 * @returns {(string|undefined)}
 */
export function $css(target, a, b) {
	let obj = $isObject(a);

	if (b !== U || obj) {
		let func = ! obj && $isFunction(b);

		$each(target, (el, i) => {
			obj ?
				Object.keys(a).forEach(key => {
					el.style[key] = a[key];
				}) :
				el.style[a] = func ?
					$exec(b, {
						args: [i, el.style[a]],
						scope: el
					}) :
					b;
		});
	} else {
		let el = $sel(target)[0];

		return getComputedStyle(el, null)[a];
	}
}

/**
 * Get data of first matching selection or set data
 * of each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param a
 * @param [b]
 * @returns {(object|string|undefined)}
 */
export function $data(target, a, b) {
	if (a === U) {
		let el = $sel(target)[0],
			arr = {};

		_slice.call(el.attributes).forEach(attr => {
			if (attr.name.substr(0, 5) == 'data-') {
				arr[_toCamel(attr.name.substr(5))] =
					_castString(attr.value);
			}
		});

		return arr;
	}

	if ($isObject(a)) {
		let obj = {};

		Object.keys(a).forEach(key => {
			obj['data-' + _toDashed(key)] = a[key];
		});

		a = obj;
	} else {
		a = 'data-' + _toDashed(a);
	}

	return _castString($attr(target, a, b));
}

/**
 * Remove child nodes from each matching selection
 *
 * @param {($|HTMLElement|string)} target
 */
export function $empty(target) {
	$each(target, el => {
		while (el.firstChild) {
			el.removeChild(el.firstChild);
		}

		$setRef(el);
	});
}

/**
 * Get indexed node of matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {number} index
 * @param {($|HTMLElement|string)} [context=document]
 * @returns {HTMLElement}
 */
export function $eq(target, index, context) {
	let el = $sel(target, context);

	return el[index < 0 ? el.length + index : index];
}

/**
 * Return a filtered subset of elements from a matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param filter
 * @param [options]
 * @returns {Array} elements
 */
export function $filter(target, filter, options) {
	let func = $isFunction(filter);

	return $map(target, (el, i) => {
		let match = func ?
			$exec(filter, {
				args: [i, el],
				scope: el
			}) :
			$is(el, filter, options);

		return match ? el : false;
	});
}

/**
 * Get unique filtered descendants from each matching selection
 *
 * @param {($|HTMLElement|string)} parent
 * @param filter
 * @returns {Array} elements
 */
export function $find(parent, filter) {
	let arr = [];

	$each(parent, function(el) {
		arr = arr.concat($sel(filter, el));
	});

	return $unique(arr);
}

/**
 * Get the first element of a matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {($|HTMLElement|string)} [context=document]
 * @returns {HTMLElement}
 */
export function $first(target, context) {
	return $sel(target, context)[0];
}

/**
 * Determine if the matching selection has a class
 *
 * @param {($|HTMLElement|string)} target
 * @param {string} className
 * @returns {boolean}
 */
export function $hasClass(target, className) {
	return $sel(target).some(el => {
		return new RegExp('(^| )' + className + '($| )', 'gim')
			.test(_getClass(el));
	});
}

/**
 * Hide each matching selection
 *
 * @param {($|HTMLElement|string)} target
 */
export function $hide(target) {
	$addClass(target, 'js-hide');
}

/**
 * Get inner HTML of first selection or set each matching selection HTML
 *
 * @param {($|HTMLElement|string)} target
 * @param {(function|string)} value
 * @returns {(string|undefined)}
 */
export function $html(target, value) {
	if (value === U) {
		return $sel(target)[0].innerHTML;
	}

	let func = $isFunction(value);

	$each(target, (el, i) => {
		let html = func ?
			$exec(value, {
				args: [el, i, el.innerHTML],
				scope: el
			}) :
			value;

		if (html !== false && html !== U) {
			if (el.nodeName == 'SELECT' && ! _win.atob) {
				el.outerHTML = el.outerHTML.replace(
					el.innerHTML + '</s', html + '</s'
				);
			} else {
				el.innerHTML = html;
			}

			$setRef(el);
		}
	});
}

/**
 * Get the zero-based index of a matching selection relative
 * to it's siblings
 *
 * @param {($|HTMLElement|string)} target
 * @returns {number}
 */
export function $index(target) {
	let el = $sel(target)[0],
		i = 0,
		children;

	if (! el) {
		return -1;
	}

	children = _slice.call(el.parentNode.children);

	for (; i < children.length; i++) {
		if (children[i] === el) {
			return i;
		}
	}
}

/**
 * Insert each matching source selection element after
 * each matching target selection
 *
 * @param {($|HTMLElement|string)} source
 * @param {($|HTMLElement|string)} target
 */
export function $insertAfter(source, target) {
	$each(target, (el, i) => {
		let par = el.parentNode;

		$each(source, cel => {
			if (i > 0) {
				cel = $clone(cel)[0];
			}

			par.insertBefore(cel, el.nextSibling);

			$setRef(par);
		});
	});
}

/**
 * Insert each matching source selection element before
 * each matching target selection
 *
 * @param {($|HTMLElement|string)} source
 * @param {($|HTMLElement|string)} target
 */
export function $insertBefore(source, target) {
	$each(target, el => {
		$each(source, cel => {
			el.parentNode.insertBefore(cel, el);
		});
	});
}

/**
 * Get or set the height of each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {(boolean|function|number|string)} value
 * @returns {number}
 */
export function $height(target, value) {
	let func = value && $isFunction(value),
		height;

	if (value === U || value === true || func) {
		let el = $sel(target)[0];

		if (el === _win) {
			height = el.innerHeight;
		} else if (el === _doc) {
			height = el.documentElement.scrollHeight;
		} else {
			height = el.offsetHeight;

			if (value === true) {
				let style = getComputedStyle(el);
				height += parseFloat(style.marginTop) +
					parseFloat(style.marginBottom);
			}
		}

		if (! func) {
			return height;
		}
	}

	$each(target, function(el, i) {
		value = func ?
			$exec(value, {
				args: [i, height],
				scope: el
			}) :
			value;

		if ($isNumber(value)) {
			value += 'px';
		}

		$css(el, 'height', value);
	});
}

/**
 * Determine if at least one matching selection matches
 * a specified criteria
 *
 * @param {($|HTMLElement|string)} target
 * @param filter
 * @param [options]
 * @returns {boolean}
 */
export function $is(target, filter, options) {
	return $map(target, (el, i) => {
			if ($isString(filter) &&
				(filter.slice(0, 4) == 'ref:' || filter.slice(0, 1) == ':')) {
				return $sel(filter).indexOf(el) > -1;
			}

			if ($isObject(filter)) {
				for (let key in filter) {
					if (filter[key] === el) {
						return true;
					}
				}

				return false;
			}

			if (Array.isArray(filter)) {
				return filter.indexOf(el) > -1;
			}

			if ($isFunction(filter)) {
				return $exec(filter, $extend({
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
}

/**
 * Get the last element of a matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {($|HTMLElement|string)} [context=document]
 * @returns {HTMLElement}
 */
export function $last(target, context) {
	return $eq(target, -1, context);
}

/**
 * Get the unique next sibling of each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param filter
 * @param {object} [options]
 * @returns {Array} elements
 */
export function $next(target, filter, options) {
	return $unique($map(target, el => {
		return _getSibling(el, 1, filter, options)
	}));
}

/**
 * Returns elements not matching the filtered selection
 *
 * @param {($|HTMLElement|string)} target
 * @param filter
 * @param {object} [options]
 * @returns {Array} elements
 */
export function $not(target, filter, options) {
	let func = $isFunction(filter);

	return $map(target, (el, i) => {
		return (func ?
			$exec(filter, {
				args: [i, el],
				scope: el
			}) :
			$is(el, filter, options)) ? false : el;
	});
}

/**
 * Get the position of a matching selection relative to the document
 *
 * @param {($|HTMLElement|string)} target
 * @param {(function|number)} value
 * @returns {{top: number, left: number}}
 */
export function $offset(target, value) {
	let rect = $sel(target)[0].getBoundingClientRect(),
		offset = {
			top: rect.top + _win.pageYOffset,
			left: rect.left + _win.pageXOffset
		};

	if (value) {
		let func = $isFunction(value);

		$each(target, (el, i) => {
			let set = func ?
				$exec(value, {
					args: [i, offset],
					scope: el
				}) :
				value;

			if ($isNumber(set.top)) {
				set.top = set.top + 'px';
			}

			if ($isNumber(set.left)) {
				set.left = set.left + 'px';
			}

			$css(el, set);
		});
	} else {
		return offset;
	}
}

/**
 * Get unique parent from each matching selection
 *
 * @param {($|HTMLElement|string)} child
 * @param filter
 * @returns {Array} elements
 */
export function $parent(child, filter) {
	return $unique($map(child, el => {
		let parent = el.parentNode;
		return ! filter || $is(parent, filter) ? parent : false;
	}));
}

/**
 * Get the position of the first matching selection relative
 * to its offset parent
 *
 * @param {($|HTMLElement|string)} target
 * @returns {{top: number, left: number}}
 */
export function $position(target) {
	let el = $sel(target)[0];

	return {
		top: el.offsetTop,
		left: el.offsetLeft
	};
}

/**
 * Prepend selection or markup before each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {($|function|HTMLElement|string)} source
 */
export function $prepend(target, source) {
	let func = $isFunction(source);

	$each(target, (el, i) => {
		let pre = func ?
			$exec(source, {
				args: [i, el.innerHTML],
				scope: el
			}) :
			source;

		if ($isString(pre)) {
			pre = $parseHTML(pre);
		}

		if (pre) {
			$each(pre, cel => {
				el.insertBefore(cel, el.firstChild);
			});

			$setRef(el);
		}
	});
}

/**
 * Get the unique previous sibling of each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param filter
 * @param {object} [options]
 * @returns {Array} elements
 */
export function $prev(target, filter, options) {
	return $unique($map(target, el => {
		return _getSibling(el, -1, filter, options);
	}));
}

/**
 * Get property of first matching selection or set property of
 * each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param a
 * @param b
 * @returns {*}
 */
export function $prop(target, a, b) {
	let obj = $isObject(a);

	if (b !== U || obj) {
		let func = ! obj && $isFunction(b);

		$each(target, (el, i) => {
			obj ?
				Object.keys(a).forEach(key => {
					el[key] = a[key];
				}) :
				el[a] = func ?
					$exec(b, {
						args: [i, el],
						scope: el
					}) :
					b;
		});
	} else {
		let el = $sel(target)[0];

		return el[a];
	}
}

/**
 * Get unique ancestors of each matching selection
 *
 * @param {($|HTMLElement|string)} child
 * @param filter
 * @returns {Array} elements
 */
export function $parents(child, filter) {
	let arr = [];

	$each(child, el => {
		while (el !== null) {
			el = el.parentNode;

			if (! filter || (filter && $is(el, filter))) {
				arr.push(el);
			}

			if (el === _html) {
				return false;
			}
		}
	});

	return $unique(arr);
}

/**
 * Remove each matching selection from the document
 *
 * @param {($|HTMLElement|string)} target
 * @param {($|HTMLElement|string)} [context=document]
 */
export function $remove(target, context) {
	let arr = [];

	$each(target, el => {
		let par = el.parentNode;

		arr.push(el);

		par.removeChild(el);

		$setRef(par);
	}, {
		context: context
	});

	return arr;
}

/**
 * Remove specified attribute of each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {string} name
 */
export function $removeAttr(target, name) {
	$each(target, el => {
		name.split(/\s+/).forEach(value => {
			el.removeAttribute(value);
		});
	});
}

/**
 * Remove classes from each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {(function|string)} value
 */
export function $removeClass(target, value) {
	let func = $isFunction(value);

	$each(target, (el, i) => {
		let cn = _getClass(el),
			name = func ?
				$exec(value, {
					args: [i, cn],
					scope: el
				}) :
				value;

		if (name) {
			let names = name.split(' ');

			_setClass(el, cn.split(' ').filter(val => {
				return names.indexOf(val) < 0;
			}).join(' '));
		}
	});
}

/**
 * Remove specified style property of each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {string} name
 */
export function $removeStyle(target, name) {
	$each(target, el => {
		name.split(/\s+/).forEach(value => {
			el.style.removeProperty(value);
		});
	});
}

/**
 * Replace each matching selection with selection or markup
 *
 * @param {($|HTMLElement|string)} target
 * @param {($|HTMLElement|string)} source
 */
export function $replaceWith(target, source) {
	$after(target, source, true);
}

/**
 * Get or set the X scroll position of each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {number} value
 * @returns {number}
 */
export function $scrollLeft(target, value) {
    if (value === U) {
        let el = target ? $sel(target)[0] : _win;

        if (el.nodeType === 9) {
            el = el.defaultView;
        }

        return el === _win ?
            el.pageXOffset :
            el.scrollLeft;
    }

    $each(target, function(el) {
        if (el.nodeType === 9) {
            el = el.defaultView;
        }

        if (el === _win) {
            el.scrollTo(value, el.pageYOffset);
        } else {
            el.scrollLeft = value;
        }
    });
}

/**
 * Get or set the Y scroll position of each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {number} value
 * @returns {number}
 */
export function $scrollTop(target, value) {
    if (value === U) {
        let el = target ? $sel(target)[0] : _win;

        if (el.nodeType === 9) {
            el = el.defaultView;
        }

        return el === _win ?
            el.pageYOffset :
            el.scrollTop;
    }

    $each(target, el => {
        if (el.nodeType === 9) {
            el = el.defaultView;
        }

        if (el === _win) {
            el.scrollTo(el.pageXOffset, value);
        } else {
            el.scrollTop = value;
        }
    });
}

/**
 * Serialize input values from first matching form selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {boolean} json
 * @returns {string}
 */
export function $serializeForm(target, json) {
	let el = $sel(target)[0],
		obj = {},
		i = 0;

	if (el.nodeName != 'FORM') {
		return '';
	}

	for (; i < el.elements.length; i++) {
		let child = el.elements[i],
			name = child.name,
			type = child.type;

		if (name && type != 'file' && type != 'reset') {
			let arr = name.slice(-2) == '[]';

			if (arr) {
				name = name.slice(0, -2);
			}

			if (type == 'select-multiple') {
				obj[name] = _getSelected(child);
			} else if (
				type == 'hidden' && (child.value === 'true' || child.value === 'false')
			) {
				obj[name] = child.value === 'true';
			} else if (
				type != 'submit' && type != 'button' &&
				((type != 'checkbox' && type != 'radio') ||
				child.checked)) {
				if (arr || (type == 'checkbox' && obj[name])) {
					obj[name] = $toArray(obj[name]);
					obj[name].push(child.value);
				} else {
					obj[name] = child.value;
				}
			}
		}
	}

	return json ? obj : $serialize(obj);
}

/**
 * Show each matching selection
 *
 * @param {($|HTMLElement|string)} target
 */
export function $show(target) {
	$removeClass(target, 'js-hide');
}

/**
 * Get unique siblings of each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param filter
 * @returns {Array} elements
 */
export function $siblings(target, filter) {
	let arr = [];

	$each(target, el => {
		let siblings = _slice.call(el.parentNode.children)
			.filter(a => a !== el);

		arr = arr.concat(
			filter ?
				$filter(siblings, filter) :
				siblings
		);
	});

	return $unique(arr);
}

/**
 * Get subset of selection matches from specified range
 *
 * @param {($|HTMLElement|string)} target
 * @param {number} start
 * @param {number} end
 * @returns {Array} elements
 */
export function $slice(target, start, end) {
	if (! target._$) {
		target = _selArray(target);
	}

	return _slice.call(target, start, end);
}

/**
 * Get inner text of first selection or set each matching selection text
 *
 * @param {($|HTMLElement|string)} target
 * @param {(function|string)} value
 * @returns {string}
 */
export function $text(target, value) {
	if (value === U) {
		return $map(target, el => {
			return el.textContent.trim();
		}).join('');
	}

	let func = $isFunction(value);

	$each(target, (el, i) => {
		el.textContent = func ?
			$exec(value, {
				args: [i, el.textContent.trim()],
				scope: el
			}) :
			value;
	});
}

/**
 * Toggle the display of each matching selection
 *
 * @param {($|HTMLElement|string)} target
 */
export function $toggle(target) {
	$each(target, el => {
		! $hasClass(el, 'js-hide') ?
			$hide(el) :
			$show(el);
	});
}

/**
 * Toggle adding and removing class(es) from the specified element
 *
 * @param {($|HTMLElement|string)} target
 * @param {(function|string)} className
 * @param {boolean} [state]
 */
export function $toggleClass(target, className, state) {
	let func = $isFunction(className);

	$each(target, (el, i) => {
		if (func) {
			className = $exec(className, {
				args: [i, _getClass(el), state],
				scope: el
			});
		}

		if (className) {
			className.split(/\s+/).forEach(value => {
				state === false ||
				(state === U && $hasClass(el, value)) ?
					$removeClass(el, value) :
					$addClass(el, value);
			});
		}
	});
}

/**
 * Get value of first matching selection or set match values
 *
 * @param {($|HTMLElement|string)} target
 * @param {(function|string)} value
 * @returns {(Array|string)}
 */
export function $val(target, value) {
	if (value === U) {
		let el = $sel(target)[0];

		if (el.type == 'select-multiple') {
			return _getSelected(el);
		}

		return el.value;
	}

	let func = $isFunction(value);

	$each(target, (el, i) => {
		if (el.type == 'select-multiple') {
			value = $toArray(value);

			_slice.call(el.options).forEach(a => {
				if (value.indexOf(a.value) > -1) {
					a.selected = true;
				}
			});
		} else {
			el.value = func ?
				$exec(value, {
					args: [i, el.value],
					scope: el
				}) :
				value;
		}
	});
}

/**
 * Get or set the width of each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {(boolean|function|number|string)} value
 * @returns {number}
 */
export function $width(target, value) {
	let func = value && $isFunction(value),
		width;

	if (value === U || value === true || func) {
		let el = $sel(target)[0];

		if (el === _win) {
			width = el.innerWidth;
		} else if (el === _doc) {
			width = el.documentElement.scrollWidth;
		} else {
			width = el.offsetWidth;

			if (value === true) {
				let style = getComputedStyle(el);
				width += parseFloat(style.marginLeft) +
					parseFloat(style.marginRight);
			}
		}

		if (! func) {
			return width;
		}
	}

	$each(target, (el, i) => {
		value = func ?
			$exec(value, {
				args: [i, width],
				scope: el
			}) :
			value;

		if (typeof value == 'number') {
			value += 'px';
		}

		$css(el, 'width', value);
	});
}

/**
 * Wrap markup around each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {(function|string)} html
 */
export function $wrap(target, html) {
	let func = $isFunction(html);

	$each(target, (el, i) => {
		let wrap = $sel(
			func ?
				$exec(html, {
					args: i,
					scope: el
				}) :
				html
		);

		if (wrap) {
			let par = el.parentNode;

			$each(wrap, cel => {
				cel = cel.cloneNode(true);

				par.insertBefore(cel, el);
				cel.appendChild(el);

				$setRef(par);
			});
		}
	});
}

/**
 * Wrap markup around the content of each matching selection
 *
 * @param {($|HTMLElement|string)} target
 * @param {(function|string)} html
 */
export function $wrapInner(target, html) {
	let func = $isFunction(html);

	$each(target, (el, i) => {
		let markup = func ?
				$exec(html, {
					args: i,
					scope: el
				}) :
				html,
			wrap = markup ? $sel(markup)[0] : null;

		if (wrap) {
			let children = $children(el);

			if (! children.length) {
				children = $html(el);

				$empty(el);
				$html(wrap, children);
			} else {
				$each(children, cel => {
					wrap.appendChild(cel);
				});
			}

			$append(el, wrap);
		}
	});
}