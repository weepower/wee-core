// Wee (weepower.com)
// Licensed under Apache 2 (http://www.apache.org/licenses/LICENSE-2.0)
// DO NOT MODIFY

/* jshint maxdepth: 4, maxparams: 6 */

(function(N, U) {
	'use strict';

	var web = typeof window != 'undefined',
		W = (function() {
			var D = web ? document : {},
				store = {},
				observe = {},
				refs = {},
				env,

				/**
				 * Determine data storage root and key
				 *
				 * @private
				 * @param {object} obj
				 * @param {string} key
				 * @param {boolean} [create=false]
				 * @returns {Array} value
				 */
				_storage = function(obj, key, create) {
					var data = obj;

					if (key) {
						var segs = key.split('.');
						key = segs.pop();

						segs.forEach(function(key) {
							data = data.hasOwnProperty(key) ?
								data[key] :
								(create ? data[key] = {} : []);
						});
					}

					return [data, key];
				},

				/**
				 * Set global variable
				 *
				 * @private
				 */
				_set = function(obj, obs, key, val, options) {
					var stored = _storage(obj, key, true),
						data = W._canExec(val) ?
							W.$exec(val, options) :
							val;

					if (stored[0][stored[1]] !== data) {
						stored[0][stored[1]] = data;

						_trigger(obj, obs, key, 'set');
					}

					return data;
				},

				/**
				 * Get global variable
				 *
				 * @private
				 */
				_get = function(obj, obs, key, fallback, set, options) {
					var stored = _storage(obj, key),
						data = stored[0];

					if (key) {
						if (data.hasOwnProperty(stored[1])) {
							return data[stored[1]];
						}

						if (fallback !== U) {
							return set ?
								_set(obj, obs, key, fallback, options) :
								fallback;
						}

						return null;
					}

					return data;
				},

				/**
				 * Check if storage criteria is set
				 *
				 * @private
				 */
				_has = function(obj, key, val) {
					var data = _storage(obj, key),
						resp = data[0][data[1]];

					if (val !== U) {
						if (W.$isObject(resp)) {
							return resp.hasOwnProperty(val);
						} else if (typeof resp == 'string') {
							return resp === val;
						}

						return resp.indexOf(val) > -1;
					}

					return obj !== U;
				},

				/**
				 * Push or concatenate values into global array
				 *
				 * @private
				 */
				_add = function(type, obj, obs, key, val, prepend) {
					var stored = _storage(obj, key, true),
						root = stored[0],
						seg = stored[1];

					root[seg] = root[seg] || [];

					if (type == 1) {
						root[seg] = prepend ?
							val.concat(root[seg]) :
							root[seg].concat(val);
					} else {
						prepend ?
							root[seg].unshift(val) :
							root[seg].push(val);
					}

					if (obs) {
						_trigger(obj, obs, key, 'add');
					}

					return root[seg];
				},

				/**
				 * Remove key or value from global array
				 *
				 * @private
				 */
				_drop = function(obj, obs, key, val) {
					var data = _storage(obj, key),
						root = data[0],
						seg = data[1],
						resp = root[seg];

					if (val !== U) {
						if (resp !== U) {
							if (W.$isObject(resp)) {
								delete root[key];
							} else if (typeof resp == 'string' && resp === val) {
								delete root[seg];
							} else {
								var i = resp.indexOf(val) > -1;

								if (i > -1) {
									resp.splice(i, 1);
								}
							}
						}
					} else {
						delete root[seg];
					}

					if (obs) {
						_trigger(obj, obs, key, 'drop');
					}

					return root[seg];
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
				_trigger = function(obj, obs, key, type) {
					if (Object.keys(obs).length) {
						var arr = [],
							opts = key.split('.').map(function(seg) {
								arr.push(seg);
								return arr.join('.');
							});

						for (var val in obs) {
							if (opts.indexOf(val) > -1 || val == '*') {
								var data;

								if (val == '*') {
									data = obj;
								} else {
									data = _storage(obj, val);
									data = data[0][data[1]];
								}

								if (data) {
									obs[val].forEach(function(el, i) {
										if (val === key || val == '*' || el.recursive) {
											if (! el.value || el.value === data) {
												W.$exec(el.fn, {
													args: [
														data,
														type
													]
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
					}
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
					return (source === D ? W._html : source).contains(target);
				},

				/**
				 * Extend target object with source object(s)
				 *
				 * @private
				 * @param {object} target
				 * @param {object} source
				 * @param {boolean} deep
				 * @returns object
				 */
				_extend = function(target, object, deep) {
					if (object) {
						for (var key in object) {
							var src = object[key];

							if (deep === true && (W.$isObject(src) ||
								Array.isArray(src))
							) {
								target[key] = _extend(target[key], src, deep);
							} else if (src !== U) {
								target[key] = src;
							}
						}
					}

					return target;
				};

			return {
				_$: N.WeeAlias || '$',
				_body: D.body,
				_doc: D,
				_html: D.documentElement,
				_legacy: D.getElementsByClassName ? false : true,
				_slice: [].slice,
				_win: N,
				fn: {
					/**
					 * Create a namespaced controller
					 *
					 * @param {string} name
					 * @param {object} pub - public methods and properties
					 * @param {object} [priv] - private methods and properties
					 */
					make: function(name, pub, priv) {
						W.fn[name] = W._make(name, pub, priv);
						W[name] = new W.fn[name]();

						// Execute constructors
						if (W[name].$private._construct !== U) {
							W[name].$private._construct();
						}

						if (W[name]._construct !== U) {
							W[name]._construct();
						}
					},

					/**
					 * Extend controller with additional methods and properties
					 *
					 * @param {(object|string)} a - method name or core methods
					 * @param {object} [b] - public methods and properties
					 * @param {object} [c] - private methods and properties
					 */
					extend: function(a, b, c) {
						if (W.$isObject(a)) {
							// Merge into the global object
							_extend(W, a);
						} else if (W.hasOwnProperty(a)) {
							// Merge the objects else create the controller
							this.make('_tmp', b, c);
							_extend(W[a], W._tmp);
							delete W._tmp;
						} else {
							this.make(a, b, c);
						}
					}
				},

				/**
				 * Get matches to specified selector
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
							return [N];
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
						if (N.WeeSelector !== U) {
							el = N.WeeSelector(selector, context);
						} else if (/^[#.]?[\w-]+$/.test(selector)) {
							var pre = selector[0];

							if (pre == '#') {
								el = context.getElementById(selector.substr(1));
							} else if (pre == '.') {
								el = W._legacy ?
									context.querySelectorAll(selector) :
									context.getElementsByClassName(selector.substr(1));
							} else {
								el = context.getElementsByTagName(selector);
							}
						} else {
							try {
								el = context.querySelectorAll(selector);
							} catch (e) {
								return W.$parseHTML(selector);
							}
						}
					}

					if (! el) {
						el = ref;
					} else if (el.nodeType !== U || el === N) {
						el = [el];
					} else {
						el = W._slice.call(el, 0);
					}

					// Join references if available
					return ref.length ? el.concat(ref) : el;
				},

				/**
				 * Create a DOM object from an HTML string
				 *
				 * @param {string} html
				 * @returns {HTMLElement} element
				 */
				$parseHTML: function(html) {
					var el = W._doc.createElement('div');

					el.innerHTML = html;

					return W._slice.call(
						el.children.length ?
							el.children :
							el.childNodes
					);
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
				 * @param {*} value
				 * @param {boolean} [prepend=false]
				 * @returns {Array|object} value
				 */
				$push: function(key, val, prepend) {
					return _add(2, store, observe, key, val, prepend);
				},

				/**
				 * Concatenate values into global array
				 *
				 * @param {string} key
				 * @param {*} value
				 * @param {boolean} [prepend=false]
				 * @returns {Array|object} value
				 */
				$concat: function(key, val, prepend) {
					return _add(1, store, observe, key, val, prepend);
				},

				/**
				 * Check if storage criteria is set
				 *
				 * @param {string} key
				 * @param {*} [value]
				 * @returns {boolean}
				 */
				$has: function(key, val) {
					return _has(store, key, val);
				},

				/**
				 * Remove key or value from global array
				 *
				 * @param {string} key
				 * @param {*} [value]
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
				 */
				$observe: function(key, fn, options) {
					_observe(observe, key, fn, options);
				},

				/**
				 * Remove callback from data storage change
				 *
				 * @param {string} key
				 */
				$unobserve: function(key) {
					delete observe[key];
				},

				/**
				 * Execute any matching observed callbacks
				 *
				 * @param {string} key
				 */
				$trigger: function(key) {
					_trigger(store, observe, key);
				},

				/**
				 * Execute function for each matching selection
				 *
				 * @param {($|Array|HTMLElement|string)} target
				 * @param {function} fn
				 * @param {object} [options]
				 * @param {Array} [options.args]
				 * @param {boolean} [options.reverse=false]
				 * @param {($|HTMLElement|string)} [options.context=document]
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
					if (rules) {
						var host = location.hostname;

						for (var rule in rules) {
							var val = rules[rule];

							if (val == host ||
								(W._canExec(val) && W.$exec(val, {
									args: host
								}) === true)) {
								env = rule;
								break;
							}
						}
					}

					return env || fallback || 'local';
				},

				/**
				 * Determine if the environment is secured over https
				 *
				 * @returns {boolean} secure
				 */
				$envSecure: function() {
					return location.protocol == 'https:';
				},

				/**
				 * Execute specified function or controller method
				 *
				 * @param {function} fn
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

						if (W.$isFunction(fn)) {
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
				 * @param {(boolean|object)} - extend nested properties else target object
				 * @param {object} - target object
				 * @param {...object} - merged objects
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
				 * Translate items in an array|selection to new array
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
				 * Bind specified context to method execution
				 *
				 * @param {function} fn
				 * @param {object} context
				 */
				$proxy: function(fn, context) {
					fn.apply(context, W._slice.call(arguments).slice(2));
				},

				/**
				 * Serialize object
				 *
				 * @param {object} val
				 * @returns {string} value
				 */
				$serialize: function(val) {
					return Object.keys(val).map(function(key) {
						if (typeof val[key] != 'object') {
							return encodeURIComponent(key) + '=' +
								encodeURIComponent(val[key])
									.replace(/%20/g, '+');
						}
					}).join('&');
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
				$setVars: function(context) {
					W.$each('[data-set]', function(el) {
						var key = el.getAttribute('data-set'),
							val = W._castString(el.getAttribute('data-value'));

						key.slice(-2) == '[]' ?
							_add(2, store, observe, key, val) :
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
					return Array.isArray(val) ? val : [val];
				},

				/**
				 * Determine the JavaScript type of an object
				 *
				 * @param {*} obj
				 * @returns string
				 */
				$type: function(obj) {
					return Object.prototype.toString.call(obj)
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
					return array.reverse().filter(function(el, i, array) {
						return array.indexOf(el, i + 1) < 0;
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
				 * @param {*} value
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

					return W.$isFunction(fn);
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
				 * Convert selection to array
				 *
				 * @protected
				 * @param {($|HTMLElement|string)} selector
				 * @param {object} [options]
				 * @param {(HTMLElement|string)} [options.context=document]
				 * @returns {($|Array)} nodes
				 */
				_selArray: function(selector, options) {
					if (selector._$) {
						return selector;
					}

					options = options || {};
					var el = typeof selector == 'string' ?
						W.$(selector, options.context) :
						selector;

					return el ? W.$toArray(el) : [];
				},

				/**
				 * Return a new controller method
				 *
				 * @protected
				 * @returns {Function}
				 */
				_make: function(name, pub, priv, model) {
					return function() {
						var Public = pub || {},
							Private = priv || {};

						// Ensure the current controller is not being extended
						if (name != '_tmp') {
							var store = model || {},
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
									 * Attach callback to data storage change
									 */
									$trigger: function(key) {
										_trigger(store, observe, key);
									},

									/**
									 * Destroy current controller
									 */
									$destroy: function() {
										if (Private._destruct) {
											Private._destruct();
										}

										if (Public._destruct) {
											Public._destruct();
										}

										delete W[name];

										W.$drop(name);
									}
								};

							// Extend public and private objects with data
							Public = _extend(Public, core);
							Private = _extend(Private, core);
						}

						if (priv !== false) {
							// Clone public and private objects
							Public = _extend({}, Public);
							Private = _extend({}, Private);

							// Interface $public and $private
							Public.$private = Private;
							Private.$public = Public;

							for (var fn in Private) {
								Public.$private[fn] = Private[fn];
							}
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
					var state = D.readyState;

					state == 'complete' ?
						W.$exec(fn) :
						W._legacy ?
							D.attachEvent('onreadystatechange', function() {
								if (state == 'complete') {
									W.$exec(fn);
								}
							}) :
							D.addEventListener('DOMContentLoaded', function() {
								W.$exec(fn);
							});
				}
			};
		})();

	N.Wee = W;

	// Set data variables and bind elements
	if (web) {
		W.$setVars();
		W.$setRef();
	}

	// AMD setup
	if (typeof define == 'function' && define.amd) {
		define('wee', [], function() {
			return W;
		});
	}
})(this, undefined);