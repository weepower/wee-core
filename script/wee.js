// Wee (weepower.com)
// Licensed under Apache 2 (http://www.apache.org/licenses/LICENSE-2.0)
// DO NOT MODIFY

(function(N, U) {
	'use strict';

	var web = typeof window != 'undefined',
		W = (function() {
			var store = {},
				observe = {},
				D = web ? document : {},

				/**
				 * Determine data storage root and key
				 *
				 * @param {string} key
				 * @param {object} [scope=Wee]
				 * @returns {Array} value
				 */
				storeData = function(key, scope) {
					if (key.indexOf(':') < 0) {
						return [scope !== W ? scope : store, key];
					}

					var segs = key.split(':');
					key = segs[0];

					if (! store.hasOwnProperty(key)) {
						store[key] = [];
					}

					return [store[key], segs[1]];
				},

				/**
				 * Execute any matching observed callbacks
				 *
				 * @param {string} key
				 */
				fire = function(key) {
					var val = observe[key];

					if (val) {
						W.$exec(val, {
							args: W.$get(key)
						});
					}
				},

				/**
				 * Check if a node contains another node
				 *
				 * @param {HTMLElement} source
				 * @param {HTMLElement} target
				 * @returns {boolean} match
				 */
				contains = function(source, target) {
					return (source === D ? W._html : source).contains(target);
				},

				/**
				 * Extend target object with source object(s)
				 *
				 * @param {object} target
				 * @param {object} source
				 * @param {boolean} deep
				 * @returns object
				 */
				extend = function(target, object, deep) {
					if (object) {
						for (var key in object) {
							var src = object[key];

							if (deep === true && (W.$isObject(src) || Array.isArray(src))) {
								target[key] = extend(target[key], src, deep);
							} else if (src !== U) {
								target[key] = src;
							}
						}
					}

					return target;
				};

			return {
				_body: D.body,
				_doc: D,
				_html: D.documentElement,
				_legacy: D.getElementsByClassName ? false : true,
				_slice: [].slice,
				_win: N,
				_$: N.WeeAlias || '$',
				app: {
					/**
					 * Create an application
					 *
					 * @param {string} name
					 * @param {object} options
					 */
					make: function(name, options) {
						var conf = extend({
								model: {},
								view: ''
							}, options),
							$target = W.$(conf.view);

						conf.view = $target.html();

						var fn = function(data) {
							var rendered = W.view.render(conf.view, data);

							$target.html(rendered);
						};

						W.$set(name, conf.model);

						W.$observe(name, fn);

						// Execute constructor
						if (options._construct !== U) {
							options._construct();
						}

						fn(conf.model);
					}
				},
				fn: {
					/**
					 * Create a namespaced controller
					 *
					 * @param {string} name
					 * @param {object} pub - public methods and properties
					 * @param {object} [priv] - private methods and properties
					 */
					make: function(name, pub, priv) {
						W.fn[name] = function() {
							var Public = pub,
								Private = priv || {};

							// Ensure the current controller is not being extended
							if (name != '_tmp') {
								var data = {
									store: {},

									/**
									 * Get value from controller storage
									 *
									 * @returns {*}
									 */
									$get: function() {
										return W.$get.apply(this.store, arguments);
									},

									/**
									 * Set value in controller storage
									 *
									 * @returns {*}
									 */
									$set: function() {
										return W.$set.apply(this.store, arguments);
									},

									/**
									 * Unset value from controller storage
									 *
									 * @returns {*}
									 */
									$unset: function() {
										return W.$unset.apply(this.store, arguments);
									},

									/**
									 * Push value into controller storage
									 *
									 * @returns {Array}
									 */
									$push: function() {
										return W.$push.apply(this.store, arguments);
									},

									/**
									 * Pull value from controller storage
									 *
									 * @returns {Array}
									 */
									$pull: function() {
										return W.$pull.apply(this.store, arguments);
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
									}
								};

								// Extend public and private objects with data
								Public = extend(Public, data);
								Private = extend(Private, data);
							}

							// Clone public and private objects
							Public = extend({}, Public);
							Private = extend({}, Private);

							// Interface $public and $private
							Public.$private = Private;
							Private.$public = Public;

							for (var fn in Private) {
								Public.$private[fn] = Private[fn];
							}

							// Execute private constructor
							if (Private._construct !== U) {
								Private._construct();
							}

							// Execute public constructor
							if (Public._construct !== U) {
								Public._construct();
							}

							return Public;
						};

						W[name] = new W.fn[name]();
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
							extend(W, a);
						} else if (W.hasOwnProperty(a)) {
							// Merge the objects else create the controller
							this.make('_tmp', b, c);
							extend(W[a], W._tmp);
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
									sel = W.$get(sel);

									// Apply context filter if not document
									if (sel) {
										ref = ref.concat(
											context === D ?
												sel :
												sel.filter(function(el) {
													return contains(context, el);
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
							var pre = selector.charAt(0);

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
				 * @param {*} value
				 * @param {object} [options] - available if value is a callback
				 * @param {Array} [options.args]
				 * @param {object} [options.scope]
				 * @returns {*} value
				 */
				$set: function(key, value, options) {
					var split = storeData(key, this),
						set = W._canExec(value) || options ?
							W.$exec(value, options) :
							value;

					split[0][split[1]] = set;

					fire(key);

					return set;
				},

				/**
				 * Unset global variable
				 *
				 * @param {string} key
				 */
				$unset: function(key) {
					var split = storeData(key, this);

					delete split[0][split[1]];

					fire(key);
				},

				/**
				 * Get global variable
				 *
				 * @param {string} key
				 * @param {*} [fallback]
				 * @param {boolean} [set=false]
				 * @param {object} [options] - available if fallback is a callback
				 * @param {Array} [options.args]
				 * @param {object} [options.scope]
				 * @returns {*} value
				 */
				$get: function(key, fallback, set, options) {
					if (key) {
						var split = storeData(key, this),
							root = split[0];
						key = split[1];

						if (root.hasOwnProperty(key)) {
							return root[key];
						}

						if (fallback !== U) {
							fallback = W._canExec(fallback) ?
							W.$exec(fallback, options) || options :
								fallback;

							if (set) {
								W.$set(key, fallback);
							}

							return fallback;
						}

						return null;
					}

					return this !== W ? this : store;
				},

				/**
				 * Attach callback to data storage change
				 *
				 * @param {string} key
				 * @param {function} fn
				 */
				$observe: function(key, fn) {
					observe[key] = observe[key] || [];

					observe[key].push(fn);
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
						var conf = extend({
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
						W.$set('_env', function() {
							var env = fallback || 'local',
								host = location.host;

							for (var rule in rules) {
								var val = rules[rule];

								if (val == host || (W._canExec(val) && W.$exec(val, {
										args: [host]
									}) === true)) {
									env = rule;
									break;
								}
							}

							return env;
						});
					}

					return W.$get('_env', 'local');
				},

				/**
				 * Determine if the environment is secured over https
				 *
				 * @param {string} [url=current url]
				 * @returns {boolean} secure
				 */
				$envSecure: function(url) {
					return (url || N.location.href).slice(0, 5) == 'https';
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

					var conf = extend({
							args: []
						}, options),
						fns = W.$toArray(fn),
						len = fns.length,
						i = 0;

					for (; i < len; i++) {
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
						target = extend(target, source, deep);
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

					var conf = extend({
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
				 * Merge source array into target array
				 *
				 * @param {Array} target
				 * @param {Array} source
				 * @param {boolean} [unique=false] de-duplicate values
				 * @returns {Array}
				 */
				$merge: function(target, source, unique) {
					target = target.concat(source);

					return unique ?
						W.$unique(target) :
						target;
				},

				/**
				 * Push value into global array
				 *
				 * @param {string} key
				 * @param {*} a
				 * @param {*} [b]
				 * @returns {Array} value
				 */
				$push: function(key, a, b) {
					var split = storeData(key, this),
						root = split[0];
					key = split[1];

					if (! root.hasOwnProperty(key)) {
						root[key] = b !== U ? {} : [];
					}

					if (b !== U) {
						var isArr = Array.isArray(b);

						if (! root[key].hasOwnProperty(a)) {
							root[key][a] = isArr ? [] : {};
						}

						root[key][a] = isArr ? root[key][a].concat(b) : b;
					} else {
						Array.isArray(a) ?
							root[key] = root[key].concat(a) :
							root[key].push(a);
					}

					fire(key);

					return root[key];
				},

				/**
				 * Pull value from global array
				 *
				 * @param {string} key
				 * @param {*} a
				 */
				$pull: function(key, a) {
					var split = storeData(key, this),
						root = split[0];
					key = split[1];

					var obj = root[key];

					if (obj) {
						if (W.$isObject(obj)) {
							delete root[key];
							return;
						}

						var index = obj.indexOf(a);

						if (index > -1) {
							obj.splice(index, 1);
						}
					}
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
				 * @param {object} value
				 * @returns {string} value
				 */
				$serialize: function(value) {
					return Object.keys(value).map(function(key) {
						if (typeof value[key] != 'object') {
							return encodeURIComponent(key) + '=' +
								encodeURIComponent(value[key]);
						}
					}).join('&');
				},

				/**
				 * Add ref elements to datastore
				 *
				 * @param {(HTMLElement|string)} [context=document]
				 */
				$setRef: function(context) {
					var sets = W.$get('ref');
					context = context ? W.$(context)[0] : D;

					// Clear existing refs if reset
					if (sets) {
						Object.keys(sets).forEach(function(key) {
							W.$set('ref:' + key, sets[key].filter(function(el) {
								return ! (
									! contains(D, el) ||
									(contains(context, el) && context !== el)
								);
							}));
						});
					}

					// Set refs from DOM
					W.$each('[data-ref]', function(el) {
						var ref = el.getAttribute('data-ref');

						ref.split(/\s+/).forEach(function(val) {
							W.$push('ref', val, [el]);
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
							val = W._castString(el.getAttribute('data-value')),
							ind = key.search(/\[.*]/g);

						if (ind == -1) {
							W.$set(key, val);
							return;
						}

						var arr = key.slice(ind).slice(1, -1),
							obj = key.slice(0, ind);

						if (arr === '') {
							W.$push(obj, val);
							return;
						}

						var segs = arr.split(']['),
							len = segs.length - 1;
						key = segs[0];

						if (len) {
							var set = {},
								ref,
								i = 1;

							ref = set[key] = {};

							for (i; i <= len; i++) {
								var last = i === len;

								ref[segs[i]] = last ? val : {};

								if (! last) {
									ref = ref[segs[i]];
								}
							}

							W.$set(obj, extend(W.$get(obj, {}), set, true));
						} else {
							W.$push(obj, key, val);
						}
					}, {
						context: context
					});
				},

				/**
				 * Cast value to array if it isn't one
				 *
				 * @param {*} value
				 * @returns {Array} value
				 */
				$toArray: function(value) {
					return Array.isArray(value) ? value : [value];
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
				 * @private
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
				 * @private
				 * @param {*} val
				 */
				_castString: function(val) {
					if (typeof val == 'string') {
						try {
							val = val === 'true' ? true :
								val === 'false' ? false :
								val === 'null' ? null :
								parseInt(val) + '' === val ? parseInt(val) :
								/^(?:\{[\w\W]*}|\[[\w\W]*])$/.test(val) ? JSON.parse(val) :
								val;
						} catch (e) {}
					}

					return val;
				},

				/**
				 * Convert selection to array
				 *
				 * @private
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