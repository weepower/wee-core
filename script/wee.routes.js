/* jshint maxdepth: 6 */

(function(W, U) {
	'use strict';

	/**
	 * Setup initial variables
	 */
	var filters = {
			any: function(seg, child) {
				if (W.$isObject(child)) {
					return true;
				} else {
					any.push([child, seg]);
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
				return Number(parseInt(seg)) == seg;
			}
		},
		any = [],
		routes,
		segs,
		uri;

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
					uri = W.$extend(this.uri(), value);
					return uri;
				}

				var a = W._doc.createElement('a');
				a.href = value;

				var search = a.search,
					query = search ? W.$unserialize(search) : {},
					path = a.pathname.replace(/^\/|\/$/g, '');

				uri = {
					full: '/' + path + search + a.hash,
					hash: a.hash.slice(1),
					history: false,
					path: '/' + path,
					query: query,
					segments: path.split('/'),
					url: a.href
				};
			} else if (! uri) {
				uri = W.routes.uri(location.href);
			}

			return uri;
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
		 * @param {object} obj - routes
		 * @param {bool} [init=false] - evaluate the map immediately
		 * @returns {object} routes
		 */
		map: function(obj, init) {
			var curr = routes || {};

			if (obj) {
				routes = W.$extend(curr, obj);

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
			W._extend(filters, name, fn);
		},

		/**
		 * Process stored routes
		 *
		 * @param {object} [conf]
		 */
		run: function(conf) {
			conf = conf || {};

			var rules = conf.routes || routes;

			if (conf.path) {
				this.uri(conf.path);
			}

			if (rules) {
				segs = this.segments();

				this.$private.process(rules, 0, segs.length);

				// Execute queued init functions on last iteration
				if (any.length) {
					for (var i = 0; i < any.length; i++) {
						var rule = any[i];

						W.$exec(rule[0], {
							args: rule[1]
						});
					}

					// Clear array for next iteration
					any = [];
				}
			}
		}
	}, {
		/**
		 * Recursively process routes
		 *
		 * @private
		 * @param {string} route - route to evaluate
		 * @param {int} i - current index in iteration
		 * @param {int} total - total number of routes
		 */
		process: function(route, i, total) {
			var seg = segs[i],
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
							var filter = filters[opt];

							if (filter) {
								match = filter(seg, child, i);

								if (match) {
									filtered = true;

									any.push([child, seg]);
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