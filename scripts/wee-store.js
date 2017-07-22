import { $exec } from 'core/core';
import { $copy, $isObject, $isFunction, $toArray, $type } from 'core/types';
import { U } from 'core/variables';

export class Store {
	constructor() {
		this.store = {
			$: {}
		};
		this.observe = {
			$: {}
		};
	}

	/**
	 * Push or concatenate values into array
	 *
	 * @param {string} type
	 * @param {Object} obj
	 * @param {Object} obs
	 * @param {string} key
	 * @param {Array|*} val
	 * @param {boolean} prepend
	 * @returns {*}
	 * @private
	 */
	_add(type, obj, obs, key, val, prepend) {
		if (prepend === U) {
			prepend = val;
			val = key;
		}

		const stored = this._storage(obj, key, true);
		const seg = stored[1];
		const orig = $copy(stored[2]);
		let root = stored[0];

		// If store property is not already an array, set to empty array
		if (! Array.isArray(orig)) {
			root[seg] = [];
		}

		if (type === 'concat') {
			root[seg] = prepend ?
				$toArray(val).concat(root[seg]) :
				root[seg].concat(val);
		} else {
			prepend ?
				root[seg].unshift(val) :
				root[seg].push(val);
		}

		// TODO: Observables
		// _trigger(obj, obs, key, orig, root[seg],
		// 	type == 1 ? 'concat' : 'push');

		return root[seg];
	}

	/**
	 * Get variable
	 *
	 * @param {Object} obj
	 * @param {Object} obs
	 * @param {string} key
	 * @param {*} fallback
	 * @param {boolean} set
	 * @param {Object} options
	 * @returns {*}
	 * @private
	 */
	_get(obj, obs, key, fallback, set, options) {
		const resp = this._storage(obj, key)[2];

		if (resp !== U) {
			return resp;
		}

		if (fallback !== U) {
			return set ?
				this._set(obj, obs, key, fallback, options) :
				this._val(fallback, options);
		}

		return null;
	}

	/**
	 * Determine data storage root, key, and value
	 *
	 * @param {Object} obj
	 * @param {string} key
	 * @param {boolean} [create=false]
	 * @returns {Array} value
	 */
	_storage(obj, key, create = false) {
		let data = obj;
		let	type = $type(key);
		let num = type == 'number';
		let val;

		if (num || type == 'string') {
			let segs = key.toString().split('.');
			key = segs.pop();
			data = data.$;

			segs.forEach(function(key) {
				data = data.hasOwnProperty(key) ?
					data[key] :
					(create ? data[key] = {} : []);
			});
		} else {
			key = '$';
		}

		if (num && Array.isArray(data)) {
			var arr = data.slice(key);

			if (arr.length) {
				val = arr[0];
			}
		} else {
			key = key.toString();

			if (data.hasOwnProperty(key)) {
				val = data[key];
			}
		}

		return [data, key, val];
	}

	/**
	 * Set variable
	 *
	 * @param {Object} obj
	 * @param {Object} obs
	 * @param {string} key
	 * @param {*} val
	 * @param {Object} options
	 * @returns {*}
	 * @private
	 */
	_set(obj, obs, key, val, options) {
		let stored = this._storage(obj, key, true);
		let seg = stored[1];
		let data = seg === '$' ?
				this._val(key, val) :
				this._val(val, options);

		stored[0][seg] = data;

		// TODO: Observables
		// _trigger(obj, obs, key, _copy(stored[2]), data, 'set');

		return data;
	}

	/**
	 * Get value from function or directly
	 *
	 * @private
	 * @param {*} val
	 * @param {Object} [options]
	 * @returns {*}
	 */
	_val(val, options) {
		return $isFunction(val) ?
			$exec(val, options) :
			val;
	}

	/**
	 * Get variable
	 *
	 * @param {string} key
	 * @param {*} [fallback]
	 * @param {boolean} [set=false]
	 * @param {Object} [options] - available for fallback functions
	 * @param {Array} [options.args]
	 * @param {Object} [options.scope]
	 * @returns {*} value
	 */
	get(key, fallback, set = false, options) {
		return this._get(this.store, this.observe, key, fallback, set, options);
	}

	/**
	 * Set variable
	 *
	 * @param {string} key
	 * @param {*} val
	 * @param {Object} [options] - applicable if value is a callback
	 * @param {Array} [options.args]
	 * @param {Object} [options.scope]
	 * @returns {*} value
	 */
	set(key, val, options) {
		return this._set(this.store, this.observe, key, val, options);
	}

	/**
	 * Check if storage criteria is set
	 *
	 * @param {string} key
	 * @param {*} [val]
	 * @returns {boolean}
	 */
	has(key, val) {
		const resp = this._storage(this.store, key)[2];

		if (resp === U) {
			return false;
		}

		if (val !== U) {
			if ($isObject(resp)) {
				return resp.hasOwnProperty(val);
			}

			if (Array.isArray(resp)) {
				return resp.indexOf(val) > -1;
			}

			return resp === val;
		}

		return true;
	}

	/**
	 * Push value into global array
	 *
	 * @param {string} key
	 * @param {*} val
	 * @param {boolean} [prepend=false]
	 * @returns {Array|Object} value
	 */
	push(key, val, prepend = false) {
		return this._add('push', this.store, this.observe, key, val, prepend);
	}

	/**
	 * Concatenate values into global storage
	 *
	 * @param {string} key
	 * @param {*} val
	 * @param {boolean} [prepend=false]
	 * @returns {Array|Object} value
	 */
	concat(key, val, prepend = false) {
		return this._add('concat', this.store, this.observe, key, val, prepend);
	}
}

export default new Store();