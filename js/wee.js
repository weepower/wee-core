// Wee (weepower.com)
// Licensed under Apache 2 (http://www.apache.org/licenses/LICENSE-2.0)
// DO NOT MODIFY

/* global exports, global */
/* jshint maxdepth: 4, maxparams: 6 */

var Wee;

(function(W, U) {
	'use strict';

	var web = typeof window != 'undefined',
		scope = web ? window : global,
		W = (function() {
			var D = web ? document : {},
				store = {
					$: {}
				},
				observe = {},
				refs = {},
				env,
				range,

				/**
				 * Determine data storage root, key, and value
				 *
				 * @private
				 * @param {object} obj
				 * @param {string} key
				 * @param {boolean} [create=false]
				 * @returns {Array} value
				 */
				_storage = function(obj, key, create) {
					var data = obj,
						type = W.$type(key),
						num = type == 'number',
						val;

					if (num || type == 'string') {
						var segs = key.toString().split('.');
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

					return [data, key, _copy(val)];
				},

				/**
				 * Set global variable
				 *
				 * @private
				 */
				_set = function(obj, obs, key, val, options) {
					var stored = _storage(obj, key, true),
						seg = stored[1],
						data = seg == '$' ?
							_val(key, val) :
							_val(val, options);

					stored[0][seg] = data;

					_trigger(obj, obs, key, stored[2], data, 'set');

					return data;
				},

				/**
				 * Get global variable
				 *
				 * @private
				 */
				_get = function(obj, obs, key, fallback, set, options) {
					var stored = _storage(obj, key),
						resp = stored[0];

					if (stored[2] !== U) {
						return resp[key];
					}

					if (fallback !== U) {
						return set ?
							_set(obj, obs, key, fallback, options) :
							_val(fallback, options);
					}

					return null;
				},

				/**
				 * Check if storage criteria is set
				 *
				 * @private
				 */
				_has = function(obj, key, val) {
					var stored = _storage(obj, key),
						resp = stored[0];

					if (val !== U) {
						if (W.$isObject(resp)) {
							return resp.hasOwnProperty(val);
						}

						if (Array.isArray(resp)) {
							return resp.indexOf(val) > -1;
						}

						return resp === val;
					}

					return resp !== U;
				},

				/**
				 * Push or concatenate values into global array
				 *
				 * @private
				 */
				_add = function(type, obj, obs, key, val, prepend) {
					var stored = _storage(obj, key, true),
						root = stored[0],
						seg = stored[1],
						resp = stored[2];

					if (seg == '$') {
						prepend = val;
						val = key;
					}

					if (! Array.isArray(resp)) {
						root[seg] = [];
					}

					if (type == 1) {
						root[seg] = prepend ?
							W.$toArray(val).concat(root[seg]) :
							root[seg].concat(val);
					} else {
						prepend ?
							root[seg].unshift(val) :
							root[seg].push(val);
					}

					_trigger(obj, obs, key, resp, root[seg],
						type == 1 ? 'concat' : 'push');

					return root[seg];
				},

				/**
				 * Extend object into into global storage
				 *
				 * @private
				 */
				_merge = function(obj, obs, key, val) {
					val === U ?
						key = W.$extend(true, {}, obj.$, key) :
						val = W.$extend(true, {}, _get(obj, obs, key, {}), val);

					return _set(obj, obs, key, val);
				},

				/**
				 * Remove key or value from global array
				 *
				 * @private
				 */
				_drop = function(obj, obs, key, val) {
					var stored = _storage(obj, key),
						root = stored[0],
						seg = stored[1],
						resp = stored[2],
						arr = Array.isArray(root);

					if (val !== U) {
						if (resp !== U) {
							if (arr) {
								var i = resp.indexOf(val);

								if (i > -1) {
									root[seg].splice(i, 1);
								}
							} else if (resp === val) {
								delete root[seg];
							} else {
								delete root[seg][val];
							}
						}
					} else {
						arr ?
							root.splice(seg, 1) :
							delete root[seg];
					}

					_trigger(obj, obs, key, resp, root[seg], 'drop');

					return val !== U ? root[seg] : root;
				},

				/**
				 * Attach callback to data storage change
				 *
				 * @private
				 */
				_observe = function(obs, key, fn, options) {
					options = options || {};
					options.fn = fn;

					obs[key] = obs[key] || [];
					obs[key].push(options);
				},

				/**
				 * Fire callback from data storage change
				 *
				 * @private
				 */
				_trigger = function(obj, obs, key, orig, upd, type) {
					if (Object.keys(obs).length && (
						type == 'trigger' ||
						! _equals(upd, orig)
					)) {
						if (typeof key != 'string') {
							key = '';
						}

						var arr = [],
							opts = key.split('.').map(function(seg) {
								arr.push(seg);
								return arr.join('.');
							});

						for (var val in obs) {
							if (opts.indexOf(val) > -1 || val == '*') {
								var data = val == '*' ? obj.$ : upd;

								obs[val].forEach(function(el, i) {
									if (val === key || val == '*' || el.recursive) {
										if (! el.value || _equals(el.value, data)) {
											var args = [
												el.recursive ?
													_get(obj, false, val) :
													data,
												type
											];

											if (el.diff) {
												args.push(_diff(orig, data));
											}

											W.$exec(el.fn, {
												args: args
											});

											if (el.once) {
												obs[val].splice(i, 1);
											}
										}
									}
								});
							}
						}
					}
				},

				/**
				 * Clone value to a new instance
				 *
				 * @private
				 * @param {*} val
				 * @returns {*}
				 */
				_copy = function(val) {
					var type = W.$type(val);

					if (type == 'object') {
						val = _extend({}, val, true);
					} else if (type == 'array') {
						val = val.slice(0);
					}

					return val;
				},

				/**
				 * Check if a node contains another node
				 *
				 * @private
				 * @param {HTMLElement} source
				 * @param {HTMLElement} target
				 * @returns {boolean} match
				 */
				_contains = function(source, target) {
					return (source === D ? W._html : source)
						.contains(target);
				},

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
				_extend = function(target, object, deep, _set) {
					if (! object) {
						return target;
					}

					_set = _set || [];

					for (var key in object) {
						var src = object[key],
							type = W.$type(src);

						if (deep && type == 'object') {
							var len = _set.length,
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
						} else if (src !== U) {
							target[key] = type == 'array' ? src.slice(0) : src;
						}
					}

					return target;
				},

				/**
				 * Compare two values for equality
				 *
				 * @private
				 * @param {*} a
				 * @param {*} b
				 * @returns {boolean}
				 */
				_equals = function(a, b) {
					if (a === b) {
						return true;
					}

					var aType = W.$type(a);

					if (aType != W.$type(b)) {
						return false;
					}

					if (aType == 'array') {
						return _arrEquals(a, b);
					}

					if (aType == 'object') {
						return _objEquals(a, b);
					}

					if (aType == 'date') {
						return +a == +b; // jscs:ignore
					}

					return false;
				},

				/**
				 * Compare two arrays for equality
				 *
				 * @private
				 * @param {Array} a
				 * @param {Array} b
				 * @returns {boolean}
				 */
				_arrEquals = function(a, b) {
					return a.length == b.length &&
						a.every(function(el, i) {
							return _equals(el, b[i]);
						});
				},

				/**
				 * Compare two objects for equality
				 *
				 * @private
				 * @param {object} a
				 * @param {object} b
				 * @returns {boolean}
				 */
				_objEquals = function(a, b) {
					var aKeys = Object.keys(a);

					return _arrEquals(aKeys.sort(), Object.keys(b).sort()) &&
						aKeys.every(function(i) {
							return _equals(a[i], b[i]);
						});
				},

				/**
				 * Generate a delta from two objects
				 *
				 * @private
				 * @param {object} a - original object
				 * @param {object} b - updated object
				 * @returns {object}
				 */
				_diff = function(a, b) {
					var aObj = W.$isObject(a),
						bObj = W.$isObject(b);

					if (! (aObj || bObj)) {
						var type = 'u';

						if (_equals(a, b)) {
							type = '-';
						} else if (a === U) {
							type = 'c';
						} else if (b === U) {
							type = 'd';
						}

						return {
							after: b,
							before: a,
							type: type
						};
					}

					var diff = {};

					if (aObj) {
						Object.keys(a).forEach(function(key) {
							diff[key] = _diff(
								a[key],
								b && bObj ? b[key] : U
							);
						});
					}

					if (bObj) {
						Object.keys(b).forEach(function(key) {
							if (! diff[key]) {
								diff[key] = _diff(U, b[key]);
							}
						});
					}

					return diff;
				},

				/**
				 * Get value from function or directly
				 *
				 * @private
				 * @param {*} val
				 * @param {object} [options]
				 * @returns {*}
				 */
				_val = function(val, options) {
					return W._canExec(val) ?
						W.$exec(val, options) :
						val;
				};

			return {
				_$: scope.WeeAlias || '$',
				_body: D.body,
				_doc: D,
				_html: D.documentElement,
				_slice: [].slice,
				_win: scope,
				fn: {
					/**
					 * Create a namespaced controller
					 *
					 * @param {string} name
					 * @param {object} pub - public methods and properties
					 * @param {object} [priv] - private methods and properties
					 */
					make: function(name, pub, priv) {
						var base,
							basePubConst,
							basePrivConst;

						// Check for base controller
						if (name.indexOf(':') > 0) {
							var segs = name.split(':');
							base = _copy(W[segs[1]]);
							basePubConst = base._construct;
							basePrivConst = base.$private._construct;
							name = segs[0];
						}

						// Create new controller instance
						W.fn[name] = W._make(name, pub, priv, base);
						W[name] = new W.fn[name](name);

						// Execute base constructors
						if (basePubConst) {
							basePubConst();
						}

						if (basePrivConst) {
							basePrivConst();
						}

						// Execute controller constructors
						if (W[name].$private._construct) {
							W[name].$private._construct();
						}

						if (W[name]._construct) {
							W[name]._construct();
						}
					},

					/**
					 * Extend controller with additional methods and properties
					 *
					 * @param {(object|string)} a - controller name or core methods
					 * @param {object} [b] - public methods and properties
					 * @param {object} [c] - private methods and properties
					 */
					extend: function(a, b, c) {
						if (W.$isObject(a)) {
							// Merge into the global object
							_extend(W, a);
						} else if (W.hasOwnProperty(a)) {
							// Merge the objects else create the controller
							if (c) {
								b.$private = c;
							}

							_extend(W[a], b, true);
						} else {
							this.make(a, b, c);
						}
					}
				},

				/**
				 * Get matches to specified selector or return parsed HTML
				 *
				 * @param {($|HTMLElement|string)} selector
				 * @param {($|HTMLElement|string)} [context=document]
				 * @returns {Array} elements
				 */
				$: function(selector, context) {
					var el = null,
						ref = [];

					if (typeof selector != 'string') {
						el = selector;
					} else {
						if (selector == 'window') {
							return [scope];
						}

						if (selector == 'document') {
							return [D];
						}

						// Return nothing if context doesn't exist
						context = context !== U ? W.$(context)[0] : D;

						if (! context) {
							return ref;
						}

						// Check for pre-cached elements
						if (selector.indexOf('ref:') > -1) {
							var split = selector.split(',').filter(function(sel) {
								sel = sel.trim();

								if (sel.slice(0, 4) == 'ref:') {
									sel = sel.slice(4);
									sel = refs[sel];

									// Apply context filter if not document
									if (sel) {
										ref = ref.concat(
											context === D ?
												sel :
												sel.filter(function(el) {
													return _contains(context, el);
												})
										);
									}

									return false;
								}

								return true;
							});

							if (split.length) {
								selector = split.join(',');
							} else {
								return ref;
							}
						}

						// Use third-party selector engine if defined
						if (scope.WeeSelector !== U) {
							el = scope.WeeSelector(selector, context);
						} else if (/^[#.]?[\w-]+$/.test(selector)) {
							var pre = selector[0];

							if (pre == '#') {
								el = D.getElementById(selector.substr(1));
							} else if (pre == '.') {
								el = context.getElementsByClassName(selector.substr(1));
							} else {
								el = context.getElementsByTagName(selector);
							}
						} else {
							try {
								el = context.querySelectorAll(selector);
							} catch (e) {
								el = W.$parseHTML(selector).childNodes;
							}
						}
					}

					if (! el) {
						el = ref;
					} else if (el.nodeType !== U || el === scope) {
						el = [el];
					} else {
						el = W._slice.call(el);
					}

					// Join references if available
					return ref.length ? el.concat(ref) : el;
				},

				/**
				 * Create document fragment from an HTML string
				 *
				 * @param {string} html
				 * @returns {HTMLElement} element
				 */
				$parseHTML: function(html) {
					var el;
					html = html.trim();

					if (! range) {
						range = D.createRange();
						range.selectNode(W._body);
					}

					if (range && range.createContextualFragment) {
						el = range.createContextualFragment(html);
					} else {
						var div = D.createElement('div'),
							child;
						el = D.createDocumentFragment();

						div.innerHTML = html;

						while (child = div.firstChild) {
							el.appendChild(child);
						}
					}

					return el;
				},

				/**
				 * Set global variable
				 *
				 * @param {string} key
				 * @param {*} val
				 * @param {object} [options] - applicable if value is a callback
				 * @param {Array} [options.args]
				 * @param {object} [options.scope]
				 * @returns {*} value
				 */
				$set: function(key, val, options) {
					return _set(store, observe, key, val, options);
				},

				/**
				 * Get global variable
				 *
				 * @param {string} key
				 * @param {*} [fallback]
				 * @param {boolean} [set=false]
				 * @param {object} [options] - available for fallback functions
				 * @param {Array} [options.args]
				 * @param {object} [options.scope]
				 * @returns {*} value
				 */
				$get: function(key, fallback, set, options) {
					return _get(store, observe, key, fallback, set, options);
				},

				/**
				 * Push value into global array
				 *
				 * @param {string} key
				 * @param {*} val
				 * @param {boolean} [prepend=false]
				 * @returns {Array|object} value
				 */
				$push: function(key, val, prepend) {
					return _add(2, store, observe, key, val, prepend);
				},

				/**
				 * Concatenate values into global storage
				 *
				 * @param {string} key
				 * @param {*} val
				 * @param {boolean} [prepend=false]
				 * @returns {Array|object} value
				 */
				$concat: function(key, val, prepend) {
					return _add(1, store, observe, key, val, prepend);
				},

				/**
				 * Extend object into global storage
				 *
				 * @param {string} key
				 * @param {object} obj
				 * @returns {object} value
				 */
				$merge: function(key, obj) {
					return _merge(store, observe, key, obj);
				},

				/**
				 * Check if storage criteria is set
				 *
				 * @param {string} key
				 * @param {*} [val]
				 * @returns {boolean}
				 */
				$has: function(key, val) {
					return _has(store, key, val);
				},

				/**
				 * Remove key or value from global array
				 *
				 * @param {string} key
				 * @param {*} [val]
				 * @returns {Array|object} value
				 */
				$drop: function(key, val) {
					return _drop(store, observe, key, val);
				},

				/**
				 * Attach callback to data storage change
				 *
				 * @param {string} key
				 * @param {function} fn
				 * @param {object} [options]
				 * @param {boolean} [options.diff=false]
				 * @param {boolean} [options.once=false]
				 * @param {boolean} [options.recursive=false]
				 * @param {*} [options.value]
				 */
				$observe: function(key, fn, options) {
					_observe(observe, key, fn, options);
				},

				/**
				 * Remove callback from data storage change
				 *
				 * @param {string} [key]
				 */
				$unobserve: function(key) {
					key === U ?
						observe = [] :
						delete observe[key];
				},

				/**
				 * Execute matching observed callbacks
				 *
				 * @param {string} key
				 */
				$trigger: function(key) {
					var val = _get(store, false, key);

					_trigger(store, observe, key, val, val, 'trigger');
				},

				/**
				 * Execute function for each matching selection
				 *
				 * @param {($|Array|HTMLElement|string)} target
				 * @param {function} fn
				 * @param {object} [options]
				 * @param {Array} [options.args]
				 * @param {($|HTMLElement|string)} [options.context=document]
				 * @param {boolean} [options.reverse=false]
				 * @param {object} [options.scope]
				 */
				$each: function(target, fn, options) {
					if (target) {
						var conf = _extend({
								args: []
							}, options),
							els = W._selArray(target, conf),
							i = 0;

						if (conf.reverse && ! els._$) {
							els = els.reverse();
						}

						for (; i < els.length; i++) {
							var el = els[i],
								val = W.$exec(fn, {
									args: [el, i].concat(conf.args),
									scope: conf.scope || el
								});

							if (val === false) {
								return;
							}
						}
					}
				},

				/**
				 * Get current environment or set current environment against
				 * specified object
				 *
				 * @param {object} [rules]
				 * @param {string} [fallback=local]
				 * @returns {string} environment
				 */
				$env: function(rules, fallback) {
					var fb = fallback || 'local';

					if (rules) {
						var host = location.hostname;

						for (var rule in rules) {
							var val = rules[rule];

							if (val == host || _val(val, {
									args: host
								}) === true) {
								env = rule;
								break;
							}
						}

						if (! env) {
							env = fb;
						}
					}

					return env || fb;
				},

				/**
				 * Determine if the current environment is SSL encrypted
				 *
				 * @returns {boolean} secure
				 */
				$envSecure: function() {
					return location.protocol == 'https:';
				},

				/**
				 * Execute specified function or controller method
				 *
				 * @param {Array|function} fn
				 * @param {object} [options]
				 * @param {Array} [options.args]
				 * @param {object} [options.scope]
				 * @returns {*} [response]
				 */
				$exec: function(fn, options) {
					options = options || {};

					var fns = W.$toArray(fn),
						len = fns.length,
						i = 0;

					for (; i < len; i++) {
						var conf = _extend({
							args: []
						}, options || {});
						fn = fns[i];

						if (typeof fn == 'string') {
							var segs = fn.split(':');

							if (W[segs[0]]) {
								fn = W[segs[0]][
									segs.length > 1 ?
										segs[1] :
										'init'
									];

								if (! conf.scope) {
									conf.scope = W[segs[0]];
								}
							}
						}

						if (typeof fn == 'function') {
							var response = fn.apply(
								conf.scope,
								W.$toArray(conf.args)
							);

							if (len === 1) {
								return response;
							}
						}
					}
				},

				/**
				 * Extend target object with source object(s)
				 *
				 * @param {(boolean|object)} deep - extend nested properties else target object
				 * @param {object} [obj] - target object
				 * @param {...object} [obj] - merged objects
				 * @returns {object}
				 */
				$extend: function(deep) {
					var bool = typeof deep == 'boolean',
						args = W._slice.call(arguments).slice(bool ? 1 : 0),
						target = args[0] || {};
					deep = bool ? deep : false;

					args.slice(1).forEach(function(source) {
						target = _extend(target, source, deep);
					});

					return target;
				},

				/**
				 * Generate a delta from two objects
				 *
				 * @param {object} a
				 * @param {object} b
				 * @returns {object}
				 */
				$diff: function(a, b) {
					return _diff(a, b);
				},

				/**
				 * Compare two values for strict equality
				 *
				 * @param {*} a
				 * @param {*} b
				 * @returns {boolean}
				 */
				$equals: function(a, b) {
					return _equals(a, b);
				},

				/**
				 * Determine if value is an array
				 *
				 * @param {*} obj
				 * @returns {boolean}
				 */
				$isArray: function(obj) {
					return Array.isArray(obj);
				},

				/**
				 * Determine if value is a function
				 *
				 * @param {*} obj
				 * @returns {boolean}
				 */
				$isFunction: function(obj) {
					return W.$type(obj) == 'function';
				},

				/**
				 * Determine if value is an object
				 *
				 * @param {*} obj
				 * @returns {boolean}
				 */
				$isObject: function(obj) {
					return W.$type(obj) == 'object';
				},

				/**
				 * Determine if value is a string
				 *
				 * @param {*} obj
				 * @returns {boolean}
				 */
				$isString: function(obj) {
					return typeof obj == 'string';
				},

				/**
				 * Translate items in an array or selection to new array
				 *
				 * @param {($|Array|HTMLElement|string)} target - array or selector
				 * @param {function} fn
				 * @param {object} [options]
				 * @param {Array} [options.args]
				 * @param {object} [options.scope]
				 * @returns {Array}
				 */
				$map: function(target, fn, options) {
					if (! Array.isArray(target)) {
						target = W._selArray(target, options);
					}

					var conf = _extend({
							args: []
						}, options),
						res = [],
						i = 0;

					for (; i < target.length; i++) {
						var el = target[i],
							val = W.$exec(fn, {
								args: [el, i].concat(conf.args),
								scope: conf.scope || el
							});

						if (val !== false) {
							res.push(val);
						}
					}

					return res;
				},

				/**
				 * Serialize object
				 *
				 * @param {object} obj
				 * @returns {string} value
				 */
				$serialize: function(obj) {
					var arr = [];

					Object.keys(obj || {}).forEach(function(key) {
						var val = obj[key];
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
				},

				/**
				 * Convert serialized string back into an object
				 *
				 * @param {string} str
				 * @returns {object} value
				 */
				$unserialize: function(str) {
					var obj = {};

					decodeURIComponent(str)
						.replace(/^\?/, '')
						.split('&').forEach(function(el) {
							var split = el.split('='),
								key = split[0],
								val = split[1].replace('+', ' ') || '';

							if (obj[key]) {
								obj[key] = W.$toArray(obj[key]);
								obj[key].push(val);
							} else {
								obj[key] = val;
							}
						});

					return obj;
				},

				/**
				 * Add ref elements to datastore
				 *
				 * @param {(HTMLElement|string)} [context=document]
				 */
				$setRef: function(context) {
					context = context ? W.$(context)[0] : D;

					// Clear existing refs if reset
					Object.keys(refs).forEach(function(val) {
						refs[val] = refs[val].filter(function(el) {
							return ! (
								! _contains(D, el) ||
								(_contains(context, el) && context !== el)
							);
						});
					});

					// Set refs from DOM
					W.$each('[data-ref]', function(el) {
						el.getAttribute('data-ref').split(/\s+/)
							.forEach(function(val) {
								refs[val] = refs[val] || [];
								refs[val].push(el);
							});
					}, {
						context: context
					});
				},

				/**
				 * Add metadata variables to datastore
				 *
				 * @param {(HTMLElement|string)} [context=document]
				 */
				$setVar: function(context) {
					W.$each('[data-set]', function(el) {
						var key = el.getAttribute('data-set'),
							val = W._castString(el.getAttribute('data-value'));

						key.slice(-2) == '[]' ?
							_add(2, store, observe, key.slice(0, -2), val) :
							_set(store, observe, key, val);
					}, {
						context: context
					});
				},

				/**
				 * Cast value to array if it isn't one
				 *
				 * @param {*} val
				 * @returns {Array} value
				 */
				$toArray: function(val) {
					return val !== U ? (Array.isArray(val) ? val : [val]) : [];
				},

				/**
				 * Determine the JavaScript type of an object
				 *
				 * @param {*} obj
				 * @returns string
				 */
				$type: function(obj) {
					return obj === U ? 'undefined' :
						Object.prototype.toString.call(obj)
							.replace(/^\[object (.+)]$/, '$1')
							.toLowerCase();
				},

				/**
				 * Create new array with only unique values from source array
				 *
				 * @param {Array} array
				 * @returns {Array} unique values
				 */
				$unique: function(array) {
					return array.reverse().filter(function(el, i, arr) {
						return arr.indexOf(el, i + 1) < 0;
					}).reverse();
				},

				/**
				 * Fallback for non-existent chaining
				 */
				$chain: function() {},

				/**
				 * Determine if value can be executed as a function
				 *
				 * @protected
				 * @param {*} fn
				 * @returns {boolean} is executable
				 */
				_canExec: function(fn) {
					if (typeof fn == 'string' && fn.indexOf(':') > -1) {
						var split = fn.split(':'),
							controller = W[split[0]],
							method = split[1];

						if (controller && controller[method]) {
							fn = controller[method];
						}
					}

					return typeof fn == 'function';
				},

				/**
				 * Cast string to most applicable data type
				 *
				 * @protected
				 * @param {*} val
				 */
				_castString: function(val) {
					if (typeof val == 'string') {
						try {
							val = val == 'true' ? true :
								val == 'false' ? false :
								val == 'null' ? null :
								parseInt(val).toString() == val ? parseInt(val) :
									/^(?:\{[\w\W]*}|\[[\w\W]*])$/.test(val) ? JSON.parse(val) :
									val;
						} catch (e) {}
					}

					return val;
				},

				/**
				 * Extend object storage with object or key -> val
				 *
				 * @protected
				 * @param {object} obj
				 * @param {(object|string)} a
				 * @param {*} b
				 */
				_extend: function(obj, a, b) {
					var val = a;

					if (typeof a == 'string') {
						val = [];
						val[a] = b;
					}

					_extend(obj, val);
				},

				/**
				 * Convert selection to array
				 *
				 * @protected
				 * @param {($|HTMLElement|string)} selector
				 * @param {object} [options]
				 * @param {(HTMLElement|string)} [options.context=document]
				 * @returns {($|Array)} nodes
				 */
				_selArray: function(selector, options) {
					if (selector && selector._$) {
						return selector;
					}

					options = options || {};

					var el = typeof selector == 'string' ?
						W.$(selector, options.context) :
						selector;

					return W.$toArray(el);
				},

				/**
				 * Return a new controller method
				 *
				 * @protected
				 * @param {string} name
				 * @param {object} pub
				 * @param {object} [priv]
				 * @param {(boolean|object)} base
				 * @param {object} [model]
				 * @returns {Function}
				 */
				_make: function(name, pub, priv, base, model) {
					return function(id) {
						var Public = pub || {},
							Private = priv || {};

						// Ensure the current controller is not being extended
						if (name != '_tmp') {
							var store = {
									$: model || {}
								},
								observe = {},
								core = {
									/**
									 * Get value from controller storage
									 *
									 * @returns {*}
									 */
									$get: function(key, fallback, set, options) {
										return _get(store, observe, key, fallback, set, options);
									},

									/**
									 * Set value in controller storage
									 *
									 * @returns {*}
									 */
									$set: function(key, val, options) {
										return _set(store, observe, key, val, options);
									},

									/**
									 * Check if storage criteria is set
									 *
									 * @returns {boolean}
									 */
									$has: function(key, val) {
										return _has(store, key, val);
									},

									/**
									 * Push value into controller storage
									 *
									 * @returns {Array}
									 */
									$push: function(key, val, prepend) {
										return _add(2, store, observe, key, val, prepend);
									},

									/**
									 * Concatenate values into controller storage
									 *
									 * @returns {Array}
									 */
									$concat: function(key, val, prepend) {
										return _add(1, store, observe, key, val, prepend);
									},

									/**
									 * Extend object into controller storage
									 *
									 * @returns {Array}
									 */
									$merge: function(key, obj) {
										return _merge(store, observe, key, obj);
									},

									/**
									 * Remove value from controller storage
									 *
									 * @returns {Array}
									 */
									$drop: function(key, val) {
										return _drop(store, observe, key, val);
									},

									/**
									 * Attach callback to data storage change
									 */
									$observe: function(key, fn, options) {
										_observe(observe, key, fn, options);
									},

									/**
									 * Remove callback from data storage change
									 */
									$unobserve: function(key) {
										delete observe[key];
									},

									/**
									 * Execute matching observed callbacks
									 */
									$trigger: function(key) {
										var val = _get(store, false, key);

										_trigger(store, observe, key, val, val, 'trigger');
									},

									/**
									 * Destroy current controller
									 */
									$destroy: function() {
										if (this.$private._destruct) {
											this.$private._destruct();
										}

										if (this._destruct) {
											this._destruct();
										}

										// If namespaced delete root property
										if (id) {
											delete W[id];
										}
									}
								};

							// Extend public and private objects with core methods
							Public = _extend(Public, core);
							Private = _extend(Private, core);
						}

						// Clone controller objects for instance support
						Public = _copy(Public);
						Private = _copy(Private);

						// Interface $public and $private
						Public.$private = Private;
						Private.$public = Public;

						if (base) {
							var pubDest = Public.$destroy,
								basePubDest = base._destruct,
								basePrivDest = base.$private._destruct;

							// Extend controller methods into base
							Public = _extend(base, Public, true);
							Public.$private.$public = Public;

							Public.$destroy = function() {
								// Execute controller destructor
								pubDest.call(this);

								// Execute base destructors
								if (basePrivDest) {
									basePrivDest.call(this.$private);
								}

								if (basePubDest) {
									basePubDest.call(this);
								}
							};
						}

						return Public;
					};
				},

				/**
				 * Execute specified function when document is ready
				 *
				 * @param {(Array|function|string)} fn
				 */
				ready: function(fn) {
					D.readyState == 'complete' ?
						W.$exec(fn) :
						D.addEventListener('DOMContentLoaded', function() {
							W.$exec(fn);
						});
				}
			};
		})();

	// Set data variables and bind elements
	if (web) {
		W.$setRef();
		W.$setVar();
	}

	exports = Wee = W;

	if (typeof module == 'object' && module.exports) {
		module.exports = W;
	}
})(Wee, undefined);