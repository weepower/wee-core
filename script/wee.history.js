(function(W, U, H) {
	'use strict';

	W.fn.make('history', {
		/**
		 * Set the initial state and popstate event, and bind global actions
		 *
		 * @param {object} [opt]
		 * @param {boolean] [opt.push=true]
		 * @param {boolean} [opt.run=true]
		 * @param {($|HTMLElement|string)} [opt.bind]
		 */
		init: function(opt) {
			if (! this.conf && H && H.pushState) {
				var loc = W._win.location,
					path = loc.pathname,
					settings = W.$extend({
						data: {},
						push: true,
						run: true
					}, opt);

				this.settings = settings;

				// Set current state
				H.replaceState(0, 0, path);

				// Listen for browser navigation
				W.events.on(W._win, 'popstate', function(e) {
					var path = loc.pathname,
						conf = this.$get('entries')[path.replace(/^\//g, '')];

					this.go(Wee.$extend(
						conf || {},
						{
							path: path,
							push: false
						}
					));
				}, {
					scope: this
				});

				// Bind PJAX actions
				if (settings.bind) {
					this.bind(settings.bind);
				}
			}
		},

		/**
		 * Bind click and submit events to PJAX
		 *
		 * @param {($|HTMLElement|string)} sel
		 * @param {HTMLElement} [context]
		 */
		bind: function(sel, context) {
			$(sel).each(function(el) {
				var namespace = '.history',
					event,
					host,
					path;

				if (el.href && el.href[0] !== '#') {
					event = 'click' + namespace;
					host = el.hostname;
					path = el.pathname;
				} else if (el.action) {
					var a = W._doc.createElement('a');
					a.href = el.action;
					event = 'submit' + namespace;
					host = a.hostname;
					path = a.pathname;
				}

				// Ensure the path exists and is local
				if (path && host == W._win.location.hostname) {
					W.events.on(el, event, function(e) {
						W.history.go({
							path: path,
							data: {
								url: path
							}
						});

						e.preventDefault();
					});
				}
			}, {
				context: context
			});
		},

		/**
		 * Navigate to a new path or within the browser history
		 *
		 * @param {object} opt
		 * @param {string} [opt.path=current path]
		 * @param {boolean} [opt.push=true]
		 * @param {boolean} [opt.run=true]
		 * @param {string} [opt.title='']
		 * @param {object} [opt.data]
		 * @param {($|HTMLElement|string)} [scrollTop]
		 */
		go: function(opt) {
			var scope = this,
				global = scope.settings,
				conf = W.$extend(
					global,
					opt
				),
				data = conf.data,
				globalData = global.data;

			data.url = data.url !== U ?
				data.url :
				conf.path;

			// Request partial Ajax data
			if (data.url) {
				var sendEvents = [],
					successEvents = [],
					errorEvents = [],
					completeEvents = [],
					partials = conf.partials,
					targets = partials ?
						W.$(partials) :
						W._body;

				// Set Pjax header
				data.headers = data.headers || {};
				data.headers['X-PJAX'] = 'true';

				// Process send events
				if (data.send) {
					sendEvents.push(data.send);
				}

				if (globalData.send) {
					sendEvents.push(globalData.send);
				}

				data.send = sendEvents;

				// Compile success events
				successEvents.push(function(html) {
					if (partials) {
						html = W.$parseHTML('<div>' + html + '</div>');

						// Make partial replacements from response
						W.$each(partials.split(','), function(sel) {
							W.$each(sel, function(el) {
								var target = $(sel)[0];

								if (target) {
									target.parentNode.replaceChild(el, target);
								}
							}, {
								context: html
							});
						})
					} else {
						targets.innerHTML = html;
					}

					// Update references
					W.$setRef(targets);
				});

				if (data.success) {
					successEvents.push(data.success);
				}

				if (globalData.success) {
					successEvents.push(globalData.success);
				}

				successEvents.push(function() {
					scope.$private.process(conf);

					// Scroll vertically to target
					if (conf.scrollTop !== U) {
						W._body.scrollTop = typeof conf.scrollTop == 'number' ?
							conf.scrollTop :
							W.$(conf.scrollTop)[0].getBoundingClientRect().top +
								W._win.pageYOffset;
					}
				});

				data.success = successEvents;

				// Compile error events
				if (data.error) {
					errorEvents.push(data.error);
				}

				if (globalData.error) {
					errorEvents.push(globalData.error);
				}

				data.error = errorEvents;

				// Compile complete events
				if (data.complete) {
					completeEvents.push(data.complete);
				}

				if (globalData.complete) {
					completeEvents.push(globalData.complete);
				}

				data.complete = completeEvents;

				// Make Ajax request
				data.args = data.args || [];
				data.args.unshift(targets);

				W.data.request(data);
			} else {
				scope.$private.process(conf);
			}
		}
	}, {
		process: function(conf, html) {
			var key = conf.path.replace(/^\//g, '');

			this.$push('entries', key, conf);

			// Add entry to HTML5 history
			if (conf.push) {
				H.pushState(0, 0, conf.path);
			}

			// Update document title
			if (conf.title) {
				W._doc.title = conf.title;
			}

			if (W.routes) {
				// Update current path
				W.routes.uri({
					path: conf.path,
					history: true
				});

				// Evaluate routes against updated path
				if (conf.run) {
					W.routes.run();
				}
			}
		}
	});
})(Wee, undefined, history);