define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert');

	require('temp/core.min.js');

	registerSuite({
		name: 'Core',

		beforeEach: function() {
			var container = document.createElement('div');

			container.id = 'container';
			container.className = 'js-container';

			document.body.appendChild(container);
		},

		afterEach: function() {
			Wee.$remove('#container');
		},

		'fn.make': {
			'public': {
				'make': function() {
					Wee.fn.make('controller', {
						test: function() {
							return 'response';
						}
					});

					assert.equal(Wee.controller.test(), 'response',
						'Controller function response correctly returned.'
					);
				},
				'$get': function() {
					assert.isObject(Wee.controller.$get(),
						'$get did not return an object'
					);

					assert.isNull(Wee.controller.$get('var 123'),
						'Variable "var 123" is not currently null'
					);

					assert.isNull(Wee.controller.$get('var-123'),
						'Variable "var-123" is not currently null'
					);

					assert.strictEqual(Wee.controller.$get('var-123', 'string'), 'string',
						'Variable "var-123" is not returned as the default "string"'
					);

					assert.isNull(Wee.controller.$get('var-123'),
						'Variable "var-123" is still not correctly set to null'
					);

					assert.strictEqual(Wee.controller.$get('cont.var-123', 'string'), 'string',
						'Variable "var-123" is not returned as the default "string" in the "cont" namespace'
					);

					assert.strictEqual(Wee.controller.$get('123 var', 'Testing 123'), 'Testing 123',
						'Variable "123 var" is not returned as the default "Testing 123"'
					);

					assert.strictEqual(Wee.controller.$get('var-123', function() {
							return 'string';
						}), 'string',
						'Variable "var-123" is not returned as the default "string"'
					);
				},
				'$set': function() {
					assert.isFunction(Wee.controller.$set,
						'$set did not return a function'
					);

					Wee.controller.$set('var-123', 'string');

					assert.strictEqual(Wee.controller.$set('var-123', 'string'), 'string',
						'Variable "var-123" was not set to "string"'
					);

					assert.strictEqual(Wee.controller.$set('cont:var-123', 'string'), 'string',
						'Variable "var-123" was not set to "string" in the "cont" namespace'
					);

					assert.strictEqual(Wee.controller.$set('123 var', 'Testing 123'), 'Testing 123',
						'Variable "var-123" was not set to "Testing 123"'
					);

					assert.strictEqual(Wee.controller.$get('var-123'), 'string',
						'Variable "var-123" is not correctly set to "string"'
					);

					assert.strictEqual(Wee.controller.$get('cont:var-123'), 'string',
						'Variable "var-123" is not correctly set to "string" in the "cont" namespace'
					);

					assert.strictEqual(Wee.controller.$get('123 var'), 'Testing 123',
						'Variable "123 var" is not correctly set to "Testing 123"'
					);

				},
				'$push': function() {
					Wee.controller.$push('test', 'test-1');

					assert.isFunction(Wee.controller.$push,
						'$push did not return as a function'
					);

					assert.isArray(Wee.controller.$get('test'),
						'$push did not push'
					);

					assert.equal(Wee.controller.$get('test'), 'test-1');
				},
				'$drop': function() {
					Wee.controller.$set('test', 'test-2');

					assert.strictEqual(Wee.controller.$get('test'), 'test-2',
						'Variable test-2 was not properly set'
					);

					Wee.controller.$drop('test');

					assert.strictEqual(Wee.controller.$get('test'), null,
						'Variable test-2 was not properly dropped'
					);
				},
				'$destroy': function() {
					Wee.controller.$destroy();

					assert.isUndefined(Wee.controller,
						'Controller was not successfully destroyed'
					);
				}
			},
			'private': {
				'make': function() {
					Wee.fn.make('controller', {
						test: function() {
							return this.key;
						}
					}, {
						privateFunction: function() {
							this.$public.key = 'success';

							return this.$public.test();
						}
					});

					assert.isFunction(Wee.controller.$private.privateFunction,
						'Controller did not return a function'
					);

					assert.equal(Wee.controller.$private.privateFunction(), 'success',
						'Controller function response incorrectly returned.'
					);
				},
				'$get': function() {
					assert.isObject(Wee.controller.$private.$get(),
						'$get did not return an object'
					);

					assert.isNull(Wee.controller.$private.$get('var 123'),
						'Variable "var 123" is not currently null'
					);

					assert.isNull(Wee.controller.$private.$get('var-123'),
						'Variable "var-123" is not currently null'
					);

					assert.strictEqual(Wee.controller.$private.$get('var-123', 'string'), 'string',
						'Variable "var-123" is not returned as the default "string"'
					);

					assert.isNull(Wee.controller.$private.$get('var-123'),
						'Variable "var-123" is still not correctly set to null'
					);

					assert.strictEqual(Wee.controller.$private.$get('cont:var-123', 'string'), 'string',
						'Variable "var-123" is not returned as the default "string" in the "cont" namespace'
					);

					assert.strictEqual(Wee.controller.$private.$get('123 var', 'Testing 123'), 'Testing 123',
						'Variable "123 var" is not returned as the default "Testing 123"'
					);

					assert.strictEqual(Wee.controller.$private.$get('var-123', function() {
							return 'string';
						}), 'string',
						'Variable "var-123" is not returned as the default "string"'
					);
				},
				'$set': function() {
					assert.isFunction(Wee.controller.$private.$set,
						'$set did not return a function'
					);

					Wee.controller.$private.$set('var-123', 'string');

					assert.strictEqual(Wee.controller.$private.$set('var-123', 'string'), 'string',
						'Variable "var-123" was not set to "string"'
					);

					assert.strictEqual(Wee.controller.$private.$set('cont:var-123', 'string'), 'string',
						'Variable "var-123" was not set to "string" in the "cont" namespace'
					);

					assert.strictEqual(Wee.controller.$private.$set('123 var', 'Testing 123'), 'Testing 123',
						'Variable "var-123" was not set to "Testing 123"'
					);

					assert.strictEqual(Wee.controller.$private.$get('var-123'), 'string',
						'Variable "var-123" is not correctly set to "string"'
					);

					assert.strictEqual(Wee.controller.$private.$get('cont:var-123'), 'string',
						'Variable "var-123" is not correctly set to "string" in the "cont" namespace'
					);

					assert.strictEqual(Wee.controller.$private.$get('123 var'), 'Testing 123',
						'Variable "123 var" is not correctly set to "Testing 123"'
					);
				},
				'$push': function() {
					Wee.controller.$private.$push('test', 'test-1');

					assert.isFunction(Wee.controller.$private.$push,
						'$push did not return as a function'
					);

					assert.isArray(Wee.controller.$private.$get('test'),
						'$push did not push'
					);

					assert.equal(Wee.controller.$private.$get('test'), 'test-1');
				}
			}
		},
		'fn.extend': {
			'controller': function() {
				Wee.fn.extend('controller', {
					test2: function() {
						return 'response';
					}
				});

				assert.strictEqual(Wee.controller.test2(), 'response',
					'Controller was not extended successfully.'
				);
			},
			'core': function() {
				Wee.fn.extend({
				    addNumbers: function(num1, num2) {
				        return num1 + num2;
				    }
				});

				assert.strictEqual(Wee.addNumbers(2, 4), 6,
					'Core was not extended successfully'
				);
			}
		},
		'$': function() {
			Wee.$html('#container',
				'<div id="testing"></div>' +
				'<div class="testing"></div>'
			);

			assert.strictEqual(Wee.$('#testing').length, 1,
				'Element with ID "testing" was selected successfully.'
			);

			assert.strictEqual(Wee.$('.testing').length, 1,
				'Element with class "testing" was selected successfully.'
			);
		},
		'$parseHTML': function() {
			var el = Wee.$parseHTML(
				'<ul><li class="child">1</li><li class="child">2</li></ul>'
			);

			assert.strictEqual(el.querySelectorAll('.child').length, 2,
				'HTML was not parsed successfully'
			);
		},
		'$set': function() {
			assert.strictEqual(Wee.$set('var-123', 'string'), 'string',
				'Variable "var-123" was set to "string".'
			);

			assert.strictEqual(Wee.$set('cont:var-123', 'string'), 'string',
				'Variable "var-123" was set to "string" in the "cont" namespace.'
			);

			assert.strictEqual(Wee.$set('123 var', 'Testing 123'), 'Testing 123',
				'Variable "var-123" was set to "Testing 123".'
			);

			assert.strictEqual(Wee.$get('var-123'), 'string',
				'Variable "var-123" is correctly set to "string".'
			);

			assert.strictEqual(Wee.$get('cont:var-123'), 'string',
				'Variable "var-123" is correctly set to "string" in the "cont" namespace.'
			);

			assert.strictEqual(Wee.$get('123 var'), 'Testing 123',
				'Variable "123 var" is correctly set to "Testing 123".'
			);

			assert.strictEqual(Wee.$get('set-var-123', 'string', true), 'string',
				'Variable "set-var-123" is set to the default "string".'
			);

			assert.strictEqual(Wee.$get('set-var-123'), 'string',
				'Variable "set-var-123" is correctly set to "string".'
			);
		},
		'$get': function() {
			assert.strictEqual(Wee.$get('var-234'), null,
				'Variable "var-234" is currently null.'
			);

			assert.strictEqual(Wee.$get('234 var'), null,
				'Variable "234 var" is currently null.'
			);

			assert.strictEqual(Wee.$get('var-234', 'string'), 'string',
				'Variable "var-234" is returned as the default "string".'
			);

			assert.strictEqual(Wee.$get('var-234'), null,
				'Variable "var-234" is still correctly set to null.'
			);

			assert.strictEqual(Wee.$get('var-234', function() {
					return 'string';
				}), 'string',
				'Variable "var-234" is returned as the default "string".'
			);
		},
		'$observe': function() {
			// TODO: Complete
			assert.isTrue(true);
		},
		'$unobserve': function() {
			// TODO: Complete
			assert.isTrue(true);
		},
		'$each': {
			'simple': function() {
				Wee.$html('#container',
					'<div class="testing">1</div>' +
					'<div class="testing">2</div>' +
					'<div class="testing">3</div>'
				);

				var total = 0;

				Wee.$each('.testing', function(el) {
					total += parseInt(Wee.$text(el), 10);
				});

				assert.strictEqual(total, 6,
					'Elements were not successfully iterated'
				);
			},
			'advanced': function() {
				Wee.$html('#container',
					'<div class="testing">1</div>' +
					'<div class="testing">2</div>' +
					'<div class="testing">3</div>'
				);

				var total = 0;

				Wee.$each('.testing', function(el) {
					total += parseInt(Wee.$text(el));
				}, {
					reverse: true,
					scope: this
				});

				assert.strictEqual(total, 6,
					'Elements were not successfully iterated'
				);
			}
		},
		'$env': {
			'get': function() {
				assert.strictEqual(Wee.$env(), 'local',
					'Environment was not detected successfully'
				);
			},
			'set': function() {
				assert.strictEqual(Wee.$env(), 'local',
					'Default environment is not correctly set to "local"'
				);

				Wee.$env({
					prod: 'www.weepower.com',
					stage: 'www.weepower.stage'
				}, 'here');

				assert.strictEqual(Wee.$env(), 'here',
					'Default environment is not correctly set to "here"'
				);

			}
		},
		'$envSecure': function() {
			assert.ok(Wee.$envSecure(),
				'The environment was not correctly identified as secure'
			);
		},
		'$exec': function() {
			Wee.fn.make('execTest', {
				withParams: function(val) {
					return val;
				},
				withoutParams: function() {
					return 'value';
				}
			});

			assert.strictEqual(Wee.$exec(function() {
					return 'value';
				}), 'value',
				'Simple callback was executed correctly.'
			);

			assert.strictEqual(Wee.$exec(function(val) {
					return val;
				}, {
					args: ['value']
				}), 'value',
				'Simple callback with argument was executed correctly.'
			);

			assert.strictEqual(Wee.$exec('execTest:withoutParams'), 'value',
				'Module callback was executed correctly.'
			);

			assert.strictEqual(Wee.$exec('execTest:withoutParams', {
					args: ['value']
				}), 'value',
				'Module callback with argument was executed correctly.'
			);
		},
		'$extend': function() {
			var obj = {
					key: 'value'
				},
				src = {
					key2: 'value2'
				},
				result = {
					key: 'value',
					key2: 'value2'
				};

			assert.deepEqual(Wee.$extend(obj, src), result,
				'Objects merged at top level.'
			);

			var obj1 = {
					key: {
						subKey: 'value'
					}
				},
				src1 = {
					key: {
						subKey2: 'value2'
					},
					key2: 'value2'
				},
				result1 = {
					key: {
						subKey: 'value',
						subKey2: 'value2'
					},
					key2: 'value2'
				};

			assert.deepEqual(Wee.$extend(true, obj1, src1), result1,
				'Objects merged recursively.'
			);
		},
		'$isArray': function() {
			assert.notOk(Wee.$isArray('string'),
				'Variable "string" is not an array.'
			);

			assert.notOk(Wee.$isArray(function test() {
				}),
				'Function "test()" is not an array.');

			assert.notOk(Wee.$isArray({
					string: 'string'
				}),
				'Object "string" is not an array.'
			);

			assert.ok(Wee.$isArray(['string']),
				'Array "[\'string\']" is an array.'
			);
		},
		'$inArray': function() {
			assert.strictEqual(Wee.$isArray(['string']), true,
				'Array "[\'string\']" is an array.'
			);
		},
		'$isFunction': function() {
			assert.notOk(Wee.$isFunction('string'),
				'Variable "string" is not a function.'
			);

			assert.notOk(Wee.$isFunction({
					string: 'string'
				}),
				'Object "string" is not a function.'
			);

			assert.notOk(Wee.$isFunction(['string']),
				'Array "[\'string\']" is not a function.'
			);

			assert.ok(Wee.$isFunction(function test() {}),
				'Function "test()" is a function.'
			);
		},
		'$isObject': function() {
			assert.notOk(Wee.$isObject('string'),
				'Variable "string" is not an object.'
			);

			assert.notOk(Wee.$isObject(function test() {}),
				'Function "test()" is not an object.'
			);

			assert.notOk(Wee.$isObject(['string']),
				'Array "[\'string\']" is not an object.'
			);

			assert.ok(Wee.$isObject({
					string: 'string'
				}),
				'Object "string" is an object.'
			);
		},
		'$isString': function() {
			assert.notOk(Wee.$isString(function test() {
				}),
				'Function "test()" is not a string.'
			);

			assert.notOk(Wee.$isString({
					string: 'string'
				}),
				'Object "string" is not a string.'
			);

			assert.notOk(Wee.$isString(['string']),
				'Array "[\'string\']" is not a string.'
			);

			assert.ok(Wee.$isString('string'),
				'Variable "string" is a string.'
			);
		},
		'$map': function() {
			Wee.$html('#container',
				'<div class="testing">1</div>' +
				'<div class="testing">2</div>' +
				'<div class="testing">3</div>'
			);

			var values = Wee.$map('.testing', function(el) {
				return parseInt(Wee.$html(el), 10);
			});

			assert.deepEqual(values, [1, 2, 3],
				'Elements successfully iterated.'
			);
		},
		'$serialize': function() {
			assert.strictEqual(Wee.$serialize({
					key1: 'val1',
					key2: 'val2',
					key3: 'val3'
				}), 'key1=val1&key2=val2&key3=val3',
				'Object serialization properly returned.'
			);
		},
		'$setRef': function() {
			Wee.$html('#container', '<div data-ref="testElement">1</div>');

			Wee.$setRef();

			assert.strictEqual(Wee.$text('ref:testElement'), '1',
				'Reference element was successfully selected.'
			);
		},
		'$setVar': function() {
			Wee.$html('#container',
				'<div data-set="test-var" data-value="Test Value"></div>' +
				'<div data-set="test:test-var" data-value="Test Value"></div>' +
				'<div data-set="test-arr[]" data-value="One"></div>' +
				'<div data-set="test-arr[]" data-value="Two"></div>' +
				'<div data-set="test-arr[]" data-value="Three"></div>'
			);

			Wee.$setVar();

			assert.strictEqual(Wee.$get('test-var'), 'Test Value',
				'Meta variable "test-var" was set correctly.'
			);

			assert.strictEqual(Wee.$get('test:test-var'), 'Test Value',
				'Namespaced meta variable "test:test-var" was set correctly.'
			);

			assert.deepEqual(Wee.$get('test-arr'), ['One', 'Two', 'Three'],
				'Meta array "test-arr" was set correctly.'
			);
		},
		'$toArray': function() {
			assert.deepEqual(Wee.$toArray('string'), ['string'],
				'String "string" is now ["string"].'
			);

			assert.deepEqual(Wee.$toArray(['string']), ['string'],
				'Array ["string"] is still ["string"].'
			);
		},
		'$type': function() {
			var obj = {},
				arr = [],
				fun = function() {},
				bool = true,
				num = 15,
				string = 'string',
				und = undefined,
				nul = null;

			assert.strictEqual(Wee.$type(obj), 'object',
				'Type of "object" was not successfully identified'
			);

			assert.strictEqual(Wee.$type(arr), 'array',
				'Type of "array" was not successfully identified'
			);

			assert.strictEqual(Wee.$type(fun), 'function',
				'Type of "function" was not successfully identified'
			);

			assert.strictEqual(Wee.$type(bool), 'boolean',
				'Type of "boolean" was not successfully identified'
			);

			assert.strictEqual(Wee.$type(num), 'number',
				'Type of "number" was not successfully identified'
			);

			assert.strictEqual(Wee.$type(string), 'string',
				'Type of "string" was not successfully identified'
			);

			assert.strictEqual(Wee.$type(und), 'undefined',
				'Type of "undefined" was not successfully identified'
			);

			assert.strictEqual(Wee.$type(nul), 'null',
				'Type of "null" was not successfully identified'
			);
		},
		'$unique': function() {
			var arr = [1, 2, 3, 3, 4, 4, 5];

			assert.deepEqual(Wee.$unique(arr), [1, 2, 3, 4, 5],
				'Only unique elements were correctly returned.'
			);
		},
		'_canExec': function() {
			var fun = function() {};

			assert.isTrue(Wee._canExec(fun),
				'Method did not identify executable function successfully'
			);
		},
		'_castString': function() {
			var num = '5';

			assert.strictEqual(Wee._castString(num), 5,
				'String was not converted to number'
			);
		},
		'_selArray': function() {
			var arr = [1, 2, 3, 4];

			assert.isArray(arr);
		}
	});
});