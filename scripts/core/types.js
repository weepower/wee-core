export const _slice = [].slice;

/**
 * Compare two arrays for equality
 *
 * @private
 * @param {Array} a
 * @param {Array} b
 * @returns {boolean}
 */
function _arrEquals(a, b) {
    return a.length == b.length &&
        a.every((el, i) => _equals(el, b[i]));
}

/**
 * Cast string to most applicable data type
 *
 * @protected
 * @param {*} val
 */
export function _castString(val) {
    if (typeof val === 'string') {
        try {
            val = val === 'true' ? true :
                val === 'false' ? false :
                    val === 'null' ? null :
                        parseInt(val).toString() === val ? parseInt(val) :
                            /^(?:\{[\w\W]*}|\[[\w\W]*])$/.test(val) ? JSON.parse(val) :
                                val;
        } catch (e) {}
    }

    return val;
}

/**
 * Clone value to a new instance
 *
 * @private
 * @param {*} val
 * @returns {*}
 */
function _copy(val) {
    const type = $type(val);

    if (type == 'object') {
        val = _extend({}, val, true);
    } else if (type == 'array') {
        val = val.slice(0);
    }

    return val;
}

/**
 * Compare two values for equality
 *
 * @private
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
function _equals(a, b) {
    if (a === b) {
        return true;
    }

    const aType = $type(a);

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
}

/**
 * Extend target object with source object(s)
 *
 * @private
 * @param {Object} target
 * @param {Object} object
 * @param {boolean} [deep=false]
 * @param {Array} [_set=[]]
 * @returns {Object}
 */
export function _extend(target, object, deep, _set = []) {
    if (! object) {
        return target;
    }

    for (const key in object) {
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
}

/**
 * Compare two objects for equality
 *
 * @private
 * @param {Object} a
 * @param {Object} b
 * @returns {boolean}
 */
function _objEquals(a, b) {
    const aKeys = Object.keys(a);

    return _arrEquals(aKeys.sort(), Object.keys(b).sort()) &&
        aKeys.every(i => _equals(a[i], b[i]));
}

/**
 * Clone value to a new instance
 *
 * @private
 * @param {*} val
 * @returns {*}
 */
export function $copy(val) {
    return _copy(val);
}

/**
 * Compare two values for strict equality
 *
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
export function $equals(a, b) {
    return _equals(a, b);
}

/**
 * Extend target object with source object(s)
 *
 * @param {(boolean|Object)} deep - extend nested properties else target object
 * @param {Object} [obj] - target object
 * @param {...Object} [obj] - merged objects
 * @returns {Object}
 */
export function $extend(deep) {
    let bool = typeof deep === 'boolean',
        args = _slice.call(arguments).slice(bool ? 1 : 0),
        target = args[0] || {};
    deep = bool ? deep : false;

    args.slice(1).forEach((source) => {
        target = _extend(target, source, deep);
    });

    return target;
}

/**
 * Determine if value is an array
 *
 * @param {*} obj
 * @returns {boolean}
 */
export function $isArray(obj) {
    return Array.isArray(obj);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
export function $isArrayBuffer(val) {
    return $type(val) === 'arraybuffer';
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
export function $isArrayBufferView(val) {
    let result;

    // IE10 support and up
    if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
        result = ArrayBuffer.isView(val);
    }

    return result;
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
export function $isBlob(val) {
    return $type(val) === 'blob';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
export function $isDate(val) {
    return $type(val) === 'date';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
export function $isFile(val) {
    return $type(val) === 'file';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
export function $isFormData(val) {
    return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if value is a function
 *
 * @param {*} obj
 * @returns {boolean}
 */
export function $isFunction(obj) {
    return $type(obj) === 'function';
}

/**
 * Determine if value is a number (optional loose match)
 *
 * @param {*} obj
 * @param {boolean} [strict]
 * @returns {boolean}
 */
export function $isNumber(obj, strict = true) {
    if (! strict) {
        if (! obj.match(/^\d*\.?\d*$/g)) {
            return false;
        }

        const value = parseFloat(obj);

        // If value = NaN, will not be equal
        return value === value;
    }

    return $type(obj) === 'number';
}

/**
 * Determine if value is an object
 *
 * @param {*} obj
 * @returns {boolean}
 */
export function $isObject(obj) {
    return $type(obj) === 'object';
}

/**
 * Determine if value is a string
 *
 * @param {*} obj
 * @returns {boolean}
 */
export function $isString(obj) {
    return typeof obj === 'string';
}

/**
 * Serialize object
 *
 * @param {Object} obj
 * @returns {string} value
 */
export function $serialize(obj) {
    const arr = [];

    Object.keys(obj || {}).forEach((key) => {
        const val = obj[key];
        key = encodeURIComponent(key);

        if (typeof val !== 'object') {
            arr.push(`${key}=${encodeURIComponent(val)}`);
        } else if (Array.isArray(val)) {
            val.forEach((el) => {
                arr.push(`${key}[]=${encodeURIComponent(el)}`);
            });
        }
    });

    return arr.length ? arr.join('&').replace(/%20/g, '+') : '';
}

/**
 * Cast value to array if it isn't one
 *
 * @param {*} val
 * @returns {Array} value
 */
export function $toArray(val) {
    return val !== undefined ? (Array.isArray(val) ? val : [val]) : [];
}

/**
 * Determine the JavaScript type of an object
 *
 * @param {*} obj
 * @returns string
 */
export function $type(obj) {
    return obj === undefined ? 'undefined' :
        Object.prototype.toString.call(obj)
            .replace(/^\[object (.+)]$/, '$1')
            .toLowerCase();
}

/**
 * Convert serialized string back into an object
 *
 * @param {string} str
 * @returns {Object} value
 */
export function $unserialize(str) {
    const obj = {};

    decodeURIComponent(str)
        .replace(/^\?/, '')
        .split('&').forEach((el) => {
            let split = el.split('='),
                key = split[0].replace('[]', ''),
                val = (split[1] || '').replace(/\+/g, ' ') || '',
                isArrayProp = /\[\]/.test(split[0]);

            if (obj.hasOwnProperty(key)) {
                obj[key] = $toArray(obj[key]);
                obj[key].push(_castString(val));
            } else {
                obj[key] = isArrayProp ? [_castString(val)] : _castString(val);
            }
        });

    return obj;
}
