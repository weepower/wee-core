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