/* jshint maxdepth: 5, maxparams: 6 */

(function(W, U) {
	'use strict';

	var reg = {
			tags: /{{\s*([#\/])([^#{\|\n]+)(\|[^{\n]+)?}}/g,
			partial: /{{\s*> (.+?)}}/g,
			pair: /{{#(.+?)(?:|\|?([^}]*))}}([\s\S]*?){{\/\1}}/g,
			single: /{{(.+?)}}/g,
			ext: /(.[^\(]+)(?:\((.*)\))?/,
			str: /^\\?("|')/,
			args: /(\\?['"][^'"]+\\?['"]|[^,]+)/g
		},
		_isEmpty = function(val) {
			return val == '' ||
				val === false ||
				val == null ||
				(typeof val == 'object' && ! Object.keys(val).length);
		},
		filters = {
			is: function(val) {
				return this.val === val;
			},
			not: function(val) {
				return this.val !== val;
			},
			isEmpty: function() {
				return this.empty;
			},
			notEmpty: function() {
				return ! this.empty;
			}
		},
		helpers = {},
		partials = {},
		esc;

	W.app = {
		/**
		 * Create an application
		 *
		 * @param {string} name
		 * @param {object} [options] - application configuration
		 */
		make: function(name, options) {
			var views = W.$(options.view).map(function(el) {
					return [el, el.outerHTML];
				}),
				fn = function(data) {
					views.forEach(function(view) {
						W.view.diff(view[0], W.view.render(view[1], data));
					});
				};

			W.app[name] = W._make(name, {}, false, options.model);
			W[name] = new W.app[name]();

			fn(options.model);

			W[name].$observe('*', fn);
		}
	};

	W.fn.make('view', {
		/**
		 * Parse data into template string
		 *
		 * @param {string} template
		 * @param {object} data
		 * @returns {string}
		 */
		render: function(template, data) {
			return this.$private.render(template, W.$extend(data));
		},

		/**
		 * Add conditional template handler or data modifier
		 *
		 * @param {string} name
		 * @param {function} fn
		 */
		addFilter: function(name, fn) {
			this.$private.extend(filters, name, fn);
		},

		/**
		 * Add helper to run additional processing on tag data
		 *
		 * @param {string} name
		 * @param {function} fn
		 */
		addHelper: function(name, fn) {
			this.$private.extend(helpers, name, fn);
		},

		/**
		 * Make partial available for injection into other templates
		 *
		 * @param {string} name
		 * @param {string} value
		 */
		addPartial: function(name, value) {
			this.$private.extend(partials, name, value);
		}
	}, {
		/**
		 * Extend view engine
		 *
		 * @param {string} type
		 * @param {(object|string)} a
		 * @param {function} b
		 */
		extend: function(type, a, b) {
			var obj = a;

			if (typeof a == 'string') {
				obj = [];
				obj[a] = b;
			}

			W.$extend(type, obj);
		},

		/**
		 * Render template string
		 *
		 * @param {string} temp
		 * @param {object} data
		 * @returns {string}
		 */
		render: function(temp, data) {
			var tags = [];

			// Make partial replacements and match tag pairs
			temp = temp.replace(reg.partial, function(match, tag) {
				var partial = partials[tag.trim()];

				return partial ? (
					W.$isFunction(partial) ?
						partial() :
						partial
				) : '';
			}).replace(reg.tags, function(m, pre, tag, filter) {
				tag = tag.trim();

				var segs = tag.split('('),
					root = segs[0],
					resp = '{{' + pre,
					exists = tags.hasOwnProperty(tag);

				if (pre == '#' && tag) {
					if (exists) {
						tags[root].i++;
						tags[root].o.push(tags[root].i);
					} else {
						tags[root] = {
							i: 1,
							o: [1]
						};
					}

					if (segs.length > 1) {
						filter = '(' + segs.slice(1).join('(');
					}

					resp += root + '%' + tags[root].i + (filter || '');
				} else if (exists) {
					resp += root + '%' + tags[root].o.pop();
				}

				return resp + '}}';
			});

			// Parse template tags
			temp = this.parse(temp, data, {}, data, 0);

			// Reconstitute replacements
			return esc ?
				temp.replace(/{~/g, '{{')
					.replace(/~}/g, '}}')
					.replace(/%\d+/g, '') :
				temp;
		},

		/**
		 * Parse template string
		 *
		 * @param {string} temp
		 * @param {object} data
		 * @param {object} prev
		 * @param {object} init
		 * @param {int} index
		 * @returns {string}
		 */
		parse: function(temp, data, prev, init, index) {
			var scope = this;

			return temp.replace(reg.pair, function(m, tag, filter, inner) {
				// Remove tag depth suffix
				tag = tag.replace(/%\d+/, '');

				// Escape child template tags
				if (tag == '!') {
					esc = true;

					return inner.replace(/{{/g, '{~')
						.replace(/}}/g, '~}');
				}

				esc = false;

				var val = scope.get(data, prev, tag, U, init, index),
					empty = _isEmpty(val),
					filt = [],
					each;

				// Parse filters
				if (filter || empty) {
					var meth = filter ? filter.split('|') : [],
						agg = [];

					// Check for root filters
					if (empty) {
						var arg = meth[0] && meth[0][0] == '(';
						meth.unshift(tag + (arg ? meth[0] : '()'));

						if (arg) {
							meth.splice(1, 1);
						}
					}

					// Capture available aggregates and filters
					meth.forEach(function(el) {
						var arr = el.match(reg.ext),
							name = arr[1].trim();

						// Check for each filter
						if (name == 'each') {
							each = true;
						} else if (filters[name]) {
							el = [filters[name], arr[2]];
							each ? filt.push(el) : agg.push(el);
						}
					});

					// Process aggregates
					if (agg.length) {
						if (! agg.every(function(f) {
								return f[0].apply({
									val: val,
									data: data,
									root: init,
									tag: tag,
									empty: empty,
									index: index
								}, scope.parseArgs(f[1], val)) !== false;
							})) {
							return '';
						}
					}
				}

				var isObject = typeof val == 'object';

				if (! each) {
					if (! isObject) {
						val = W.$extend({}, data, {
							'.': val,
							'#': 0,
							'##': 1
						});
					}

					return scope.parse(inner, val, data, init, index);
				}

				if (! empty) {
					// Loop through objects and arrays
					if (isObject) {
						var isPlainObject = W.$isObject(val),
							resp = '',
							i = 0;

						for (var key in val) {
							if (val.hasOwnProperty(key)) {
								// Merge default properties
								var el = val[key],
									item = W.$extend({}, W.$isObject(el) ?
										el :
										(isPlainObject ? val : {}),
									{
										$key: key,
										'.': el,
										'#': i,
										'##': i + 1
									});

								empty = _isEmpty(el);

								// Process filters
								if (! filt.length ||
									filt.every(function(f) {
										return f[0].apply({
											val: el,
											data: val,
											root: init,
											tag: tag,
											empty: empty,
											index: i
										}, scope.parseArgs(f[1], el)) !== false;
									})) {
									resp += scope.parse(inner, item, data, init, i);
								}

								i++;
							}
						}

						return resp;
					}

					return inner;
				}
			}).replace(reg.single, function(m, set) {
				var split = set.split('||'),
					fb = split[1],
					segs = split[0].split('|'),
					tag = segs[0].trim(),
					val = scope.get(data, prev, tag, fb, init, index),
					help = segs.length > 1 ? segs.slice(1) : segs;

				// Return empty string if output isn't available
				if (val === U || typeof val == 'object') {
					val = '';
				}

				// Process helpers
				help.forEach(function(el, i) {
					var arr = el.match(reg.ext);
					help[i] = el.trim();

					if (arr) {
						var helper = helpers[arr[1].trim()];

						if (helper) {
							val = helper.apply({
								val: val,
								data: data,
								root: init,
								tag: tag,
								index: index,
								fallback: fb
							}, scope.parseArgs(arr[2], data));
						}
					}
				});

				// Encode output by default
				if (val === U) {
					val = '';
				} else if (typeof val == 'string') {
					if (help.indexOf('raw') < 0) {
						val = val.replace(/&amp;/g, '&')
							.replace(/&/g, '&amp;')
							.replace(/</g, '&lt;')
							.replace(/>/g, '&gt;')
							.replace(/"/g, '&quot;');
					}
				}

				return val;
			});
		},

		/**
		 * Get specific object value
		 *
		 * @param {object} data
		 * @param {object} prev
		 * @param {string} key
		 * @param {string} fb
		 * @param {object} init
		 * @param {int} x
		 * @returns {*}
		 */
		get: function(data, prev, key, fb, init, x) {
			key = key.trim();

			// Alter context
			if (key.substr(0, 6) == '$root.') {
				key = key.substr(6);
				data = init;
			} else if (key.substr(0, 3) == '../') {
				key = key.substr(3);
				data = prev;
			}

			var segs = key == '.' ? ['.'] : key.split('.'),
				orig = data,
				len = segs.length - 1,
				i = 0;

			// Loop through object segments
			for (; i <= len; i++) {
				key = segs[i];

				if (data && data.hasOwnProperty(key)) {
					data = data[key];

					// Return value on last segment
					if (i === len) {
						return data;
					}
				} else {
					break;
				}
			}

			if (key == '.') {
				return data;
			}

			// Process fallback value
			if (fb && fb !== '') {
				fb = fb.trim();
				var match = fb.match(reg.str);

				if (match) {
					return fb.replace(reg.str, '')
						.replace(new RegExp(match[0] + '$'), '');
				}

				return this.get(orig, prev, fb, '', init, x);
			}

			return fb;
		},

		/**
		 * Parse filter and helper arguments
		 *
		 * @param {string} str
		 * @returns {*}
		 */
		parseArgs: function(str, data) {
			var args = str !== U ? str.match(reg.args) || [] : [];

			return args.map(function(arg) {
				arg = arg.trim();

				if (data && data.hasOwnProperty(arg) && isNaN(arg)) {
					return data[arg];
				} else {
					var match = arg.match(reg.str);

					if (match) {
						return arg.replace(reg.str, '')
							.replace(new RegExp(match[0] + '$'), '');
					}
				}

				return arg == 'true' ? true :
					arg == 'false' ? false :
					arg == 'null' ? null :
					parseInt(arg).toString() == arg ? parseInt(arg) :
					'';
			});
		}
	});
})(Wee, undefined);