/* jshint maxdepth: 5, maxparams: 6 */

(function(W, U) {
	'use strict';

	var reg = {
			args: /(\\?['"][^'"]+\\?['"]|[^,]+)/g,
			ext: /(.[^\(]+)(?:\((.*)\))?/,
			pair: /{{#(\S+?)(?:\|(.+?))?}}([\s\S]+?){{\/\1}}/g,
			partial: /{{\s*>(.+?)}}/g,
			short: /{{([^}]+) +\? ([^}]+)}}/g,
			single: /{{(.+?)}}/g,
			str: /^\\?("|')/,
			tags: /{{\s*(?:([#\/])([^#{\|\n\s]+)\s*(\|[^{\n]+)?|else)\s*}}/g
		},
		helpers = {
			is: function(a, b) {
				return a === (b !== U ? b : this.val);
			},
			not: function(a, b) {
				return ! helpers.is.call(this, a, b);
			},
			isEmpty: function(val) {
				return val !== U ? _isEmpty(val) : this.empty;
			},
			notEmpty: function(val) {
				return ! helpers.isEmpty.call(this, val);
			}
		},
		views = {},
		esc,

		/**
		 * Determine if value matches empty criteria
		 *
		 * @private
		 * @param {*} val
		 * @returns {boolean}
		 */
		_isEmpty = function(val) {
			return val === '' || val === false || val == null ||
				(typeof val == 'object' && ! Object.keys(val).length);
		},

		/**
		 * Make recursive partial replacements
		 *
		 * @private
		 * @param {string} temp
		 * @returns {string}
		 */
		_embed = function(temp) {
			temp = temp.replace(reg.partial, function(m, tag) {
				return views[tag.trim()] || '';
			});

			if (reg.partial.test(temp)) {
				temp = _embed(temp);
			}

			return temp;
		},

		/**
		 * Get specific object value
		 *
		 * @private
		 * @param {object} data
		 * @param {object} prev
		 * @param {string} key
		 * @param {string} fb
		 * @param {object} init
		 * @returns {*}
		 */
		_get = function(data, prev, key, fb, init) {
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
						if (! _isEmpty(data)) {
							return data;
						}

						break;
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
				return _string(fb) || _get(orig, prev, fb, '', init);
			}

			return fb || (W.$isObject(data) || W.$isArray(data) ? data[key] : data);
		},

		/**
		 * Process value based on quote enclosure
		 *
		 * @private
		 * @param {string} val
		 * @param {boolean} [wrap=false]
		 * @returns {string}
		 */
		_string = function(val, wrap) {
			val = val.trim();
			var match = val.match(reg.str);

			if (match) {
				return val.replace(reg.str, '')
					.replace(new RegExp(match[0] + '$'), '');
			}

			if (wrap) {
				return '{{' + val + '}}';
			}
		},

		/**
		 * Parse helper arguments
		 *
		 * @private
		 * @param {string} str
		 * @param {object} data
		 * @param {object} prev
		 * @param {object} init
		 * @returns {*}
		 */
		_parseArgs = function(str, data, prev, init) {
			var args = str !== U ? str.match(reg.args) || [] : [];

			return args.map(function(arg) {
				arg = arg.trim();
				var match = arg.match(reg.str);

				if (match) {
					return arg.replace(reg.str, '')
						.replace(new RegExp(match[0] + '$'), '');
				}

				return arg == 'true' ? true :
					arg == 'false' ? false :
					arg == 'null' ? null :
					parseInt(arg).toString() == arg ? parseInt(arg) :
					_get(data, prev, arg, '', init);
			});
		},

		/**
		 * Parse template string
		 *
		 * @private
		 * @param {string} temp
		 * @param {object} data
		 * @param {object} prev
		 * @param {object} init
		 * @param {int} index
		 * @returns {string}
		 */
		_parse = function(temp, data, prev, init, index) {
			return temp.replace(reg.pair, function(m, t, helper, inner) {
				// Return escaped template tag pairs
				if (t == '!') {
					esc = true;
					return inner.replace(/{{/g, '{~');
				}

				var tag = t.replace(/%\d+/, ''),
					cond = inner.split('{{:' + t + '}}');
				inner = cond[0];

				var val = _get(data, prev, tag, U, init),
					empty = _isEmpty(val),
					help = [],
					each;

				// Parse helpers
				if (helper || empty) {
					var meth = helper ? helper.split('|') : [],
						sec = cond.length > 1 ? cond[1] : '',
						agg = [];

					// Check for root helpers
					if (empty) {
						var arg = meth[0] && meth[0][0] == '(';
						meth.unshift(tag + (arg ? meth[0] : '()'));

						if (arg) {
							meth.splice(1, 1);
						}
					}

					// Capture available aggregates and helpers
					meth.forEach(function(el) {
						var arr = el.match(reg.ext),
							name = arr[1].trim();

						// Check for each helper
						if (name == 'each') {
							each = true;
						} else if (helpers[name]) {
							el = [helpers[name], arr[2]];
							each ? help.push(el) : agg.push(el);
						}
					});

					// Process aggregates
					if (agg.length) {
						if (! agg.every(function(f) {
							var rv = f[0].apply({
								val: val,
								data: data,
								root: init,
								tag: tag,
								empty: empty,
								index: index
							}, _parseArgs(f[1], val, prev, init));

							if (rv === false) {
								return rv;
							}

							if (rv !== true) {
								val = rv;
								empty = _isEmpty(val);
							}

							return true;
						})) {
							return _parse(sec, data, prev, init, index);
						}
					} else if (empty) {
						return _parse(sec, data, prev, init, index);
					}
				}

				// Process parent context on reserved tag pairs, excluding $root
				if (tag[0] == '$' && tag[1] != 'r') {
					val = data;
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

					return _parse(inner, val, data, init, index);
				}

				if (! empty) {
					// Loop through objects and arrays
					if (isObject) {
						var isPlainObject = W.$isObject(val),
							keys = Object.keys(val),
							total = keys.length,
							resp = '',
							i = 0;

						for (; i < total; i++) {
							var key = keys[i],
								el = val[key];
							empty = _isEmpty(el);

							var cont = help.every(function(f) {
								var rv = f[0].apply({
									val: el,
									data: data,
									root: init,
									tag: tag,
									empty: empty,
									index: i
								}, _parseArgs(f[1], el, prev, init));

								if (rv === false) {
									return rv;
								}

								if (rv !== true) {
									el = rv;
								}

								return true;
							});

							// Merge default properties
							var item = W.$extend({}, W.$isObject(el) ?
									el :
									(isPlainObject ? val : {}),
								{
									$key: key,
									$first: ! i,
									$last: i + 1 == total,
									'.': el,
									'#': i,
									'##': i + 1
								}),
								hl = helper.length;

							cont = (hl && cont) || (! hl && ! empty);

							if (cont || sec) {
								resp += _parse(cont ? inner : sec, item, data, init, i);
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
					val = _get(data, prev, tag, fb, init),
					helps = segs.length > 1 ? segs.slice(1) : segs;

				// Process helpers
				helps.forEach(function(el, i) {
					var arr = el.match(reg.ext);
					helps[i] = el.trim();

					if (arr) {
						var helper = helpers[arr[1].trim()];

						if (helper && (segs.length > 1 ||
							! data.hasOwnProperty(tag))) {
							val = helper.apply({
								val: val,
								data: data,
								root: init,
								tag: tag,
								index: index,
								fallback: fb
							}, _parseArgs(arr[2], data, prev, init));
						}
					}
				});

				// Encode output by default
				if (val === U || typeof val == 'object') {
					val = '';
				} else if (typeof val == 'string') {
					// Recursively process injected tags
					if (val.indexOf('{{') > -1) {
						val = _render(val, data);
					}

					// Encode HTML characters
					if (helps.indexOf('raw') < 0) {
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
		 * Render template string
		 *
		 * @private
		 * @param {string} temp
		 * @param {object} data
		 * @returns {string}
		 */
		_render = function(temp, data) {
			var tags = [],
				depth = [];

			// Make partial replacements
			temp = _embed(temp);

			// Match tag pairs
			temp = temp.replace(reg.short, function(m, cond, val) {
				cond = cond.trim() + '}}';
				var segs = val.split(' : '),
					resp = '{{#' + cond + _string(segs[0], true);

				if (segs.length > 1) {
					resp += '{{else}}' + _string(segs[1], true);
				}

				return resp + '{{/' + cond;
			}).replace(reg.tags, function(m, pre, tag, helper) {
				var resp = '{{';

				if (tag == '!') {
					esc = pre == '#';
					resp += pre + tag;
				} else if (esc) {
					return m;
				} else if (pre) {
					var segs = tag.split('('),
						root = segs[0],
						exists = tags.hasOwnProperty(tag);
					resp += pre + root + '%';

					if (pre == '#') {
						depth.push(root);

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
							helper = '(' + segs.slice(1).join('(');
						}

						resp += tags[root].i + (helper || '');
					} else if (exists) {
						resp += tags[root].o.pop();
						tags[root].i--;
						depth.pop();
					}
				} else if (depth.length) {
					tag = depth.slice(-1)[0];
					resp += ':' + tag + '%' + tags[tag].i;
				}

				return resp + '}}';
			});

			// Parse template tags
			return _parse(temp, data, {}, data, 0);
		};

	W.app = {
		/**
		 * Application instance storage
		 */
		fn: {},

		/**
		 * Create an application
		 *
		 * @param {string} name
		 * @param {object} options
		 * @param {object} options.model
		 * @param {($|HTMLElement|string)} [options.target]
		 * @param {($|HTMLElement|string)} options.view
		 *
		 */
		make: function(name, options) {
			var sel = options.view,
				targ = options.target,
				model = options.model || {},
				views = W.$(targ || sel).map(function(el) {
					return [el, targ ? sel : el.outerHTML];
				}),
				fn = function(data) {
					views.forEach(function(view) {
						W.$setRef(
							W.view.diff(view[0], W.$parseHTML(
								W.view.render(view[1], data)
							), targ)
						);
					});
				},
				app = W.app;

			// Create a new application controller
			app.fn[name] = W._make(name, {}, {}, false, model);
			app[name] = new app.fn[name]();

			fn(model);

			W.$extend(app[name], {
				/**
				 * Destroy current application
				 */
				$destroy: function() {
					if (options._destruct) {
						options._destruct();
					}

					delete app[name];
				},

				/**
				 * Pause view updating
				 */
				$pause: function() {
					app[name].$unobserve('*');
				},

				/**
				 * Resume view updating
				 *
				 * @param {boolean} [update=false]
				 */
				$resume: function(update) {
					app[name].$observe('*', fn);

					if (update) {
						fn(app[name].$get());
					}
				}
			});

			// Initialize app observation
			app[name].$resume();

			return app[name];
		}
	};

	W.view = {
		/**
		 * Parse data into template string
		 *
		 * @param {string} template
		 * @param {object} [data]
		 * @returns {string}
		 */
		render: function(template, data) {
			esc = false;
			template = _render(views[template] || template, W.$extend(data));

			return esc ?
				template.replace(/{~/g, '{{') :
				template;
		},

		/**
		 * Add conditional template handler or tag data modifier
		 *
		 * @param {object|string} name
		 * @param {function} [fn]
		 */
		addHelper: function(name, fn) {
			W._extend(helpers, name, fn);
		},

		/**
		 * Check for the existence of a named helper
		 *
		 * @param {string} name
		 */
		hasHelper: function(name) {
			return typeof helpers[name] !== 'undefined';
		},

		/**
		 * Add views to store for on-demand reference
		 *
		 * @param {object|string} name
		 * @param {string} [value]
		 */
		addView: function(name, value) {
			W._extend(views, name, value);
		}
	};
})(Wee, undefined);