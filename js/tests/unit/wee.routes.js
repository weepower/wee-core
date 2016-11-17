define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert');

	require('js/tests/support/exports.js');

	registerSuite({
		name: 'Routes',

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

		run: {
			simple: function() {
				// TODO: Complete
				Wee.routes.map({
					'$any': function() {
						return 'any';
					}
				});

				assert.strictEqual(Wee.routes.run(), undefined,
					'Any route executed successfully.'
				);
			},

			advanced: function() {
				// TODO: Complete
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
		}
	});
});