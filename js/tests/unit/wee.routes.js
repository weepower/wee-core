define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert');

	require('js/tests/support/exports.js');

	registerSuite({
		name: 'Routes',

		afterEach: function() {
			$.set('test', false);
			$.set('test2', false);
		},

		uri: {
			get: function() {
				assert.isObject(Wee.routes.uri(),
					'URI was not retrieved successfully'
				);

				assert.isFalse(Wee.routes.uri().history,
					'URI was not retrieved successfully'
				);
			},

			'set string': function() {
				Wee.routes.uri('/test/page');

				assert.strictEqual(Wee.routes.uri().path, '/test/page',
					'URI string was not set successfully'
				);
			},

			'set object': function() {
				Wee.routes.uri({
				    hash: 'uri',
				    path: '/js/routes',
				    history: true,
				    query: {
				        success: 'yes'
				    }
				});

				assert.strictEqual(Wee.routes.uri().hash, 'uri',
					'URI object was not set successfully'
				);

				assert.strictEqual(Wee.routes.uri().path, '/js/routes',
					'URI object was not set successfully'
				);

				assert.isTrue(Wee.routes.uri().history,
					'URI object was not set successfully'
				);

				assert.isObject(Wee.routes.uri().query,
					'URI object was not set successfully'
				);

				assert.isObject(Wee.routes.uri(),
					'URI object was not set successfully'
				);
			}
		},

		segments: {
			'get all': function() {
				assert.include(Wee.routes.segments(), 'test',
					'No segments were returned successfully'
				);
				assert.include(Wee.routes.segments(), 'page',
					'No segments were returned successfully'
				);
				assert.isArray(Wee.routes.segments(),
					'Segments did not return an array'
				);
			},

			'get single': function() {
				assert.strictEqual(Wee.routes.segments(0), 'test',
					'Single segment not retrieved successfully'
				);
				assert.strictEqual(Wee.routes.segments(1), 'page',
					'Single segment not retrieved successfully'
				);
				assert.strictEqual(Wee.routes.segments(2), '',
					'Single segment not retrieved successfully'
				);
			}
		},

		map: {
			set: function() {
				var routes = Wee.routes.map({
				    '$any': 'common',
				    'script': {
				        'routes': function() {
							return 'test';
				        }
				    }
				});

				assert.isObject(Wee.routes.map());

				assert.strictEqual(routes.script.routes(), 'test',
					'Route function was not executed successfully'
				);
			}
		},

		run: {
			simple: function() {
				Wee.routes.map({
					'$any': function() {
						$.set('test', true);
					},
					'$root': function() {
						$.set('test2', true);
					}
				});

				Wee.routes.run({
					path: '/'
				});

				assert.isTrue($.get('test'),
					'$any was not evaulated correctly'
				);

				assert.isTrue($.get('test2'),
					'$root was not evaulated correctly'
				);
			},

			advanced: function() {
				Wee.routes.run({
					path: '/test/route',
					routes: {
						test: {
							route: function() {
								assert.ok(true, true,
									'Specific route not executed successfully.'
								);
							}
						}
					}
				});

				Wee.routes.map({
					'$root': function() {
						$.set('test', true);
					}
				}, true);

				assert.isTrue($.get('test'),
					'Routes were not initialized'
				);
			}
		},

		addFilter: function() {
			Wee.routes.addFilter('isInternal', function(seg) {
				return ['admin', 'protected'].indexOf(seg) > -1;
			});

			Wee.fn.make('testController', {
				init: function() {
					$.set('test', true);
				}
			});

			Wee.routes.map({
				'$isInternal:eval': 'testController'
			});

			Wee.routes.run({
				path: '/admin'
			});

			assert.isTrue($.get('test'),
				'Route filter was not executed correctly'
			);
		},

		once: function() {
			var i = 0;

			Wee.routes.map({
				'$any:once': function() {
					i++;
				}
			});

			Wee.routes.run({
				path: '/'
			});

			Wee.routes.run({
				path: '/'
			});

			assert.strictEqual(i, 1,
				'Route was executed twice despite being instructed to execute once'
			);
		},

		controller: function() {
			Wee.fn.make('testController', {
				init: function() {
					$.set('test', true);
				},
				test: function() {
					$.set('test2', true);
				}
			});

			Wee.routes.map({
				'$any': [
					'testController:init',
					'testController:test'
				]
			});

			Wee.routes.run();

			assert.strictEqual($.get('test'), true,
				'Init method was not executed successfully'
			);

			assert.strictEqual($.get('test2'), true,
				'Method was not executed successfully'
			);
		},
	});
});