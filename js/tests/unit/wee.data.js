define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert');

	require('js/tests/support/exports.js');

	registerSuite({
		name: 'Data',
		request: {
			afterEach: function() {
				Wee.$set('done', false);
			},

			get: {
				standard: function() {
					var promise = this.async(1000);

					Wee.data.request({
						url: '/js/tests/support/sample-files/sample.json',
						json: true,
						success: promise.callback(function(data) {
							assert.strictEqual(data.person.firstName, 'Don',
								'Sample file was not loaded successfully'
							);

							Wee.$set('done', true);
						}),
						complete: promise.callback(function() {
							assert.isTrue(Wee.$get('done'),
								'Complete callback was not executed correctly'
							);
						})
					});

					Wee.data.request({
						url: 'js/tests/support/sample-files/sample.json',
						json: true,
						cache: false,
						send: promise.callback(function() {
							// TODO: Find a better way to test this
							// TODO: Use state variable to verify all lifecycle methods
							assert.isTrue(true);
						}),
						responseType: 'text',
						success: promise.callback(function(data) {
							assert.strictEqual(data.person.firstName, 'Don',
								'Sample file was not loaded successfully'
							);
						})
					});
				},
				'with data': function() {
					var promise = this.async(1000);

					Wee.data.request({
						url: 'https://httpbin.org/get',
						json: true,
						data: {
							test: 'test'
						},
						success: promise.callback(function(data) {
							assert.strictEqual(data.args.test, 'test',
								'Data posted successfully'
							);

							Wee.$set('done', true);
						}),
						complete: function() {
							assert.isTrue(Wee.$get('done'),
								'Complete callback called on error'
							);
						}
					});
				},
				'query string': function() {
					var promise = this.async(1000);

					Wee.data.request({
						url: 'https://httpbin.org/get?test=test',
						json: true,
						success: promise.callback(function(data) {
							assert.strictEqual(data.args.test, 'test',
								'Data posted unsuccessfully'
							);
						})
					});
				},
				jsonp: {
					jsonpCallback: function() {
						var promise = this.async(1000);

						Wee.data.request({
							url: 'http://echo.jsontest.com/key/value',
							method: 'get',
							jsonp: true,
							jsonpCallback: 'cb',
							success: promise.callback(function(data) {
								assert.strictEqual(data.key, 'value',
									'JSONP was not executed correctly'
								);
							})
						});
					},
					default: function() {
						var promise = this.async(1000);

						Wee.data.request({
							url: 'http://echo.jsontest.com/key/value',
							method: 'get',
							jsonp: true,
							success: promise.callback(function(data) {
								// TODO: test this better - ask nathan to gander at it
								assert.strictEqual(data.key, 'value',
									'JSONP was not executed correctly'
								);
							})
						});
					},
					error: function() {
						var promise = this.async(1000);

						Wee.data.request({
							url: 'http://echo.jsontest2.com/key/value',
							method: 'get',
							jsonp: true,
							error: promise.callback(function() {
								assert.isTrue(true,
									'Did not result in an error'
								);
							})
						});
					}
				}
			},
			post: {
				simple: function() {
					var promise = this.async(1000);

					Wee.data.request({
						root: 'https://httpbin.org/',
						url: 'post',
						method: 'post',
						json: true,
						data: {
							test: 'test'
						},
						success: promise.callback(function(data) {
							var response = JSON.parse(data.data);

							assert.strictEqual(response.test, 'test',
								'Data posted successfully'
							);
						})
					});
				},
				type: {
					form: function() {
						var promise = this.async(1000);

						Wee.data.request({
							url: 'https://httpbin.org/post',
							method: 'post',
							json: true,
							type: 'form',
							data: {
								test: 'test'
							},
							success: promise.callback(function(data) {
								assert.strictEqual(data.form.test, 'test',
									'Data posted successfully'
								);

								assert.strictEqual(data.headers['Content-Type'],
									'application/x-www-form-urlencoded; charset=UTF-8',
									'Incorrect headers sent'
								);
							})
						});
					},
					html: function() {
						var promise = this.async(1000);

						Wee.data.request({
							url: 'https://httpbin.org/post',
							method: 'post',
							json: true,
							type: 'xml',
							success: promise.callback(function(data) {
								assert.strictEqual(data.headers['Content-Type'],
									'text/xml; charset=UTF-8',
									'Incorrect headers sent'
								);
							})
						});
					},
					json: function() {
						var promise = this.async(1000);

						Wee.data.request({
							url: 'https://httpbin.org/post',
							method: 'post',
							json: true,
							type: 'json',
							success: promise.callback(function(data) {
								assert.equal(data.data, '{}',
									'Data posted successfully'
								);

								assert.strictEqual(data.headers['Content-Type'],
									'application/json; charset=UTF-8',
									'Incorrect headers sent'
								);
							})
						});
					},
					xml: function() {
						var promise = this.async(1000);

						Wee.data.request({
							url: 'https://httpbin.org/post',
							method: 'post',
							json: true,
							type: 'xml',
							success: promise.callback(function(data) {
								assert.strictEqual(data.headers['Content-Type'],
									'text/xml; charset=UTF-8',
									'Incorrect headers sent'
								);
							})
						});
					}
				},
				error: {
					// TODO: Find out why this is timing out
					'not found': function() {
						var promise = this.async(1000);

						Wee.data.request({
							url: 'asdfasdf.com',
							method: 'get',
							json: true,
							success: promise.callback(function() {
								assert.isTrue(true,
									'Success on 404'
								);
							}),
							error: promise.callback(function(data) {
								assert.strictEqual(data.status, 404,
									'404 status not processed correctly'
								);
							})
						});
					},

					'invalid json': function() {
						var promise = this.async(1000);

						Wee.data.request({
							url: '/js/tests/support/sample-files/invalid-json.json',
							json: true,
							success: promise.callback(function(data) {
								assert.isObject(data, {},
									'Invalid JSON parsed'
								);

								assert.equal(Object.keys(data).length, 0,
									'Invalid JSON parsed'
								);
							})
						});
					}
				}
			}
		}
	});
});