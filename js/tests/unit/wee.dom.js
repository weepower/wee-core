define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert');

	require('js/tests/support/exports.js');

	registerSuite({
		name: 'DOM',

		beforeEach: function() {
			var container = document.createElement('div');

			container.id = 'container';
			container.className = 'js-container';

			document.body.appendChild(container);
		},

		afterEach: function() {
			Wee.$remove('#container');
		},

		add: function() {
			Wee.$append('body',
				'<div class="div1"></div><div class="div2"></div>'
			);

			$('.div1').add('.div2').text('Test add function');

			assert.strictEqual($('.div2').text(), 'Test add function',
				'Did not add element with class of "div2" to selection'
			);
		},

		$addClass: {
			single: function() {
				assert.ok(Wee.$hasClass('#container',
					'js-container'
				),
					'Single class was not added successfully'
				);
			},

			multiple: function() {
				Wee.$addClass('#container',
					'test-class-1 test-class-2 test-class-3'
				);

				assert.include(Wee.$attr('#container', 'class'),
					'test-class-1 test-class-2 test-class-3',
					'Multiple classes were not added successfully'
				);

				assert.ok(Wee.$hasClass('#container',
					'js-container test-class-1 test-class-2 test-class-3'),
					'Multiple classes were not added successfully'
				);
			},

			function: function() {
				Wee.$addClass('#container', function(i, className) {
					return className + i;
				});

				assert.ok(Wee.$hasClass('#container', 'js-container0'),
					'Indexed class was not added successfully'
				);

				assert.include(Wee.$attr('#container', 'class'), '0',
					'Indexed class was not added successfully'
				);
			}
		},

		$after: {
			markup: function() {
				Wee.$after('#container',
					'<span class="testing-after"></span>'
				);

				var $prev = Wee.$next('#container');

				assert.ok(Wee.$hasClass($prev, 'testing-after'),
					'Testing element added after successfully.'
				);
			},

			function: function() {
				Wee.$html('#container',
					'<div id="name" data-name="John Smith">' +
						'<h1 id="nameTwo" data-ref="bioName">Name</h1>' +
					'</div>'
				);

				Wee.$after('#nameTwo', function() {
					return '<p id="nameThree">' +
						Wee.$data(Wee.$parent(this), 'name') + '</p>';
				});

				assert.strictEqual(Wee.$html('#nameThree'),
					'John Smith',
					'Function was not executed successfully'
				);
			}
		},

		$append: {
			selection: function() {
				Wee.$html('#container',
					'<span class="testing-append"></span>'
				);

				assert.ok(Wee.$contains('#container','.testing-append'),
					'Testing element was not appended successfully'
				);
			},

			function: function() {
				Wee.$html('#container',
					'<h1 id="list-heading"></h1>' +
					'<ul id="wee-list">' +
						'<li>Dee Reynolds</li>' +
						'<li>Frank Reynolds</li>' +
					'</ul>'
				);

				Wee.$append('#list-heading', function() {
					return '(' + Wee.$children('#wee-list').length + ')';
				});

				assert.include(Wee.$html('#list-heading'), '(2)',
					'Function was not executed successfully'
				);

				assert.strictEqual(Wee.$html('#list-heading'), '(2)',
					'Function was not executed successfully'
				);
			}
		},

		$attr: {
			get: function() {
				Wee.$html('#container',
					'<a id="wee-link" href="https://www.weepower.com">Wee</a>'
				);

				assert.strictEqual(Wee.$attr('#wee-link', 'href'),
					'https://www.weepower.com',
					'Attribute was not retrieved successfully'
				);

				assert.notStrictEqual(Wee.$attr('#wee-link', 'href'),
					'http://www.weepower.com',
					'Attribute was not retrieved successfully'
				);
			},

			single: function() {
				Wee.$html('#container',
					'<a id="wee-link" href="https://www.weepower.com">Wee</a>'
				);

				assert.strictEqual(Wee.$attr('#wee-link', 'id'),
					'wee-link',
					'Attribute was not retrieved successfully'
				);
			},

			multiple: function() {
				Wee.$html('#container',
					'<a id="wee-link" href="https://www.google.com"' +
					'data-ref="data-reference">Wee</a>');

				assert.strictEqual(Wee.$attr('#wee-link', 'href'),
					'https://www.google.com',
					'Attribute was not retrieved successfully'
				);

				assert.strictEqual(Wee.$attr('#wee-link', 'data-ref'),
					'data-reference',
					'Attribute was not retrieved successfully'
				);
			}
		},

		$before: {
			markup: function() {
				Wee.$before('#container',
					'<span class="testing-before"></span>'
				);

				var $prev = Wee.$prev('#container');

				assert.ok(Wee.$hasClass($prev, 'testing-before'),
					'Testing element was not added before successfully'
				);
			},

			function: function() {
				Wee.$html('#container',
					'<div id="wee-inner"></div>'
				);

				Wee.$before('#wee-inner', function() {
					return '<div id="wee-inner-2">test</div>';
				});

				assert.ok(Wee.$html('#wee-inner-2'), 'test',
					'Function was not executed successfully'
				);
			}
		},

		$children: {
			all: function() {
				Wee.$html('#container',
					'<span></span><span></span>'
				);

				assert.strictEqual(Wee.$children('#container').length, 2,
					'Children were not selected successfully'
				);

				assert.include(Wee.$html('#container'),
					'<span></span><span></span>',
					'Children were not selected successfully'
				);
			},

			filtered: function() {
				Wee.$html('#container',
					'<li></li>li<li></li><li></li><span></span>'
				);

				assert.strictEqual(Wee.$children('#container', 'li').length, 3,
					'Filtered children were not selected successfully'
				);

				assert.notInclude(Wee.$children('#container', 'li'),
					'<span></span>'
				);
			}
		},

		$clone: function() {
			Wee.$html('#container', '<h1 id="inner"></h1>');

			Wee.$append('#container', Wee.$clone('#inner'));

			assert.strictEqual(Wee.$html('#container'),
				'<h1 id="inner"></h1><h1 id="inner"></h1>',
				'Element was not cloned successfully'
			);
		},
		$closest: function() {
			Wee.$append('#container',
				'<div id="inner"></div>'
			);

			assert.strictEqual(Wee.$closest('#inner', '#container').length, 1,
				'Closest element was identified successfully'
			);

			assert.isArray(Wee.$closest('#inner', '#container'),
				'Closest element was identified successfully'
			);
		},
		$contains: function() {
			Wee.$html('#container',
				'<span class="testing-contains"></span>'
			);

			assert.ok(Wee.$contains('#container',
				'.testing-contains'),
				'Element was not selected successfully'
			);

			assert.notOk(Wee.$contains('#container',
				'.another'),
				'Element was not selected successfully'
			);

			assert.isFalse(Wee.$contains('#container'),
				'$contains returned boolean true'
			);
		},
		$contents: function() {
			Wee.$html('#container',
				'<span></span><span></span>'
			);

			assert.strictEqual(Wee.$contents('#container').length, 2,
				'Contents were not selected successfully'
			);

			assert.isArray(Wee.$contents('#container'),
				'Contents were not selected successfully'
			);
		},
		$css: {
			'get value': function() {
				assert.strictEqual(Wee.$css('#container', 'paddingTop'), '0px',
					'Default value was not retrieved successfully'
				);
			},
			single: function() {
				Wee.$css('#container', 'fontSize', '10px');

				assert.strictEqual(Wee.$css('#container', 'fontSize'), '10px',
					'Single property was not set successfully'
				);

				assert.strictEqual(Wee.$css('#container', 'paddingTop'), '0px',
					'Single value was not set successfully'
				);
			},
			multiple: function() {
				Wee.$css('#container', {
					marginTop: '10px',
					marginBottom: '5px'
				});

				assert.strictEqual(Wee.$css('#container', 'marginTop'), '10px',
					'Top margin was not set correctly'
				);

				assert.strictEqual(Wee.$css('#container', 'marginBottom'), '5px',
					'Bottom margin was not set correctly'
				);

				assert.include(Wee.$attr('#container', 'style'),
					'margin-top: 10px; margin-bottom: 5px;',
					'Multiple properties were not set successfully'
				);
			}
		},
		$data: {
			beforeEach: function() {
				Wee.$append('#container',
					'<div id="wee-data" data-id="150"' +
					'data-ref="data-reference" data-test="data-test">'
				);
			},
			afterEach: function() {
				Wee.$remove('#wee-data');
			},
			get: {
				all: function() {
					var weeData = Wee.$data('#wee-data'),
						dataObject = {
							id: 150,
							ref: 'data-reference',
							test: 'data-test'
						};

					assert.isObject(weeData,
						'$data did not return an object'
					);

					assert.deepEqual(weeData, dataObject,
						'Data references were not selected successfully'
					);
				},
				single: function() {
					assert.strictEqual(Wee.$data('#wee-data', 'id'), 150,
						'Data reference was not returned successfully'
					);

					assert.strictEqual(Wee.$data('#wee-data', 'test'),
						'data-test',
						'Data reference was not returned successfully'
					);
				}
			},
			set: {
				single: function () {
					Wee.$data('#wee-data', 'id', '250');

					assert.notStrictEqual(Wee.$data('#wee-data', 'id'), 150,
						'Data reference was not set successfully'
					);

					assert.strictEqual(Wee.$data('#wee-data', 'id'), 250,
						'Data reference was not set successfully'
					);
				},
				multiple: function() {
					Wee.$data('#wee-data', {
						id: 350,
						ref: 'reference',
						test: 'failed'
					});

					var weeData = Wee.$data('#wee-data'),
						dataObject = {
							id: 350,
							ref: 'reference',
							test: 'failed'
						};

					assert.deepEqual(weeData, dataObject,
						'Data references were not set successfully'
					);

					assert.strictEqual(Wee.$data('#wee-data', 'id'), 350,
						'Data references were not set successfully'
					);

					assert.strictEqual(Wee.$data('#wee-data', 'ref'),
						'reference',
						'Data references were not set successfully'
					);

					assert.strictEqual(Wee.$data('#wee-data', 'test'),
						'failed',
						'Data references were not set successfully'
					);

					assert.isObject(weeData,
						'$data did not return an object'
					);
				}
			}
		},
		$empty: function() {
			Wee.$html('#container',
				'<span class="testing-empty"></span>'
			);

			assert.strictEqual(Wee.$html('#container'),
				'<span class="testing-empty"></span>',
				'Element was not added successfully'
			);

			Wee.$empty('#container');

			assert.strictEqual(Wee.$('.testing-empty').length, 0,
				'Element was not emptied successfully'
			);

			assert.notInclude(Wee.$html('#container'),
				'<span class="testing-empty"></span>',
				'Element was not emptied successfully'
			);
		},
		$eq: {
			'positive index': function() {
				Wee.$html('#container',
					'<div class="testing-eq-pos">1</div>' +
					'<div class="testing-eq-pos">2</div>' +
					'<div class="testing-eq-pos">3</div>'
				);

				var el = Wee.$eq('.testing-eq-pos', 1);

				assert.strictEqual(Wee.$text(el), '2',
					'Element with index 1 was not selected successfully.'
				);
			},
			'negative index': function() {
				Wee.$html('#container',
					'<div class="testing-eq-neg">1</div>' +
					'<div class="testing-eq-neg">2</div>' +
					'<div class="testing-eq-neg">3</div>'
				);

				var el = Wee.$eq('.testing-eq-neg', -1);

				assert.strictEqual(Wee.$text(el), '3',
					'Element with index 3 was not selected successfully.'
				);
			}
		},
		$filter: {
			selection: function() {
				Wee.$html('#container',
					'<span class="testing-filter one"></span>' +
					'<span class="testing-filter two"></span>' +
					'<span class="testing-filter three"></span>'
				);

				var elements = Wee.$('.testing-filter');

				assert.strictEqual(Wee.$filter(elements, '.one').length, 1,
					'Filtered elements not returned successfully'
				);

				assert.isArray(Wee.$filter(elements, '.one'),
					'$filter did not return an array'
				);
			},
			function: function() {
				Wee.$html('#container',
					'<ul class="people">' +
						'<li>Charlie Kelly</li>' +
						'<li>Dennis Reynolds</li>' +
						'<li>Mac</li>' +
						'<li>Dee Reynolds</li>' +
					'</ul>'
				);

				var filterFunction = Wee.$filter('.people li', function(i, el) {
						return Wee.$text(el).indexOf('Reynolds') !== -1;
					});

				assert.isArray(filterFunction,
					'Function did not return an array'
				);

				assert.notInclude(filterFunction, 'Mac',
					'Elements were not filtered successfully'
				);
			}
		},
		$find: function() {
			Wee.$html('#container',
				'<span class="testing-find"></span>' +
				'<span class="testing-find-2"></span>' +
				'<span class="testing-find-2"></span>'
			);

			assert.strictEqual(Wee.$find('#container', '.testing-find').length, 1,
				'Element was not found successfully'
			);

			assert.strictEqual(Wee.$find('#container', '.testing-find-2').length, 2,
				'Element was not found successfully'
			);
		},

		$first: function() {
			Wee.$html('#container',
					'<div class="test-first">1</div>' +
					'<div class="test-first">2</div>'
				);

			assert.strictEqual(Wee.$first('.test-first').textContent, '1',
				'First element was not selected successfully.'
			);
		},

		$hasClass: {
			single: function() {
				Wee.$addClass('#container', 'test-class');

				assert.ok(Wee.$hasClass('#container', 'test-class'),
					'Class was not detected successfully'
				);

				assert.ok(Wee.$hasClass('#container', 'js-container'),
					'Class was not detected successfully'
				);
			},

			multiple: function() {
				Wee.$addClass('#container',
					'test-class test-class-2 test-class-3'
				);

				assert.ok(Wee.$hasClass('#container',
					'test-class test-class-2 test-class-3'
				),
					'Multiple classes were not detected successfully'
				);
			}
		},

		$height: {
			beforeEach: function() {
				Wee.$height('#container', '100px');
			},
			get: function() {
				var docHeight = document.documentElement.scrollHeight,
					winHeight = window.innerHeight;

				assert.strictEqual(Wee.$height('#container'), 100,
					'Element height not set successfully'
				);

				assert.strictEqual(Wee.$height(window), winHeight,
					'Element width not set successfully'
				);

				assert.strictEqual(Wee.$height(document), docHeight,
					'Element width not set successfully'
				);
			},
			set: function() {
				Wee.$height('#container', '150px');

				assert.strictEqual(Wee.$height('#container'), 150,
					'Element height not set successfully'
				);
			},
			function: function() {
				Wee.$height('#container', function(i, height) {
					return (height += 50) + 'px';
				});

				assert.strictEqual(Wee.$height('#container'), 150,
					'Element height not set successfully'
				);
			}
		},
		$hide: function() {
			Wee.$hide('#container');

			assert.ok(Wee.$hasClass('#container', 'js-hide'),
				'Element was not hidden successfully'
			);
		},
		$html: {
			get: {
				single: function() {
					Wee.$html('#container',
						'<h1>Testing</h1>'
					);

					assert.strictEqual(Wee.$html('#container').toLowerCase(),
						'<h1>testing</h1>',
						'HTML "<h1>testing</h1>" was not set correctly'
					);
				},
				multiple: function() {
					Wee.$html('#container',
						'<span></span><span></span><span></span>'
					);

					Wee.$html('#container span', '1');

					assert.strictEqual(Wee.$html('#container'),
						'<span>1</span><span>1</span><span>1</span>',
						'HTML span values not returned successfully'
					);
				}
			},
			set: {
				beforeEach: function() {
					Wee.$append('#container',
						'<h1>Heading One</h1><h2>Heading Two</h2>'
					);
				},
				single: function() {
					Wee.$html('#container',
						'<h2>New Heading</h2>'
					);

					assert.strictEqual(Wee.$html('#container'),
						'<h2>New Heading</h2>',
						'HTML was not set successfully'
					);
				}
			},
			function: function() {
				Wee.$append('#container',
					'<h1>Heading One</h1>' +
					'<h2>Heading Two</h2>'
				);

				Wee.$html('#container', function(el, html) {
					return html.toUpperCase();
				});

				assert.strictEqual(Wee.$html('#container'),
					'<h1>HEADING ONE</h1><h2>HEADING TWO</h2>',
					'Function was not executed successfully'
				);
			}
		},
		$index: function() {
			Wee.$html('#container',
				'<div id="one"></div>' +
				'<div id="two"></div>' +
				'<div id="three"></div>'
			);

			assert.strictEqual(Wee.$index('#three'), 2,
				'Incorrect element index returned'
			);
		},
		$insertAfter: function() {
			Wee.$html('#container',
				'<div id="wee-inner"></div>'
			);

			var $el = Wee.$parseHTML('<span class="testing-insertafter"></span>');

			Wee.$insertAfter($el, '#wee-inner');

			var $next = Wee.$next('#wee-inner');

			assert.ok(Wee.$hasClass($next, 'testing-insertafter'),
				'Element added successfully.'
			);
		},
		$insertBefore: function() {
			Wee.$html('#container', '<div id="wee-inner"></div>');

			var $el = Wee.$parseHTML('<span class="testing-insertbefore"></span>');

			Wee.$insertBefore($el, '#wee-inner');

			var $prev = Wee.$prev('#wee-inner');

			assert.ok(Wee.$hasClass($prev, 'testing-insertbefore'),
				'Element was not added before successfully'
			);
		},
		$is: {
			selection: function() {
				Wee.$addClass('#container', 'one');

				assert.ok(Wee.$is('#container', '.one'),
					'Element was not successfully identified with "one" class'
				);

				assert.isFalse(Wee.$is('#container'),
					'$is returned false instead of true'
				);
			},
			function: function() {
				Wee.$html('#container',
					'<ul class="people">' +
					    '<li data-hidden="false">Charlie Kelly</li>' +
					    '<li data-hidden="true">Dennis Reynolds</li>' +
					    '<li data-hidden="false">Mac</li>' +
					    '<li data-hidden="false">Dee Reynolds</li>' +
					'</ul>'
				);

				var isFunction = Wee.$is('.people li', function(i, el) {
						return Wee.$data(el, 'hidden');
					});

				assert.isTrue(isFunction,
					'Function executed successfully'
				);
			}
		},
		$last: function() {
			Wee.$html('#container',
				'<span>1</span><span>2</span><span>3</span>'
			);

			assert.strictEqual(Wee.$html(Wee.$last('#container span')), '3',
				'Last element content was not returned successfully'
			);
		},

		$next: function() {
			Wee.$append('body', '<div id="wee-2"></div>');

			assert.strictEqual(Wee.$next('#container')[0].id, 'wee-2',
				'Next element was not returned successfully'
			);

			Wee.$remove('#wee-2');
		},

		$not: {
			selection: function() {
				Wee.$html('#container',
					'<span class="testing-not one"></span>' +
					'<span class="testing-not two"></span>' +
					'<span class="testing-not three"></span>'
				);

				var $elements = Wee.$('.testing-not');

				assert.isArray(Wee.$not($elements, '.one'));

				assert.strictEqual(Wee.$not($elements, '.one').length, 2,
					'Filtered elements not retuned successfully'
				);
			},
			function: function() {
				Wee.$html('#container',
					'<ul class="people">' +
					    '<li data-hidden="false">Charlie Kelly</li>' +
					    '<li data-hidden="true">Dennis Reynolds</li>' +
					    '<li data-hidden="false">Mac</li>' +
					    '<li data-hidden="false">Dee Reynolds</li>' +
					'</ul>'
				);

				var notFunction = Wee.$not('.people li', function(i, el) {
						return Wee.$data(el, 'hidden') === true;
					});

				assert.isArray(notFunction,
					'$not did not return an array'
				);

				assert.strictEqual(notFunction.length, 3,
					'Incorrect values were returned'
				);
			}
		},
		$offset: {
			beforeEach: function() {
				Wee.$css('#container', {
					position: 'absolute',
					top: '-10000px',
					left: '-10000px'
				});
			},
			get: function() {
				assert.deepEqual(Wee.$offset('#container'), {
					top: -10000,
					left: -10000
				},
					'Offset not returned successfully'
				);

				assert.notDeepEqual(Wee.$offset('#container'), {
					top: 10000,
					left: 10000
				},
					'Offset not returned successfully'
				);
			},
			set: function() {
				Wee.$offset('#container', {
					top: 100,
					left: 20
				});

				assert.deepEqual(Wee.$offset('#container'), {
					top: 100,
					left: 20
				},
					'Offset value was not set successfully'
				);

				assert.notDeepEqual(Wee.$offset('#container'), {
					top: 101,
					left: 22
				},
					'Offset value was not set successfully'
				);
			}
		},
		$parent: {
			all: function() {
				var $fixture = Wee.$('#container');

				Wee.$html($fixture, '<span class="fixture-child"></span>');

				assert.deepEqual(Wee.$parent('.fixture-child'), $fixture,
					'Parent was not returned successfully'
				);
			},
			filtered: function() {
				var $fixture = Wee.$('#container');

				Wee.$html($fixture, '<div class="fixture-child"></div>');

				assert.deepEqual(Wee.$parent('.fixture-child', 'div'), $fixture,
					'Filtered parent was not returned successfully'
				);
			}
		},
		$parents: function() {
			var $fixture = Wee.$('#container');

			Wee.$html($fixture,
				'<span id="child">' +
					'<span id="child-2">' +
						'<span id="child-3"></span>' +
					'</span>' +
				'</span>'
			);

			assert.strictEqual(Wee.$parents('#child-3')[0].id, 'child-2',
				'Parents were not returned successfully'
			);

			assert.strictEqual(Wee.$parents('#child-2')[0].id, 'child',
				'Parents were not returned successfully'
			);

			assert.strictEqual(Wee.$parents('#child-3').length, 5,
				'Parents were not returned successfully'
			);

			assert.isArray(Wee.$parents('#child-3'),
				'$parents did not return an array'
			);
		},
		$position: function() {
			var positionValue = {
				top: -10000,
				left: -10000
			};

			Wee.$css('#container', {
				position: 'absolute',
				top: '-10000px',
				left: '-10000px'
			});

			assert.deepEqual(Wee.$position('#container'), positionValue,
				'Position not returned successfully'
			);

			assert.notDeepEqual(Wee.$position('#container'), {
				top: 10000,
				left: 10000
			},
				'Position not returned successfully'
			);

			assert.isObject(Wee.$position('#container'),
				'$position did not return an object'
			);
		},
		$prepend: {
			selection: function() {
				Wee.$prepend('#container',
					'<span class="testing"></span>'
				);

				assert.ok(Wee.$contains('#container', '.testing'),
					'Testing element was not prepended successfully'
				);
			},
			function: function() {
				Wee.$html('#container',
					'<h1 id="list-heading"></h1>' +
					'<ul id="wee-list">' +
						'<li>Dee Reynolds</li>' +
						'<li>Frank Reynolds</li>' +
					'</ul>'
				);

				Wee.$prepend('#list-heading', function() {
					return '(' + Wee.$children('#wee-list').length + ')';
				});

				assert.include(Wee.$text('#list-heading'), '(2)',
					'Function was not executed successfully'
				);

				assert.strictEqual(Wee.$text('#list-heading'), '(2)',
					'Function was not executed successfully'
				);
			}
		},

		$prev: function() {
			Wee.$after('#container',
				Wee.$('<div id="container-2"></div>')
			);

			assert.strictEqual(Wee.$prev('#container-2')[0].id, 'container');
		},

		$prop: {
			beforeEach: function() {
				Wee.$html('#container',
					'<input type="text" class="testing">'
				);
			},
			afterEach: function() {
				Wee.$remove('.testing');
			},
			get: function() {
				Wee.$prop('.testing', 'checked');

				assert.notOk(Wee.$prop('.testing', 'checked'),
					'Property was selected successfully'
				);
			},
			single: function() {
				Wee.$prop('.testing', 'disabled', true);

				assert.ok(Wee.$prop('.testing', 'disabled'),
					'Disabled property was not added successfully'
				);
			},
			multiple: function() {
				Wee.$prop('.testing', {
					disabled: true,
					required: true
				});

				assert.ok(Wee.$prop('.testing', 'disabled'),
					'Disabled property was negated successfully.'
				);
				assert.ok(Wee.$prop('.testing', 'required'),
					'Required property was added successfully.'
				);
			}
		},

		$remove: function() {
			Wee.$html('#container', '<div id="wee-inner"></div>');

			assert.ok(Wee.$html('#container'), '<div id="wee-inner"></div>',
				'Element was not created successfully'
			);

			Wee.$remove('#wee-inner');

			assert.strictEqual(Wee.$html('#container'), '',
				'Element was not removed successfully'
			);
		},

		$removeAttr: function() {
			Wee.$attr('#container', 'data-test', 'value');
			Wee.$removeAttr('#container', 'data-test');

			assert.strictEqual(Wee.$attr('#container', 'data-test'), null,
				'Attribute was not removed successfully'
			);
		},

		$removeClass: {
			single: function() {
				Wee.$removeClass('#container', 'wee');

				assert.notOk(Wee.$hasClass('#container', 'wee'),
					'Single class was not removed successfully'
				);
			},

			multiple: function() {
				Wee.$addClass('#container', 'wee-2');
				Wee.$addClass('#container', 'wee-3');
				Wee.$addClass('#container', 'peter');

				Wee.$removeClass ('#container', 'wee wee-2 wee-3');

				assert.notInclude(Wee.$attr('#container', 'class'),
					'wee wee-2',
					'Multiple classes were not removed successfully'
				);
			},

			function: function() {
				// TODO: Complete
				assert.isTrue(true);
			}
		},

		$replaceWith: {
			markup: function() {
				Wee.$replaceWith('#container',
					'<span class="testing-replacewith"></span>'
				);

				assert.strictEqual(Wee.$('#container').length, 0,
					'Fixture was not removed successfully'
				);

				assert.strictEqual(Wee.$('.testing-replacewith').length, 1,
					'Testing element was not added successfully'
				);

				Wee.$replaceWith('.testing',
					'<div id="wee" class="wee"></div>'
				);
			},
			function: function() {
				Wee.$html('#container',
					'<ul class="names">' +
						'<li>John Doe</li>' +
					'</ul>');

				Wee.$replaceWith('.names li', function(i, html) {
				    return '<li>The ' + html + '</li>';
				});

				assert.strictEqual(Wee.$html('#container li'), 'The John Doe',
					'Function was not executed successfully'
				);
			}
		},

		$scrollLeft: {
			get: function() {
				assert.strictEqual(Wee.$scrollLeft(), 0,
					'Scroll left value not retreived successfully'
				);
			},

			set: function() {
				assert.isTrue(true);

				Wee.$css('body', 'width', '15000px');

				Wee.$scrollLeft('body', 10);

				assert.strictEqual(Wee.$scrollLeft(), 10,
					'Scroll left value not set successfully'
				);
			}
		},

		$scrollTop: {
			get: function() {
				Wee.$scrollTop('body', 0);

				assert.strictEqual(Wee.$scrollTop(), 0,
					'Scroll top value not retreived successfully'
				);
			},

			set: function() {
				assert.isTrue(true);

				Wee.$css('body', 'height', '500px');

				Wee.$scrollTop('body', 10);

				assert.strictEqual(Wee.$scrollTop(), 10,
					'Scroll top value not set successfully'
				);
			}
		},
		$serializeForm: function() {
			Wee.$html('#container',
				'<form action="#" id="wee-form">' +
					'<input type="text" name="input" value="inputValue">' +
					'<input type="checkbox" name="checkbox" value="checkboxValue" checked>' +
					'<input type="radio" name="radio1" value="radioValue" checked>' +
					'<input type="text" name="name[]" value="name1">' +
					'<input type="text" name="email[]" value="email1">' +
					'<input type="text" name="name[]" value="name2">' +
					'<input type="text" name="email[]" value="email2">' +
					'<select name="select">' +
						'<option value="selectValue1" selected>Option 1</option>' +
						'<option value="selectValue2">Option 2</option>' +
					'</select>' +
					'<select name="select-multiple" multiple>' +
						'<option value="selectValue1" selected>Option 1</option>' +
						'<option value="selectValue2" selected>Option 2</option>' +
					'</select>' +
					'<select name="optgroup">' +
						'<optgroup>' +
							'<option value="optgroupValue1" selected>Optgroup 1</option>' +
							'<option value="optgroupValue2">Optgroup 2</option>' +
						'</optgroup>' +
					'</select>' +
					'<textarea name="textarea">' +
					'Text Area' +
					'</textarea>' +
				'</form>'
			);

			var serializedValue = 'input=inputValue&checkbox=checkboxValue&' +
				'radio1=radioValue&name[]=name1&name[]=name2&email[]=email1' +
				'&email[]=email2&select=selectValue1&select-multiple[]=sele' +
				'ctValue1&select-multiple[]=selectValue2&optgroup=optgroupV' +
				'alue1&textarea=Text+Area';

			assert.strictEqual(Wee.$serializeForm('#wee-form'), serializedValue,
				'Form was not serialized successfully'
			);

			Wee.$html('#container', '<div id="wee-form">hi</div>');

			assert.strictEqual(Wee.$serializeForm('#wee-form'), '',
				'Attempted to serialize a non FORM element'
			);
		},
		$show: function() {
			Wee.$hide('#container');

			assert.ok(Wee.$hasClass('#container', 'js-hide'),
				'Element was not hidden successfully'
			);

			Wee.$show('#container');

			assert.notOk(Wee.$hasClass('#container', 'js-hide'),
				'Element was not shown successfully'
			);
		},
		$siblings: {
			beforeEach: function() {
				Wee.$html('#container',
					'<p></p>' +
					'<span></span>' +
					'<div id="target-div"></div>'
				);
			},
			all: function() {
				assert.strictEqual(Wee.$siblings('#target-div').length, 2,
					'All siblings were not retrieved successfully'
				);

				assert.isArray(Wee.$siblings('#target-div'),
					'$siblings did not return an array'
				);
			},
			filtered: function() {
				assert.strictEqual(Wee.$siblings('#target-div', 'p').length, 1,
					'Filtered siblings were not retrieved successfully'
				);

				assert.isArray(Wee.$siblings('#target-div', 'p'),
					'$siblings did not return an array'
				);
			}
		},
		$slice: function() {
			Wee.$html('#container',
				'<span>1</span><span>2</span><span>3</span>'
			);

			assert.strictEqual(Wee.$html(Wee.$slice('#container span', 1, 2)), '2',
				'Second element was not selected successfully'
			);
		},
		$text: {
			beforeEach: function() {
				Wee.$text('#container', 'Wee Test');
			},
			get: function() {
				assert.strictEqual(Wee.$text('#container'), 'Wee Test',
					'Text was not retreived successfully'
				);
			},
			set: function() {
				Wee.$text('#container', 'Testing 123');

				assert.strictEqual(Wee.$text('#container'), 'Testing 123',
					'Element text was not set successfully'
				);
			}
		},
		$toggle: function() {
			Wee.$toggle('#container');

			assert.ok(Wee.$hasClass('#container', 'js-hide'),
				'Element was not hidden successfully'
			);

			Wee.$toggle('#container');

			assert.notOk(Wee.$hasClass('#container', 'js-hide'),
				'Element was not shown successfully'
			);
		},
		$toggleClass: {
			single: function() {
				Wee.$toggleClass('#container', 'test-class');

				assert.ok(Wee.$hasClass('#container', 'test-class'),
					'Class was not added successfully'
				);

				Wee.$toggleClass('#container', 'test-class');

				assert.notOk(Wee.$hasClass('#container', 'test-class'),
					'Class was not removed successfully'
				);
			},
			multiple: function() {
				Wee.$toggleClass('#container', 'test-class test-class-2');

				assert.strictEqual(Wee.$attr('#container', 'class'),
					'js-container test-class test-class-2',
					'Multiple classes were not toggled successfully'
				);

				Wee.$toggleClass('#container', 'test-class test-class-2');

				assert.notStrictEqual(Wee.$attr('#container', 'class'),
					'js-container test-class test-class-2',
					'Multiple classes were not toggled successfully'
				);

				assert.notOk(Wee.$hasClass('#container', 'test-class'),
					'Multiple classes were not toggled successfully'
				);

				assert.notOk(Wee.$hasClass('#container', 'test-class-2'),
					'Multiple classes were not toggled successfully'
				);

			},
			function: function() {
				Wee.$toggleClass('#container', function() {
					return Wee.$addClass('#container', 'test');
				});

				assert.ok(Wee.$hasClass('#container', 'test'),
					'Function was not executed successfully'
				);
			}
		},
		$val: {
			beforeEach: function() {
				Wee.$html('#container',
					'<input type="text" class="testing" value="test">' +
					'<select name="select-multiple" class="testing2" multiple>' +
						'<option value="selectValue1" selected>Option 1</option>' +
						'<option value="selectValue2" selected>Option 2</option>' +
					'</select>'
				);
			},
			get: function() {
				assert.strictEqual(Wee.$val('.testing'),
					'test',
					'Value was not retrieved successfully'
				);
			},
			'get multiple': function() {
				assert.strictEqual(
					Wee.$equals(Wee.$val('.testing2'),
					['selectValue1', 'selectValue2']),
					true,
					'Value was not retrieved successfully'
				);

				assert.isArray(Wee.$val('.testing2'),
					'Returned value was not an array'
				);
			},
			set: function() {
				Wee.$val('.testing', 'testing');

				assert.strictEqual(Wee.$val('.testing'), 'testing',
					'Value was not set successfully'
				);
			},
			function: function() {
				Wee.$val('.testing', function(i, value) {
					if (value.length > 3) {
						return 'success';
					}
				});

				assert.strictEqual(Wee.$val('.testing'), 'success',
					'Function was not executed successfully'
				);
			}
		},
		$width: {
			beforeEach: function() {
				Wee.$width('#container', '100px');
			},
			get: function() {
				var docWidth = document.documentElement.scrollWidth,
					winWidth = window.innerWidth;

				assert.strictEqual(Wee.$width(window), winWidth,
					'Element width not set successfully'
				);

				assert.strictEqual(Wee.$width(document), docWidth,
					'Element width not set successfully'
				);

				assert.strictEqual(Wee.$width('#container'), 100,
					'Element width not set successfully'
				);

				assert.strictEqual(Wee.$width('#container', true), 100,
					'Element width not set successfully'
				);
			},
			set: function() {
				Wee.$width('#container', '200px');

				assert.strictEqual(Wee.$width('#container'), 200,
					'Element width not set successfully'
				);
			},
			function: function() {
				Wee.$width('#container', function(i, width) {
					return (width += 50) + 'px';
				});

				assert.strictEqual(Wee.$width('#container'), 150,
					'Element width not set successfully'
				);
			}
		},

		$wrap: {
			markup: function() {
				Wee.$append('#container', '<div id="container-inner"></div>');

				Wee.$wrap('#container-inner', '<div id="wrapper"></div>');

				assert.strictEqual(Wee.$parent('#container-inner')[0].id, 'wrapper',
					'Element was not wrapped successfully'
				);
			},

			function: function() {
				Wee.$html('#container',
					'<div id="test-wrap-1" class="test-wrap-1"></div>'
				);

				Wee.$wrap('#test-wrap-1', function() {
					if (Wee.$hasClass(this, 'test-wrap-1')) {
						return '<div class="test-wrap-2"></div>';
					}
				});

				assert.ok(Wee.$parent('.test-wrap-1', '.test-wrap-2'),
					'Function was not executed successfully'
				);
			}
		},

		$wrapInner: {
			markup: function() {
				Wee.$append('#container',
					'<div id="test"></div>'
				);

				Wee.$wrapInner('#test', '<div id="test-2"></div>');

				assert.ok(Wee.$siblings('#test', '#test-2'),
					'Element was not wrapped successfully'
				);
			},

			function: function() {
				Wee.$append('#container',
					'<div id="test" class="test"></div>'
				);

				Wee.$wrapInner('#test', function() {
					if (Wee.$hasClass(this, 'test')) {
						return '<div id="test-2"></div>';
					}
				});

				assert.ok(Wee.$parent('#test-2', '#test'));
			}
		}
	});
});