/* jshint maxparams: 5 */

(function(W, D, E, H, U) {
	'use strict';

	var support = H && H.pushState,
		entries = [],
		settings = {},
		root = '',
		path = '',
		url = '',

		/**
		 * Return current path
		 *
		 * @private
		 * @param {object} [loc]
		 * @returns {string}
		 */
		_path = function(loc) {
			loc = loc || location;
			return loc.pathname + loc.search + loc.hash;
		},

		/**
		 * Determine if path is valid for history navigation
		 *
		 * @private
		 * @param {HTMLElement} el
		 */
		_isValid = function(el) {
			var host = el.host,
				path = el.pathname,
				loc = location;

			if (! el.href ||
				el.target == '_blank' ||
				! /https?:/.test(el.href) ||
				el.hasAttribute('download') ||
				el.hasAttribute('data-static') ||
				(host && host != loc.host) ||
				(el.hash && path == loc.pathname)
			) {
				return false;
			}

			var exts = settings.extensions,
				segs = path.split('.'),
				ext;

			if (segs.length > 1) {
				ext = segs.pop().split(/#|\?/)[0];
			}

			return ! ext || (exts && exts.indexOf(ext) > -1);
		},

		/**
		 * Reset references and variables for a given selector
		 *
		 * @private
		 * @param sel
		 */
		_reset = function(sel) {
			W.$setRef(sel);
			W.$setVar(sel);

			W.history.bind(false, sel);
		},

		/**
		 * Process the history state of the request
		 *
		 * @private
		 * @param {object} conf
		 */
		_process = function(conf) {
			var request = conf.request,
				method = request.method;

			if (! method || method == 'get') {
				conf.path = D._getUrl(request);
			}

			var key = conf.path.replace(/^\//g, ''),
				obj = {
					args: [
						{
							dir: conf.push ? 1 : -1,
							path: conf.path,
							prev: path
						}
					]
				};
			entries[key] = conf;

			// Add entry to HTML5 history
			if (conf.push && support) {
				H.pushState(0, '', conf.path);
			}

			// Update document title
			if (conf.title) {
				W._doc.title = conf.title;
			}

			if (W.routes) {
				// Update current path
				W.routes.uri(conf.path);
				W.routes.uri({
					history: true
				});

				// Evaluate routes against updated path
				if (conf.run) {
					W.routes.run({
						event: 'pop',
						path: path
					});

					W.routes.run({
						path: conf.path
					});
				}

				path = conf.path;
			}

			if (conf.push && conf.pushstate) {
				W.$exec(conf.pushstate, obj);
			}

			if (conf.pop && conf.popstate) {
				W.$exec(conf.popstate, obj);
			}

			if (conf.end) {
				W.$exec(conf.end, obj);
			}
		};

	W.history = {
		/**
		 * Set the initial state and popstate event, and bind global actions
		 *
		 * @param {object} [options]
		 * @param {($|boolean|HTMLElement|string)} [options.bind]
		 * @param {Array} [options.extensions]
		 * @param {string} [options.partials='title,main']
		 * @param {boolean} [options.processErrors=false]
		 * @param {boolean} [options.push=true]
		 * @param {object} [options.request]
		 * @param {boolean} [options.run=true]
		 * @param {boolean} [options.useResponseURL=true]
		 */
		init: function(options) {
			if (! this.request) {
				path = _path();
				settings = W.$extend({
					partials: 'title,main',
					push: true,
					request: {},
					run: true,
					scrollTop: 0
				}, options);
				root = settings.request.root || '';
				url = W.routes.uri().full;

				this.request = settings.request;
				delete settings.request;

				if (support) {
					H.scrollRestoration = 'manual';

					// Set current state
					H.replaceState(0, '');

					// Listen for browser navigation
					E.on(W._win, 'popstate.history', function(e) {
						if (e.state !== null) {
							var url = _path(),
								prevConf = entries[path.replace(/^\//g, '')];

							if (prevConf) {
								var conf = W.$extend(
									entries[url.replace(/^\//g, '')] || {
										request: {
											root: ''
										}
									}, {
										path: url,
										push: false,
										pop: true
									}
								);
								conf.partials = prevConf.partials;

								// Restore previous scroll position
								if (e.state.top) {
									conf.scrollTop = e.state.top;
								}

								W.history.go(conf);
							} else {
								W._win.location = url;
							}
						}
					});
				}

				// Bind PJAX actions
				this.bind();
			}
		},

		/**
		 * Bind element events and form submit events to PJAX
		 *
		 * @param {(boolean|object)} [events]
		 * @param {($|HTMLElement|Object|string)} [a] - settings or context
		 * @param {($|HTMLElement|string)} [context=document]
		 */
		bind: function(events, a, context) {
			events = events || settings.bind;

			if (events === true) {
				events = {
					click: 'a',
					submit: 'form'
				};
			}

			if (support && typeof events == 'object') {
				var keys = Object.keys(events),
					i = 0;

				if (! W.$isObject(a)) {
					context = a;
					a = {};
				}

				for (; i < keys.length; i++) {
					var event = keys[i],
						sel = events[event];

					W.$each(sel, function(el) {
						var evt = event.split(' ').map(function(val) {
								return val + '.history';
							}).join(' '),
							loc = el.getAttribute('data-url'),
							form = el.nodeName == 'FORM',
							l = el;

						if (loc || form) {
							var attrs = el.attributes,
								x = 0,
								attr;
							l = W._doc.createElement('a');

							for (; x < attrs.length; x++) {
								attr = attrs[x];
								l.setAttribute(attr.name, attr.value);
							}

							l.href = loc || el.getAttribute('action') || url;
						}

						// Ensure the path exists and is local
						if (! evt || ! _isValid(l)) {
							return;
						}

						var options = W.$extend(true, {}, a);

						// Remove existing history events
						E.off(el, '.history');

						E.on(el, evt, function(e, el) {
							if (! e.metaKey) {
								options.path = _path(l);

								if (form) {
									if (el.method.toLowerCase() == 'post') {
										options.request = W.$extend(options.request, {
											data: W.$serializeForm(el, true),
											type: 'form',
											method: 'post'
										});
									} else {
										options.path += '?' + W.$serializeForm(el);
									}
								}

								W.history.go(options);
								e.preventDefault();
							}
						});
					}, {
						context: context
					});
				}
			}
		},

		/**
		 * Navigate to a new path or within the browser history
		 *
		 * @param {object} options
		 * @param {string} [options.action='replace']
		 * @param {Array} [options.extensions]
		 * @param {string} [options.partials='title,main']
		 * @param {string} [options.path=current path]
		 * @param {boolean} [options.push=true]
		 * @param {(boolean|object)} [options.request]
		 * @param {boolean} [options.run=true]
		 * @param {($|boolean|HTMLElement|number|string)} [options.scrollTop]
		 * @param {string} [options.title]
		 */
		go: function(options) {
			var scope = this;

			if (! scope.request) {
				scope.init();
			}

			var req = scope.request,
				mock = options.action === false,
				conf = W.$extend(
					{},
					settings,
					options
				),
				request = W.$extend(
					{},
					req,
					conf.request || {}
				),
				route = conf.run && W.routes;

			request.root = request.root !== U ? request.root : root;
			request.url = request.url !== U ? request.url : conf.path;

			// Navigate to external URL or if history isn't supported
			var a = W._doc.createElement('a');
			a.href = request.root + request.url;

			if (! support || ! _isValid(a)) {
				W._win.location = request.url;
				return false;
			}

			if (conf.begin && W.$exec(conf.begin, {
					args: [conf]
				}) === false) {
				return;
			}

			// Set current scroll position
			H.replaceState({
				top: W._body.scrollTop
			}, '');

			// Reset URL to exclude root
			a.href = request.url;

			url = _path(a);
			request.url = url;
			conf.request = request;

			// Evaluate preload routes against target path
			if (route) {
				W.routes.run({
					event: 'preload',
					path: url
				});
			}

			var sendEvents = [],
				successEvents = [],
				errorEvents = [],
				completeEvents = [],
				partials = conf.partials,
				targets = W.$(partials);

			// Setup PJAX headers
			request.headers = W.$extend({
				'X-PJAX': 'true',
				'X-Requested-With': false
			}, request.headers);

			// Process send events
			if (request.send) {
				sendEvents.push(request.send);
			}

			if (req.send) {
				sendEvents.push(req.send);
			}

			request.send = sendEvents;

			// Compile success events
			var replaceEvent = function(x) {
				var html = typeof x == 'string' ? x : x.responseText;

				if (conf.replace) {
					html = W.$exec(conf.replace, {
						args: [html]
					}) || html;
				}

				// Evaluate unload routes against updated path
				if (route) {
					W.routes.run({
						event: 'unload',
						path: path
					});
				}

				if (partials) {
					html = W.$parseHTML('<i>' + html + '</i>').firstChild;

					// Make partial replacements from response
					W.$each(partials.split(','), function(sel) {
						W.$each(sel, function(el) {
							var target = W.$(sel)[0];

							if (target) {
								var parent = target.parentNode;

								conf.action == 'append' ?
									parent.appendChild(el) :
									parent.replaceChild(el, target);

								_reset(parent);
							}
						}, {
							context: html
						});
					});
				} else {
					targets.innerHTML = html;

					_reset(targets);
				}
			};

			if (! mock) {
				successEvents.push(replaceEvent);
			}

			if (request.success) {
				successEvents.push(request.success);
			}

			if (req.success) {
				successEvents.push(req.success);
			}

			var scrollEvent = function() {
				var st = conf.scrollTop;

				// Scroll vertically to target
				if (st !== false) {
					var top = 0,
						anim = W.animate;

					if (a.hash) {
						st = a.hash;
					}

					if (typeof st == 'number') {
						top = st;
					} else {
						var el = W.$(st)[0];

						if (el) {
							top = el.getBoundingClientRect().top +
								W._win.pageYOffset;
						}
					}

					if (anim) {
						anim.tween(W._body, {
							scrollTop: top
						});
					} else {
						W._body.scrollTop = top;
					}
				}
			};

			successEvents.push(scrollEvent);

			request.success = successEvents;

			// Compile error events
			if (request.error) {
				errorEvents.push(request.error);
			}

			if (req.error) {
				errorEvents.push(req.error);
			}

			// Optionally process error events
			if (conf.processErrors) {
				errorEvents.push(replaceEvent);
				errorEvents.push(scrollEvent);
			}

			request.error = errorEvents;

			// Compile complete events
			if (request.complete) {
				completeEvents.push(request.complete);
			}

			if (req.complete) {
				completeEvents.push(req.complete);
			}

			if (! mock) {
				completeEvents.push(function(x) {
					var code = x.status,
						responseURL = x.responseURL;

					if (conf.useResponseURL !== false && conf.request.type === 'form' && responseURL) {
						conf.path = '/' + responseURL.replace(/^(?:\/\/|[^\/]+)*\//, '');
					}

					if (conf.processErrors || (code >= 200 && code < 400)) {
						_process(conf);
					}
				});
			}

			request.complete = completeEvents;

			// Make Ajax request
			request.args = request.args || [];
			request.args.unshift(targets);

			if (mock) {
				W.$exec(sendEvents.concat(
					successEvents,
					completeEvents
				));

				_process(conf);
			} else {
				D.request(request);
			}
		}
	};
})(Wee, Wee.data, Wee.events, history, undefined);