define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	registerSuite({
		'fn.make': function() {
			Wee.fn.make('controller', {
				test: function() {
					return 'response';
				}
			});

			assert.equal(Wee.controller.test(), 'response',
				'Controller function response correctly returned.'
			);
		},
		'fn.extend': function() {
			Wee.fn.extend('controller', {
				test2: function() {
					return 'response';
				}
			});

			assert.strictEqual(Wee.controller.test2(), 'response',
				'Controller extended successfully.'
			);
		},
		'$env': function() {
			// Default
			assert.strictEqual(Wee.$env(), 'local',
				'Default environment is correctly set to "local".'
			);

			// Settings
			Wee.$env({
				prod: 'www.weepower.com',
				stage: 'www.weepower.stage'
			}, 'here');

			assert.strictEqual(Wee.$env(), 'here',
				'Default environment is correctly set to "here".'
			);
		},
		'$envSecure': function() {
			assert.ok(Wee.$envSecure('https://www.weepower.com'),
				'The environment is correctly identified as secure.'
			);
		},
		'$get': function() {
			assert.strictEqual(Wee.$get('var-123'), null,
				'Variable "var-123" is currently null.'
			);

			assert.strictEqual(Wee.$get('123 var'), null,
				'Variable "123 var" is currently null.'
			);

			assert.strictEqual(Wee.$get('var-123', 'string'), 'string',
				'Variable "var-123" is returned as the default "string".'
			);

			assert.strictEqual(Wee.$get('var-123'), null,
				'Variable "var-123" is still correctly set to null.'
			);

			assert.strictEqual(Wee.$get('cont:var-123', 'string'), 'string',
				'Variable "var-123" is returned as the default "string" in the "cont" namespace.'
			);

			assert.strictEqual(Wee.$get('123 var', 'Testing 123'), 'Testing 123',
				'Variable "123 var" is returned as the default "Testing 123".'
			);

			assert.strictEqual(Wee.$get('var-123', function() {
					return 'string';
				}), 'string',
				'Variable "var-123" is returned as the default "string".'
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
		'$toArray': function() {
			assert.deepEqual(Wee.$toArray('string'), ['string'],
				'String "string" is now ["string"].'
			);

			assert.deepEqual(Wee.$toArray(['string']), ['string'],
				'Array ["string"] is still ["string"].'
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
		'$serialize': function() {
			assert.strictEqual(Wee.$serialize({
					key1: 'val1',
					key2: 'val2',
					key3: 'val3'
				}), 'key1=val1&key2=val2&key3=val3',
				'Object serialization properly returned.'
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

			var obj = {
					key: {
						subKey: 'value'
					}
				},
				src = {
					key: {
						subKey2: 'value2'
					},
					key2: 'value2'
				},
				result = {
					key: {
						subKey: 'value',
						subKey2: 'value2'
					},
					key2: 'value2'
				};

			assert.deepEqual(Wee.$extend(obj, src, true), result,
				'Objects merged recursively.'
			);
		},
		'$merge': function() {
			var arr = [1, 2, 3, 4],
				arr2 = [4, 5, 6],
				result = [1, 2, 3, 4, 4, 5, 6];

			assert.deepEqual(Wee.$merge(arr, arr2), result,
				'Arrays merged with duplicates remaining.'
			);

			var arr = [1, 2, 3, 4],
				arr2 = [4, 5, 6];

			assert.deepEqual(Wee.$merge(arr, arr2, true), [1, 2, 3, 4, 5, 6],
				'Arrays merged with duplicates removed.'
			);
		},
		'$unique': function() {
			var arr = [1, 2, 3, 3, 4, 4, 5];

			assert.deepEqual(Wee.$unique(arr), [1, 2, 3, 4, 5],
				'Only unique elements were correctly returned.'
			);
		},
		'$': function() {
			Wee.$html('#wee',
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
		'$eq': function() {
			Wee.$html('#wee',
				'<div class="testing">1</div>' +
				'<div class="testing">2</div>' +
				'<div class="testing">3</div>'
			);

			var el = Wee.$eq('.testing', 1);

			assert.strictEqual(Wee.$text(el), '2',
				'Element with index 1 was selected successfully.'
			);
		},
		'$first': function() {
			Wee.$html('#wee',
				'<div class="testing">1</div>' +
				'<div class="testing">2</div>' +
				'<div class="testing">3</div>'
			);

			var el = Wee.$first('.testing');

			assert.strictEqual(Wee.$text(el), '1',
				'First element was selected successfully.'
			);
		},
		'$each': function() {
			Wee.$html('#wee',
				'<div class="testing">1</div>' +
				'<div class="testing">2</div>' +
				'<div class="testing">3</div>'
			);

			var total = 0;

			Wee.$each('.testing', function(el) {
				total += parseInt(Wee.$text(el), 10);
			});

			assert.strictEqual(total, 6,
				'Elements successfully iterated.'
			);
		},
		'$map': function() {
			Wee.$html('#wee',
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
		'$attr': function() {
			Wee.$attr('#wee', 'test', 'value');

			assert.strictEqual(Wee.$attr('#wee', 'test'), 'value',
				'Attribute "test" was set correctly.'
			);
		},
		'$data': function() {
			Wee.$data('#wee', 'test', 'value');

			assert.strictEqual(Wee.$data('#wee', 'test'), 'value',
				'Data attribute "test" was set correctly.'
			);
		},
		'$setVar': function() {
			Wee.$html('#wee',
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
		'$setRef': function() {
			Wee.$html('#wee', '<div data-ref="testElement">1</div>');

			Wee.$setRef();

			assert.strictEqual(Wee.$text('ref:testElement'), '1',
				'Reference element was successfully selected.'
			);
		}
	});
});