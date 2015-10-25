define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	require('script/wee.assets.js');

	registerSuite({
		name: 'Assets',

		root: {
			set: function() {
				Wee.assets.root(
					'/$root/node_modules/wee-core/script/tests/sample-files/'
				);

				assert.strictEqual(Wee.assets.root(),
					'/$root/node_modules/wee-core/script/tests/sample-files/',
					'Asset root set successfully.'
				);
			},

			get: function() {
				assert.strictEqual(Wee.assets.root(),
					'/$root/node_modules/wee-core/script/tests/sample-files/',
					'Asset root retreived successfully.'
				);
			}
		},

		load: {
			'single file': function() {
				var promise = this.async(1000);

				Wee.assets.load({
					root: '/$root/node_modules/wee-core/script/tests/sample-files/',
					files: 'sample.js',
					success: promise.callback(function() {
						assert.isTrue(Wee.$get('sampleJsLoaded'),
							'Sample file was not loaded successfully'
						);

						Wee.assets.remove('/$root/node_modules/wee-core/script/' +
							'tests/sample-files/sample.js'
						);
					})
				});
			},

			'multiple files': function() {
				var promise = this.async(1000);

				Wee.assets.load({
					root: '/$root/node_modules/wee-core/script/tests/sample-files/',
					files: [
						'sample.js',
						'sample-2.js'
					],
					success: promise.callback(function() {
						assert.isTrue(Wee.$get('sampleJsLoaded'),
							'Multiple files were not loaded successfully'
						);

						assert.isTrue(Wee.$get('sampleJsLoadedAgain'),
							'Multiple files were not loaded successfully'
						);

						Wee.assets.remove([
							'/$root/node_modules/wee-core/script/' +
							'tests/sample-files/sample.js',
							'/$root/node_modules/wee-core/script/' +
							'tests/sample-files/sample-2.js'
						]);
					})
				});
			},

			group: function() {
				var promise = this.async(1000);

				Wee.assets.load({
					root: '/$root/node_modules/wee-core/script/tests/sample-files/',
					files: 'sample.js',
					group: 'assetsGroup',
					success: promise.callback(function() {
						assert.ok(Wee.assets.ready('assetsGroup'),
							'Asset group was created successfully'
						);

						Wee.assets.remove(
							'/$root/node_modules/wee-core/script/tests/' +
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
					root: '/$root/node_modules/wee-core/script/tests/sample-files/',
					files: 'sample.js',
					success: promise.callback(function() {
						assert.isTrue(Wee.$get('sampleJsLoaded'),
							'Asset was set successfully'
						);

						Wee.assets.remove(
							'/$root/node_modules/wee-core/script/' +
							'tests/sample-files/sample.js'
						);
					})
				});
			},

			'check and set': function() {
				var promise = this.async(1000);

				Wee.assets.load({
					root: '/$root/node_modules/wee-core/script/tests/sample-files/',
					files: 'sample.js',
					group: 'assetsGroup',
					success: promise.callback(function() {
						Wee.assets.ready('assetsGroup', {
							success: promise.callback(function() {
								assert.ok(Wee.assets.ready('assetsGroup'),
									'Asset group was created successfully'
								);

								Wee.assets.remove(
									'/$root/node_modules/wee-core/script/' +
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