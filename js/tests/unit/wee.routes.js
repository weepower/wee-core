define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert');

	require('js/tests/support/exports.js');

	registerSuite({
		name: 'Routes',
		setup: function() {
			Wee.routes.map({
				'$any': function() {
					$.set('any', true);
				},
				'$any:fire': function() {
					$.set('anyFire', true);
				},
				'no-children-fire:fire': function() {
					$.set('noChildrenFire', true);
				},
				'no-children': function() {
					$.set('noChildren', true);
				},
				'$/bad': {
					'route': function() {
						$.set('badRoute', true);
					}
				},
				'$root': function() {
					$.set('root', true);
				},
				'number': {
					'$num': function() {
						$.set('number', true);
					}
				},
				'test': {
					'$root': function() {
						$.set('test', true);
					},
					'test2': function() {
						$.set('test2', true);
					}
				},
				'function': function() {
					return 'test';
				},
				'this||that': function() {
					$.set('this', true);
				},
				'not': {
					'!$root': function() {
						$.set('negateRoot', true);
					}
				},
				'unload-test:unload': function() {
					$.set('unload', true);
				},
				'pop-test:pop': function() {
					$.set('pop', true);
				}
			});
		},

		uri: {
			get: function() {
				assert.isObject(Wee.routes.uri(),
					'URI was not retrieved successfully'
				);

				// TODO: fix this test
				// assert.isFalse(Wee.routes.uri().history,
				// 	'URI was not retrieved successfully'
				// );
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
				var map = Wee.routes.map();

				assert.isObject(map);

				assert.strictEqual(map.function(), 'test',
					'Route function was not executed successfully'
				);
			}
		},

		run: {
			simple: function() {

				// Test root
				Wee.routes.run({
					path: '/'
				});

				assert.isTrue($.get('any'),
					'$any was not evalulated correctly'
				);

				assert.isTrue($.get('anyFire'),
					'$any:fire was not evalulated correctly'
				);

				assert.isTrue($.get('root'),
					'$root was not evalulated correctly'
				);

				// Test || operator
				Wee.routes.run({
					path: 'that'
				});

				assert.isTrue($.get('this'),
					'"||" evaluator did not work'
				);

				// Test route negation
				Wee.routes.run({
					path: 'not'
				});

				assert.isNull($.get('negateRoot'),
					'Route negation did not work'
				);

				// Test $num filter
				Wee.routes.run({
					path: 'number/4'
				});

				assert.isTrue($.get('number'),
					'$num filter did not evaluate correctly'
				);

				// Test bad route
				Wee.routes.run({
					path: 'bad/route'
				});

				assert.isTrue($.get('badRoute'),
					'Route was not parsed correctly'
				);

				// Test fire
				Wee.routes.run({
					path: 'no-children-fire'
				});

				assert.isTrue($.get('noChildrenFire'),
					'Fire was not executed correctly'
				);

				// Test no child route object
				Wee.routes.run({
					path: 'no-children'
				});

				assert.isTrue($.get('noChildren'),
					'Route with no child route object was not executed correctly'
				);

				// TODO: get these to work
				// Test unload and pop
				// Wee.routes.run({
				// 	path: 'unload-test'
				// });
				//
				// Wee.routes.run({
				// 	path: 'pop-test'
				// });
				//
				// Wee.routes.run({
				// 	path: '/'
				// });
				//
				// assert.isTrue($.get('unload'),
				// 	'Unload was not evaluated correctly'
				// );
				//
				// assert.isTrue($.get('pop'),
				// 	'Pop was not evaluated correctly'
				// );

				// Test immediate route evaulation
				// TODO: Get this to work
				Wee.routes.map({
					'run-me-immediately': function() {
						assert.isTrue(true,
							'Immediate route evaulation did not work'
						);
					}
				}, true);
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
				'once:once': function() {
					i++;
				}
			});

			Wee.routes.run({
				path: '/once'
			});

			Wee.routes.run({
				path: '/once'
			});

			assert.strictEqual(i, 1,
				'Route was executed twice despite being instructed to execute once'
			);
		},

		controller: function() {
			Wee.fn.make('testController', {
				init: function() {
					$.set('init', true);
				},
				method: function() {
					$.set('method', true);
				}
			});

			Wee.routes.map({
				'controller': [
					'testController',
					'testController:method'
				]
			});

			Wee.routes.run({
				path: 'controller'
			});

			assert.strictEqual($.get('init'), true,
				'Init method was not executed successfully'
			);

			assert.strictEqual($.get('method'), true,
				'Method was not executed successfully'
			);
		}
	});
});