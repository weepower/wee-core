/* jshint maxdepth: 5 */

(function(W, U) {
	'use strict';

	W.fn.make('routes', {
		/**
		 * Get currently bound URI values or set with string or value object
		 *
		 * @param {(object|string)} [value]
		 * @param {string} [value.full]
		 * @param {string} [value.hash]
		 * @param {boolean} [value.history]
		 * @param {string} [value.path]
		 * @param {object} [value.query]
		 * @param {array} [value.segments]
		 * @param {string} [value.url]
		 * @returns {object} data
		 */
		uri: function(value) {
			if (value) {
				if (W.$isObject(value)) {
					return this.$set('uri', W.$extend(this.uri(), value));
				}

				var a = W._doc.createElement('a'),
					query = {};
				a.href = value;

				var search = a.search;

				if (search) {
					var arr = decodeURIComponent(search).slice(1).split('&'),
						i = 0;

					for (; i < arr.length; i++) {
						var split = arr[i].split('=');
						query[split[0]] = split[1] || '';
					}
				}

				var path = a.pathname.replace(/^\/|\/$/g, '');

				return this.$set('uri', {
					full: '/' + path + search + a.hash,
					hash: a.hash.slice(1),
					history: false,
					path: '/' + path,
					query: query,
					segments: path.split('/'),
					url: a.href
				});
			}

			return this.$get('uri', function() {
				return W.routes.uri(location.href);
			}, true);
		},

		/**
		 * Get all segments or single segment at index integer
		 *
		 * @param {int} [index]
		 * @returns {(Array|string)} segments
		 */
		segments: function(index) {
			var segs = this.uri().segments;

			return index !== U ? (segs[index] || '') : segs;
		},

		/**
		 * Retrieve or add route endpoints to route storage
		 *
		 * @param {object} routes
		 * @param {bool} [init=false] - evaluate the map immediately
		 * @returns {object} routes
		 */
		map: function(routes, init) {
			var curr = this.$get('routes', {});

			if (routes) {
				this.$set('routes', W.$extend(curr, routes));

				if (init) {
					this.run({
						routes: routes
					});
				}
			}

			return curr;
		},

		/**
		 * Add conditional route handler
		 *
		 * @param {string} name
		 * @param {function} fn
		 */
		addFilter: function(name, fn) {
			this.$private.extend(name, fn);
		},

		/**
		 * Process stored routes
		 *
		 * @param {object} [conf]
		 */
		run: function(conf) {
			conf = conf || {};

			var routes = conf.routes || this.$get('routes');

			if (conf.path) {
				this.uri(conf.path);
			}

			if (routes) {
				this.$private.process(routes, 0,
					this.$set(
						'segs',
						this.segments()
					).length
				);

				// Execute queued init functions on last iteration
				var any = this.$private.any;

				if (any.length) {
					for (var i = 0; i < any.length; i++) {
						var rule = any[i];

						W.$exec(rule[0], {
							args: rule[1]
						});
					}

					// Clear array for next iteration
					this.$private.any = [];
				}
			}
		}
	}, {
		/**
		 * Any route matching storage
		 */
		any: [],

		/**
		 * Add default filters
		 */
		filters: {
			any: function(seg, child) {
				if (W.$isObject(child)) {
					return true;
				} else {
					W.routes.$private.any.push([child, seg]);
				}
			},
			'any:fire': function(seg, child) {
				W.$exec(child, {
					args: seg
				});
			},
			root: function(seg, child, depth) {
				if (! seg) {
					W.$exec(child, {
						args: W.routes.segments(depth - 2)
					});
				}
			},
			num: function(seg) {
				return ! isNaN(seg) && seg.trim() !== '';
			}
		},

		/**
		 * Extend routing engine
		 *
		 * @param {(object|string)} a
		 * @param {function} b
		 */
		extend: function(a, b) {
			var obj = a;

			if (typeof a == 'string') {
				obj = [];
				obj[a] = b;
			}

			W.$extend(this.filters, obj);
		},

		/**
		 * Recursively process routes
		 *
		 * @private
		 * @param {string} route - route to evaluate
		 * @param {int} i - current index in iteration
		 * @param {int} total - total number of routes
		 */
		process: function(route, i, total) {
			var seg = this.$get('segs')[i],
				keys = Object.keys(route),
				x = 0;
			i++;

			// Match against patterns
			for (; x < keys.length; x++) {
				var key = keys[x],
					child = route[key],
					opts = key.split('||'),
					k = 0,
					filtered = false,
					match = false;

				for (; k < opts.length; k++) {
					var opt = opts[k];

					if (opt.slice(-5) == ':eval') {
						opt = opt.slice(0, -5);
						i--;
					}

					if (opt == seg) {
						match = true;
					} else if (opt[0] == '$') {
						opt = opt.slice(1);

						// If the second character is / then test regex
						if (opt[0] == '/') {
							var split = opt.split('/');

							if (new RegExp(split[1], split[2]).test(seg)) {
								match = true;
							}
						} else {
							var filter = this.filters[opt];

							if (filter) {
								match = filter(seg, child, i);

								if (match) {
									filtered = true;

									this.any.push([child, seg]);
								}
							} else if (seg && seg.trim() !== '') {
								match = true;
							}
						}
					}
				}

				// If matched process recursively or execute if complete
				if (match) {
					if (W.$isObject(child)) {
						this.process(child, i, total);
					} else if (! filtered && i === total) {
						W.$exec(child, {
							args: seg
						});
					}
				}
			}
		}
	});
})(Wee, undefined);