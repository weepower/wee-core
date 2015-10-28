/* jshint maxdepth: 6 */

(function(W, U) {
	'use strict';

	var filters = {
			num: function(seg) {
				return Number(parseInt(seg)) == seg;
			}
		},
		any = [],
		routes,
		segs,
		uri,

		/**
		 * Recursively process routes
		 *
		 * @private
		 * @param {string} route - route to evaluate
		 * @param {int} i - current index in iteration
		 * @param {int} total - total number of routes
		 * @param {string} [event='load'] - lifecycle event
		 */
		_process = function(route, i, total, event) {
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
					y = i,
					match = false,
					ran = false;

				for (; k < opts.length; k++) {
					var opt = opts[k],
						parts = opt.split(':'),
						history = event != U,
						negate = false,
						push = false,
						eq = false;

					// Ensure event type matches route type
					if ((! history && (
							parts.indexOf('unload') > -1 ||
							parts.indexOf('pop') > -1)
						) ||
						(history && (
							! W.$isObject(child) &&
							parts.indexOf(event) < 0
						))) {
						continue;
					}

					// Set option to rule root
					if (parts.length > 1) {
						opt = parts[0];
					}

					// Negate routes prefixed by !
					if (opt[0] == '!') {
						opt = opt.slice(1);
						negate = true;
					}

					// Move the segment pointer back one level
					if (parts.indexOf('eval') > -1) {
						y--;
					}

					if (opt == seg) {
						eq = true;
					} else if (opt[0] == '$') {
						opt = opt.slice(1);

						if (opt == 'any') {
							eq = true;

							if (parts.indexOf('fire') > -1) {
								ran = true;
							} else if (! W.$isObject(child)) {
								push = true;
							}
						} else if (opt == 'root') {
							if (! seg) {
								eq = true;
								ran = true;
							}
						} else if (opt[0] == '/') {
							var split = opt.split('/');

							if (new RegExp(split[1], split[2]).test(seg)) {
								eq = true;
							}
						} else {
							var filter = filters[opt];

							if (filter) {
								if (filter(seg, child, y) === true) {
									eq = true;
									push = true;
								}
							} else if (seg && seg.trim() !== '') {
								eq = true;
							}
						}
					}

					// Invert the equality if the route is negated
					if (negate) {
						eq = ! eq;
					}

					if (eq) {
						// If ran is true then execute the route immediately
						if (ran) {
							W.$exec(child, {
								args: seg
							});
						}

						// If push is true then push the route to the any queue
						if (push) {
							ran = true;
							any.push([child, seg]);
						}

						// Remove the route if set to once
						if (parts.indexOf('once') > -1) {
							delete route[key];
						}

						// Set match to true and break on match
						match = true;
						break;
					}
				}

				// If matched then process recursively or execute if applicable
				if (match) {
					if (W.$isObject(child)) {
						_process(child, y, total, event);
					} else if (! ran && y === total) {
						W.$exec(child, {
							args: seg
						});
					}
				}
			}
		};

	W.fn.make('routes', {
		/**
		 * Get current URI values or set with string or value
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
					path = a.pathname.replace(/^\/|\/$/g, '');

				uri = {
					full: '/' + path + search + a.hash,
					hash: a.hash.slice(1),
					history: false,
					path: '/' + path,
					query: search ? W.$unserialize(search) : {},
					segments: path.split('/'),
					url: a.href
				};
			} else if (! uri) {
				uri = W.routes.uri(location.href);
			}

			return uri;
		},

		/**
		 * Get all segments or segment at index
		 *
		 * @param {int} [index]
		 * @returns {(Array|string)} segments
		 */
		segments: function(index) {
			var segs = this.uri().segments;

			return index !== U ? (segs[index] || '') : segs;
		},

		/**
		 * Retrieve or add route endpoints
		 *
		 * @param {object} obj - routes
		 * @param {bool} [init=false] - immediately evaluate routes
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
		 * Add conditional route filter
		 *
		 * @param {(object|string)} name or filter object
		 * @param {function} [fn]
		 */
		addFilter: function(name, fn) {
			W._extend(filters, name, fn);
		},

		/**
		 * Evaluate routes against URI
		 *
		 * @param {object} [conf]
		 * @param {string} [cong.event='load']
		 * @param {string} [conf.path]
		 * @param {object} [conf.rules]
		 */
		run: function(conf) {
			conf = conf || {};
			var rules = conf.routes || routes;

			if (rules) {
				segs = conf.path ?
					conf.path.replace(/^\/|\/$/g, '').split('/') :
					this.segments();

				_process(rules, 0, segs.length, conf.event);

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
	});
})(Wee, undefined);