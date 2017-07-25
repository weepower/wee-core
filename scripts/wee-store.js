import { $exec } from 'core/core';
import { _castString, $copy, $extend, $isObject, $isFunction, $toArray, $type } from 'core/types';
import { $each } from 'core/dom';
import { U } from 'core/variables';
import { warn } from 'core/warn';
import StoreError from 'store/error';

let instances = {};

/**
 * Create wrapper for browser storage api
 *
 * @param {string} type
 * @returns {*}
 * @private
 */
function _storageFactory(type) {
	let storage;

	if (type === 'local') {
		storage = window.localStorage;
	} else if (type === 'session') {
		storage = window.sessionStorage;
	} else {
		return null;
	}

	return {
		getItem(key) {
			return JSON.parse(storage.getItem(key));
		},
		setItem(key, value) {
			value = JSON.stringify(value);

			return storage.setItem(key, value);
		},
		removeItem(key) {
			return storage.removeItem(key);
		}
	};
}

export class Store {
	constructor(name, options = {}) {
		this.localStorage = _storageFactory('local');
		this.sessionStorage = _storageFactory('session');

		this._setBrowserStorage(options.browserStorage, false);

		this.name = name;
		this.keepInMemory = options.keepInMemory || true;
		this.prefix = options.prefix || 'wee';
		this.browserStoreKey = `${this.prefix}_${this.name}`;
		this.store = this.browserStore && this.browserStore.getItem(this.browserStoreKey) ?
			this.browserStore.getItem(this.browserStoreKey) :
			{ $: {} };
		this.observe = {
			$: {}
		};
	}

	/**
	 * Push or concatenate values into array
	 *
	 * @param {string} type - 'concat' or 'push'
	 * @param {Object} store
	 * @param {Object} obs
	 * @param {string} key
	 * @param {Array|*} val
	 * @param {boolean} prepend
	 * @param {boolean} [sync = true]
	 * @returns {*}
	 * @private
	 */
	_add(type, store, obs, key, val, prepend, sync = true) {
		if (prepend === U) {
			prepend = val;
			val = key;
		}

		const stored = this._storage(store, key, true);
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

		if (sync) {
			this._syncStore(store);
		}

		return root[seg];
	}

	/**
	 * Get variable
	 *
	 * @param {Object} store
	 * @param {Object} obs
	 * @param {string} key
	 * @param {*} fallback
	 * @param {boolean} [set=false]
	 * @param {Object} [options={}]
	 * @returns {*}
	 * @private
	 */
	_get(store, obs, key, fallback, set = false, options = {}) {
		const resp = this._storage(store, key)[2];

		if (resp !== U) {
			return resp;
		}

		if (fallback !== U) {
			return set ?
				this._set(store, obs, key, fallback, options) :
				this._val(fallback, options);
		}

		return null;
	}

	/**
	 * Ensure that in memory store is up to date
	 *
	 * @param {Object} store
	 * @private
	 */
	_syncStore(store) {
		if (this.browserStore) {
			this.browserStore.setItem(this.browserStoreKey, store);
		}

		if (this.keepInMemory) {
			this.store = store;
		}
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
	 * @param {Object} store
	 * @param {Object} obs
	 * @param {string} key
	 * @param {*} val
	 * @param {Object} [options={}]
	 * @param {boolean} [sync=true]
	 * @returns {*}
	 * @private
	 */
	_set(store, obs, key, val, options = {}, sync = true) {
		let stored = this._storage(store, key, true);
		let seg = stored[1];
		let data = seg === '$' ?
				this._val(key, val) :
				this._val(val, options);

		stored[0][seg] = data;

		if (sync) {
			this._syncStore(store);
		}

		return data;
	}

	/**
	 * Set a browser storage to be used for persistence of data
	 *
	 * @param {string} storageType
	 * @param {boolean} [sync=true]
	 */
	_setBrowserStorage(storageType, sync = true) {
		if (typeof storageType === 'string') {
			this.browserStore = storageType === 'local' ?
				this.localStorage :
				this.sessionStorage;

			// If store already contains data that needs to be saved to browser storage
			if (sync) {
				this.browserStore.setItem(this.browserStoreKey, this.store);
			}
		} else {
			this.browserStore = null;
		}
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
	 * Configure instance after initial creation
	 *
	 * @param {Object} options
	 */
	configure(options) {
		if (options.browserStorage) {
			this._setBrowserStorage(options.browserStorage);
		}

		if (options.keepInMemory) {
			this.keepInMemory = options.keepInMemory;
		}
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
		return this._get(this.getStore(), this.observe, key, fallback, set, options);
	}

	/**
	 * Return storage object from either memory or localStorage/sessionStorage
	 *
	 * @returns {Object}
	 * @private
	 */
	getStore() {
		if (! this.keepInMemory && this.browserStore) {
			return this.browserStore.getItem(this.browserStoreKey);
		}

		return this.store;
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
		return this._set(this.getStore(), this.observe, key, val, options);
	}

	/**
	 * Check if storage criteria is set
	 *
	 * @param {string} key
	 * @param {*} [val]
	 * @returns {boolean}
	 */
	has(key, val) {
		const resp = this._storage(this.getStore(), key)[2];

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
		return this._add('push', this.getStore(), this.observe, key, val, prepend);
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
		return this._add('concat', this.getStore(), this.observe, key, val, prepend);
	}

	/**
	 * Extend object into global storage
	 *
	 * @param {string} key
	 * @param {Object} val
	 * @returns {Object} value
	 */
	merge(key, val) {
		const store = this.getStore();
		val = $extend(true, {}, this._get(store, this.observe, key, {}), val);

		return this._set(store, this.observe, key, val);
	}

	/**
	 * Remove top-level store property
	 *
	 * @param {string} key
	 * @returns {*}
	 */
	drop(key) {
		const store = this.getStore();
		const stored = this._storage(store, key);
		let root = stored[0];
		let seg = stored[1];
		let orig = $copy(stored[2]);
		let arr = Array.isArray(root);

		arr ?
			root.splice(seg, 1) :
			delete root[seg];

		this._syncStore(store);

		return orig;
	}

	/**
	 * Set variables from DOM
	 *
	 * @param {string} store
	 * @param {($|HTMLElement|string)} context
	 */
	setVar(context) {
		const store = this.getStore();

		$each('[data-set]', (el) => {
			const key = el.getAttribute('data-set');
			const val = _castString(el.getAttribute('data-value'));
			const name = el.getAttribute('data-store');

			if ((! name && this.name === 'default') || name === this.name) {
				key.slice(-2) == '[]' ?
					this._add('push', store, this.observe, key.slice(0, -2), val, false, false) :
					this._set(store, this.observe, key, val, {}, false);
			}
		}, {
			context: context
		});

		// Prevented _syncStore in _add and _set inside $each for performance
		this._syncStore(store);
	}

	/**
	 * Remove reference to store instance
	 */
	destroy() {
		delete instances[this.name];

		if (this.browserStore) {
			this.browserStore.removeItem(this.browserStoreKey);
		}
	}
}

const store = new Store('default');

store.create = function createStore(name) {
	if (! name) {
		throw new StoreError('No name provided when creating new store instance');
	}

	if (instances[name]) {
		warn('store', `creation of a store instance named ${name} was attempted but already exists`);
		return instances[name];
	}

	const instance = new Store(name);

	instances[instance.name] = instance;

	return instance;
}

/**
 * Return all store instances
 *
 * @param {string} name
 * @returns {*}
 */
store.instances = function getInstances(name) {
	if (name) {
		return instances[name];
	}

	return instances;
}

/**
 * Destroy store instance
 *
 * @param {string} name
 */
export function destroyStore(name) {
	if (instances[name]) {
		instances[name].destroy();
	}
}

export default store;