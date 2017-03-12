/**
 * Compare two arrays for equality
 *
 * @private
 * @param {Array} a
 * @param {Array} b
 * @returns {boolean}
 */
const _arrEquals = (a, b) => {
	return a.length == b.length &&
		a.every(function(el, i) {
			return _equals(el, b[i]);
		});
};

/**
 * Clone value to a new instance
 *
 * @private
 * @param {*} val
 * @returns {*}
 */
const _copy = val => {
	let type = $type(val);

	if (type == 'object') {
		val = _extend({}, val, true);
	} else if (type == 'array') {
		val = val.slice(0);
	}

	return val;
};

/**
 * Compare two values for equality
 *
 * @private
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
const _equals = (a, b) => {
	if (a === b) {
		return true;
	}

	let aType = $type(a);

	if (aType != $type(b)) {
		return false;
	}

	if (aType == 'array') {
		return _arrEquals(a, b);
	}

	if (aType == 'object') {
		return _objEquals(a, b);
	}

	if (aType == 'date') {
		return +a == +b;
	}

	return false;
};

/**
 * Extend target object with source object(s)
 *
 * @private
 * @param {object} target
 * @param {object} object
 * @param {boolean} [deep=false]
 * @param {Array} [_set=[]]
 * @returns object
 */
export const _extend = (target, object, deep, _set = []) => {
	if (! object) {
		return target;
	}

	for (let key in object) {
		let src = object[key],
			type = $type(src);

		if (deep && type == 'object') {
			let len = _set.length,
				i = 0,
				val;

			for (; i < len; i++) {
				if (_set[i] === src) {
					val = src;
					break;
				}
			}

			if (val) {
				target[key] = val;
			} else {
				_set.push(src);
				target[key] = _extend(target[key] || {}, src, deep, _set);
			}
		} else if (src !== undefined) {
			target[key] = type == 'array' ? src.slice(0) : src;
		}
	}

	return target;
};

/**
 * Compare two objects for equality
 *
 * @private
 * @param {object} a
 * @param {object} b
 * @returns {boolean}
 */
const _objEquals = (a, b) => {
	let aKeys = Object.keys(a);

	return _arrEquals(aKeys.sort(), Object.keys(b).sort()) &&
		aKeys.every(function(i) {
			return _equals(a[i], b[i]);
		});
};

/**
 * Clone value to a new instance
 *
 * @private
 * @param {*} val
 * @returns {*}
 */
export const $copy = val => {
	return _copy(val);
};

/**
 * Compare two values for strict equality
 *
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
export const $equals = (a, b) => {
	return _equals(a, b);
};

/**
 * Determine if value is an array
 *
 * @param {*} obj
 * @returns {boolean}
 */
export const $isArray = obj => {
	return Array.isArray(obj);
};

/**
 * Determine if value is a function
 *
 * @param {*} obj
 * @returns {boolean}
 */
export const $isFunction = obj => {
	return $type(obj) == 'function';
};

/**
 * Determine if value is a number (optional loose match)
 *
 * @param {*} obj
 * @param {boolean} [strict]
 * @returns {boolean}
 */
export const $isNumber = (obj, strict = true) => {
	if (! strict) {
		let value = parseInt(obj);

		// If value = NaN, will not be equal
		return value === value;
	}

	return $type(obj) == 'number';
};

/**
 * Determine if value is an object
 *
 * @param {*} obj
 * @returns {boolean}
 */
export const $isObject = obj => {
	return $type(obj) == 'object';
};

/**
 * Determine if value is a string
 *
 * @param {*} obj
 * @returns {boolean}
 */
export const $isString = obj => {
	return typeof obj == 'string';
};

/**
 * Serialize object
 *
 * @param {object} obj
 * @returns {string} value
 */
export const $serialize = obj => {
	let arr = [];

	Object.keys(obj || {}).forEach(function(key) {
		let val = obj[key];
		key = encodeURIComponent(key);

		if (typeof val != 'object') {
			arr.push(key + '=' + encodeURIComponent(val));
		} else if (Array.isArray(val)) {
			val.forEach(function(el) {
				arr.push(key + '[]=' + encodeURIComponent(el));
			});
		}
	});

	return arr.length ? arr.join('&').replace(/%20/g, '+') : '';
};

/**
 * Cast value to array if it isn't one
 *
 * @param {*} val
 * @returns {Array} value
 */
export const $toArray = val => {
	return val !== undefined ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Determine the JavaScript type of an object
 *
 * @param {*} obj
 * @returns string
 */
export const $type = obj => {
	return obj === undefined ? 'undefined' :
		Object.prototype.toString.call(obj)
			.replace(/^\[object (.+)]$/, '$1')
			.toLowerCase();
};