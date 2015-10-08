define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	require('script/wee.routes.js');

	registerSuite({
		name: 'Routes',

		'uri': {
			'get': function() {
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
				    path: '/script/routes',
				    history: true,
				    query: {
				        success: 'yes'
				    }
				});

				assert.strictEqual(Wee.routes.uri().hash, 'uri',
					'URI object was not set successfully'
				);
				assert.strictEqual(Wee.routes.uri().path, '/script/routes',
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
		'segments': {
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
					'Single segment retrieved successfully'
				);
				assert.strictEqual(Wee.routes.segments(1), 'page',
					'Single segment retrieved successfully'
				);
				assert.strictEqual(Wee.routes.segments(2), '',
					'single segment retrieved successfully'
				);
			}
		},
		'map': {
			'get': function() {
				assert.deepEqual(Wee.routes.map(), {},
					'Mapped routes are not set'
				);

				assert.deepEqual(Wee.routes.map({
					$root: fn
				}), {
					$root: fn
				}, 'The route was correctly mapped.');

			},
			'set': function() {
				Wee.routes.map({
				    '$any': 'common',
				    'script': {
				        'routes': function() {

				        }
				    }
				});

				assert.isObject(Wee.routes.map());
			}
		},
		'run': {
			'simple': function() {
				Wee.routes.map({
					'$any': function() {
						return 'any';
					}
				});

				assert.strictEqual(Wee.routes.run(), undefined,
					'Any route executed successfully.'
				);
			},
			'advanced': function() {
				Wee.routes.run({
					path: '/test/route',
					routes: {
						'test': {
							'route': function() {
								assert.ok(true, true,
									'Specific route executed successfully.'
								);
							}
						}
					}
				});
			}
		}
	});
});