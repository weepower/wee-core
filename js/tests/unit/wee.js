define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert');

	require('js/tests/support/exports.js');

	registerSuite({
		name: 'Core',

		beforeEach: function() {
			var container = document.createElement('div');

			container.id = 'container';
			container.className = 'js-container';
			// TODO Need to use data refs instead of js- classes

			document.body.appendChild(container);
		},

		afterEach: function() {
			Wee.$remove('#container');
		},

		'fn.make': {
			'public': {
				'make': {
					'instantiate': function() {
						Wee.fn.make('controller', {
							test: function() {
								return 'response';
							}
						});

						assert.equal(Wee.controller.test(), 'response',
							'Controller function response correctly returned.'
						);
					},
					'do not instantiate': function() {
						Wee.fn.make('noInstance', {}, {}, {
							instance: false
						});

						assert.isUndefined(Wee.noInstance);
					},
					'pass in constructor arguments': function() {
						Wee.fn.make('controller', {
							_construct: function(options) {
								this.newVal = options.newVal;
							}
						}, null, {
							args: {
								newVal: 'hello'
							}
						});

						assert.equal(Wee.controller.newVal, 'hello',
							'Controller properly passed args to constructor on make'
						);
					},
					'create multiple controller instances/inspect constructors': function() {
						var second;

						Wee.fn.make('controller', {
							_construct: function(options) {
								this.pubProp = options.newVal;
							}
						}, null, {		
							args: {
								newVal: 'suh duh'
							}
						});

						second = Wee.fn.controller({
							newVal: 'hello'
						});

						assert.equal(Wee.controller.pubProp, 'suh duh',
							'First controller instance did not fire constructor'
						);
						assert.equal(second.pubProp, 'hello',
							'Second controller instance did not fire constructor'
						);
					},
					'extend controller': function() {
						Wee.fn.make('parent', {
							name: 'parent',
							color: 'blue'
						});

						Wee.fn.make('child:parent', {
							name: 'child'
						});

						assert.equal(Wee.child.name, 'child',
							'Child controller inherited parent property'
						);
						assert.equal(Wee.child.color, 'blue',
							'Child controller inherited parent property'
						);
					}
				},
				'$concat': {
					'create array': function() {
						Wee.$concat('concatTest', 1);

						assert.isArray(Wee.$get('concatTest'),
							'$get did not return an array'
						);
					},
					'concat arrays': function() {
						Wee.$concat('concatTest', [2, 3]);

						assert.deepEqual(Wee.$get('concatTest'), [1, 2, 3],
							'Array was not concatenated correctly.'
						);
					},
					'concat array with prepended values': function() {
						Wee.$concat('concatTest', [4, 5, 6], true);

						assert.deepEqual(Wee.$get('concatTest'), [4, 5, 6, 1, 2, 3], 
							'Array was not concatenated correctly.'
						);
					}
				},
				'$copy': {
					'copy object': function() {
						assert.isObject(Wee.$copy({}), 
							'No existence of an object'
						);
					},
					'copy array': function() {
						assert.isArray(Wee.$copy([]), 
							'No existence of an array'
						);
					}
				},
				'$diff': {
					'return object': function() {
						Wee.$diff({
							key1: 'blue',
							key2: true,
							key3: {
								id: 1
							}
						}, {
							key1: 'blue',
							key3: {
								id: 2
							},
							key4: 'new'
						});

						assert.isObject(Wee.$diff(), 
							'Did not return an object as expected'
						);
					},
					'get difference in objects': function() {
						assert.deepEqual(
							Wee.$diff({
								key1: 'blue',
								key2: true,
								key3: {
									id: 1
								}
							}, {
								key1: 'blue',
								key3: {
									id: 2
								},
								key4: 'new'
							}), 
							{
								key1: {
									after: "blue",
									before: "blue",
									type: "-"
								},
								key2: {
									after: undefined,
									before: true,
									type: "d"
								},
								key3: {
									id: {
										after: 2,
										before: 1,
										type: "u"
									}
								},
								key4: {
									after: "new",
									before: undefined,
									type: "c"
								}
							},
							'Object did not return as expected'
						);
					}
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
				'$concat': {
					'create array': function() {
						Wee.controller.$concat('concatCtrlTest', 1);

						assert.isArray(Wee.controller.$get('concatCtrlTest'),
							'$get did not return an array'
						);
					},
					'concat arrays': function() {
						Wee.controller.$concat('concatCtrlTest', [2, 3]);

						assert.deepEqual(Wee.controller.$get('concatCtrlTest'), [1, 2, 3],
							'Array was not concatenated correctly.'
						);
					},
					'concat array with prepended values': function() {
						Wee.controller.$concat('concatCtrlTest', [4, 5, 6], true);

						assert.deepEqual(Wee.controller.$get('concatCtrlTest'), [4, 5, 6, 1, 2, 3], 
							'Array was not concatenated correctly.'
						);
					}
				},
				'$has': function() {
					Wee.controller.$set('hasContrTest', 'value1');

					assert.strictEqual(Wee.controller.$has('hasContrTest.0'), true,
						'No value set for "hasContrTest"'
					);
				},
				'$merge': function() {
					Wee.controller.$set('obj', {
						'color1': 'blue'
					});

					Wee.controller.$merge('obj', {
						'color2': 'red'
					});

					assert.deepEqual(Wee.controller.$get('obj'), {
						color1: 'blue',
						color2: 'red'
					},
					'Property "color2: red" was not appended to object');
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
				},
				'ready': function() {
					var result;

					Wee.ready(function() {
						result = 5 * 5;
					});

					document.addEventListener('DOMContentLoaded', function() {
						assert.strictEqual(result, 25,
							'Function was not executed on page load'
						);
					});
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
		'$': {
			'parsing HTML': function() {
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
			}
			// 'select window': function {
			// 	assert.isTrue(Array.isArray(Wee.$('window')));
			// },
			// 'select document': function {
			// 	assert.isTrue(Array.isArray(Wee.$('document')));
			// }
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

			assert.isArray(Wee.$set('testArray', [1, 2, 3]), [1, 2, 3],
				'Value was not properly set to an array'
			);

			assert.strictEqual(Wee.$has('testArray.key1'), true, 
				'Global storage object should have key of "key1"'
			);

			Wee.$set('myArray', ['blue', 'red', 'green']);

			assert.strictEqual(Wee.$get('myArray.0'), 'blue',
				'Array did not return value of "blue"'
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
		'$has': {
			'simple value': function() {
				Wee.$set('testHas', 'value');

				assert.strictEqual(Wee.$has('testHas.0'), true,
					'Not detecting any value for "testHas"'
				);
			},
			'object as value': function() {
				Wee.$set('testHas2', {
					'color1': 'blue',
					'color2': 'red'
				});

				assert.strictEqual(Wee.$has('testHas.0'), true,
					'Not detecting any value for "testHas"'
				);
			}
		},
		'$push': function() {
			Wee.$push('testPush', 'value1');
			Wee.$push('testPush', 'value2');

			assert.deepEqual(Wee.$get('testPush'), ['value1', 'value2'], 
				'Second value was not pushed to end of array'
			);
		},
		'$merge': function() {
			Wee.$set('obj', {
				'color1': 'blue'
			});

			Wee.$merge('obj', {
				'color2': 'red'
			});

			assert.deepEqual(Wee.$get('obj'), {
				color1: 'blue',
				color2: 'red'
			},
			'Property "color2: red" was not appended to object');
		},
		'$drop': {
			'drop key from object': function() {
				Wee.$set('testDrop', {
					color1: 'blue',
					color2: 'red'
				});

				assert.deepEqual(Wee.$drop('testDrop.color1'), {color2: 'red'},
					'Property "color1" was not dropped from object as expected'
				);
			},
			'drop value from array': function() {
				Wee.$set('testDrop2', ['red', 'green', 'blue']);

				assert.deepEqual(Wee.$drop('testDrop2', 1), ['red', , 'blue'],
					'Value of "green" was not removed from array'
				);
			}
		},
		'$observe': {
			'basic': function() {
				var returnVal;

				Wee.$observe('testObserve', function(data) {
					returnVal = data;
				}, {
					recursive: true
				});

				Wee.$set('testObserve.key1', 5);

				assert.deepEqual(returnVal, { key1: 5},
					'Property of "key1: 5" was not set on "testObserve" object'
				);
			},
			'advanced': function() {
				var returnVal2;
				
				Wee.$set('testObserve2', 'value1');

				Wee.$observe('testObserve2', function(data, type, diff) {
					if (type === 'set' && diff.before === 'value1') {
						returnVal2 = data;
					}
				}, {
					diff: true
				});

				Wee.$set('testObserve2', 27);

				assert.strictEqual(returnVal2, 27,
					'Did not observe change of "testObserve2" to 2'
				);
			}
		},
		'$unobserve': function() {
			var returnVal3;

			// TODO: 

			Wee.$set('testObserve', {});

			Wee.$observe('testObserve.key1', function(data) {
				returnVal3 = data;
			}, {
				recursive: true
			});

			Wee.$set('testObserve.key1', 5);

			Wee.$unobserve('testObserve.key1');

			Wee.$set('testObserve.key1', 25);

			assert.strictEqual(returnVal3, 5,
				'Value of "returnVal3" did not remain 5 as expected'
			);
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
			assert.notOk(Wee.$envSecure(),
				'The environment was not correctly identified as secure'
			);
		},
		'$equals': {
			'string values': function() {
				assert.strictEqual(Wee.$equals('blue', 'blue'), true,
					'Strings should have evaluated as equal'
				);
			},
			'number values': function() {
				assert.strictEqual(Wee.$equals(1, 2), false,
					'Numbers should not evaluate as equal'
				);
			},
			'object values': function() {
				assert.strictEqual(Wee.$equals(
					{
						key: 'val1'
					}, {
						key: 'val1'
					}), true,
					'Objects should have evaluated as equal'
				);
			},
			'array values': function() {
				assert.strictEqual(Wee.$equals([1, 2, 3], [1, 2]), false,
					'Arrays should have evaluated as equal'
				);
			},
			'date values': function() {
				var d1 = new Date();
				var d2 = new Date(d1);

				assert.strictEqual(Wee.$equals(d1, d2), true,
					'Dates should not evaluate as equal'
				);
			}
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
		'$trigger': function() {
			var trig = 0;

			Wee.$set('testTrigger', 'value');

			Wee.$observe('testTrigger', function() {
				trig++;
			});

			Wee.$trigger('testTrigger')

			assert.strictEqual(trig, 1,
				'Variable "trig" was not incremented'
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