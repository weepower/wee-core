define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert');

	require('temp/core.min.js');

	registerSuite({
		name: 'Assets',

		// TODO: File path is relative to wee-core. Need solution that
		// TODO: uses conditional path that works with Browsersync as well.
		root: {
			set: function() {
				Wee.assets.root(
					'/js/tests/sample-files/'
				);

				assert.strictEqual(Wee.assets.root(),
					'/js/tests/sample-files/',
					'Asset root not set successfully'
				);
			},

			get: function() {
				assert.strictEqual(Wee.assets.root(),
					'/js/tests/sample-files/',
					'Asset root not retrieved successfully'
				);
			}
		},

		load: {
			'single file': function() {
				var promise = this.async(1000);

				Wee.assets.load({
					root: '/js/tests/sample-files/',
					files: 'sample.js',
					success: promise.callback(function() {
						assert.isTrue(Wee.$get('sampleJsLoaded'),
							'Sample file not loaded successfully'
						);

						Wee.assets.remove('/js/' +
							'tests/sample-files/sample.js'
						);
					})
				});
			},

			'multiple files': function() {
				var promise = this.async(1000);

				Wee.assets.load({
					root: '/js/tests/sample-files/',
					files: [
						'sample.js',
						'sample-2.js'
					],
					success: promise.callback(function() {
						assert.isTrue(Wee.$get('sampleJsLoaded'),
							'Multiple files not loaded successfully'
						);

						assert.isTrue(Wee.$get('sampleJsLoadedAgain'),
							'Multiple files not loaded successfully'
						);

						Wee.assets.remove([
							'/js/' +
							'tests/sample-files/sample.js',
							'/js/' +
							'tests/sample-files/sample-2.js'
						]);
					})
				});
			},

			group: function() {
				var promise = this.async(1000);

				Wee.assets.load({
					root: '/js/tests/sample-files/',
					files: 'sample.js',
					group: 'assetsGroup',
					success: promise.callback(function() {
						assert.ok(Wee.assets.ready('assetsGroup'),
							'Asset group not created successfully'
						);

						Wee.assets.remove(
							'/js/tests/' +
							'sample-files/sample.js'
						);

					})
				});
			}
		},

		ready: {
			'check': function() {
				var promise = this.async(1000);

				Wee.assets.load({
					root: '/js/tests/sample-files/',
					files: 'sample.js',
					success: promise.callback(function() {
						assert.isTrue(Wee.$get('sampleJsLoaded'),
							'Asset was not set successfully'
						);

						Wee.assets.remove(
							'/js/' +
							'tests/sample-files/sample.js'
						);
					})
				});
			},

			'check and set': function() {
				var promise = this.async(1000);

				Wee.assets.load({
					root: '/js/tests/sample-files/',
					files: 'sample.js',
					group: 'assetsGroup',
					success: promise.callback(function() {
						Wee.assets.ready('assetsGroup', {
							success: promise.callback(function() {
								assert.ok(Wee.assets.ready('assetsGroup'),
									'Asset group was not created successfully'
								);

								Wee.assets.remove(
									'/js/' +
									'tests/sample-files/sample.js'
								);
							})
						});
					})
				});
			}
		}
	});
});