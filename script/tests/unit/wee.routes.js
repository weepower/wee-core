define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	require('script/wee.routes.js');

	registerSuite({
		'routes.uri': function() {
			var uriData = {
				path: '/test/route',
				history: false,
				query: {
					key: 'val'
				},
				hash: 'test'
			};

			assert.strictEqual(Wee.routes.uri().path, '/__intern/client.html',
				'Default URI path is set correctly.'
			);

			assert.strictEqual(Wee.routes.uri().hash, '',
				'Default URI hash is set correctly.'
			);

			assert.deepEqual(Wee.routes.uri(uriData), uriData,
				'URI data set correctly.'
			);

			assert.deepEqual(Wee.routes.uri(), uriData,
				'URI data is still set correctly.'
			);
		},
		'routes.path': function() {
			assert.strictEqual(Wee.routes.path('/segment/value'), '/segment/value',
				'Path was set to "/segment/value" correctly.'
			);

			assert.strictEqual(Wee.routes.path(), '/segment/value',
				'Path is still set to "/segment/value" correctly.'
			);
		},
		'routes.segments': function() {
			assert.deepEqual(Wee.routes.segments(), ['segment', 'value'],
				'Segment array is set correctly.'
			);
		},
		'routes.map': function() {
			var fn = function() {
				// ...
			};

			assert.deepEqual(Wee.routes.map(), {},
				'There are currently no mapped routes.'
			);

			assert.deepEqual(Wee.routes.map({
				$root: fn
			}), {
				$root: fn
			}, 'The route was correctly mapped.');
		},
		'routes.run': function() {
			Wee.routes.map({
				'$any': function() {
					return 'any';
				}
			});

			assert.strictEqual(Wee.routes.run(), undefined,
				'Any route executed successfully.'
			);

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
	});
});