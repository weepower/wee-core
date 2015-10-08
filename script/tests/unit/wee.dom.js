define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	require('script/wee.dom.js');

	registerSuite({
		name: 'Dom',

		beforeEach: function() {
			var fixtureOne = document.createElement('div');

			fixtureOne.id = 'wee-dom-id';
			fixtureOne.className = 'wee-dom-class';

			document.body.appendChild(fixtureOne);
		},
		afterEach: function() {
			$('#wee-dom-id').remove();
		},
		'$addClass': {
			'single': function() {
				assert.ok(Wee.$hasClass('#wee-dom-id',
					'wee-dom-class'
				),
					'Single class was not added successfully'
				);
			},
			'multiple': function() {
				Wee.$addClass('#wee-dom-id',
					'test-class-1 test-class-2 test-class-3'
				);

				assert.include(Wee.$attr('#wee-dom-id', 'class'),
					'test-class-1 test-class-2 test-class-3',
					'Multiple classes were not added successfully'
				);

				assert.ok(Wee.$hasClass('#wee-dom-id',
					'wee-dom-class test-class-1 test-class-2 test-class-3'),
					'Multiple classes were not added successfully'
				);
			},
			'function': function() {
				Wee.$addClass('#wee-dom-id', function(i, className) {
					return className + i;
				});

				assert.ok(Wee.$hasClass('#wee-dom-id', 'wee-dom-class0'),
					'Indexed class was not added successfully'
				);

				assert.include(Wee.$attr('#wee-dom-id', 'class'), '0',
					'Indexed class was not added successfully'
				);
			}
		},
		'$after': {
			'markup': function() {
				Wee.$after('#wee-dom-id',
					'<span class="testing-after"></span>'
				);

				var $prev = Wee.$next('#wee-dom-id');

				assert.ok(Wee.$hasClass($prev, 'testing-after'),
					'Testing element added after successfully.'
				);
			},
			'function': function() {
				Wee.$html('#wee-dom-id',
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
		'$append': {
			'selection': function() {
				Wee.$html('#wee-dom-id',
					'<span class="testing-append"></span>'
				);

				assert.ok(Wee.$contains('#wee-dom-id','.testing-append'),
					'Testing element was not appended successfully'
				);
			},
			'function': function() {
				Wee.$html('#wee-dom-id',
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
		'$attr': {
			'get': function() {
				Wee.$html('#wee-dom-id',
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
			'single': function() {
				Wee.$html('#wee-dom-id',
					'<a id="wee-link" href="https://www.weepower.com">Wee</a>'
				);

				assert.strictEqual(Wee.$attr('#wee-link', 'id'),
					'wee-link',
					'Attribute was not retrieved successfully'
				);
			},
			'multiple': function() {
				Wee.$html('#wee-dom-id',
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
		'$before': {
			'markup': function() {
				Wee.$before('#wee-dom-id',
					'<span class="testing-before"></span>'
				);

				var $prev = Wee.$prev('#wee-dom-id');

				assert.ok(Wee.$hasClass($prev, 'testing-before'),
					'Testing element was not added before successfully'
				);
			},
			'function': function() {
				Wee.$html('#wee-dom-id',
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
		'$children': {
			'all': function() {
				Wee.$html('#wee-dom-id',
					'<span></span><span></span>'
				);

				assert.strictEqual(Wee.$children('#wee-dom-id').length, 2,
					'Children were not selected successfully'
				);

				assert.include(Wee.$html('#wee-dom-id'),
					'<span></span><span></span>',
					'Children were not selected successfully'
				);
			},
			'filtered': function() {
				Wee.$html('#wee-dom-id',
					'<li></li>li<li></li><li></li><span></span>'
				);

				assert.strictEqual(Wee.$children('#wee-dom-id', 'li').length, 3,
					'Filtered children were not selected successfully'
				);

				assert.notInclude(Wee.$children('#wee-dom-id', 'li'),
					'<span></span>'
				);
			}
		},
		'$clone': function() {
			Wee.$html('#wee-dom-id',
				'<h1></h1>'
			);

			Wee.$append('#wee-dom-id', Wee.$clone('h1'));

			assert.strictEqual(Wee.$html('#wee-dom-id'),
				'<h1></h1><h1></h1>',
				'Element was not cloned successfully'
			);
		},
		'$closest': function() {
			Wee.$append('#wee-dom-id',
				'<div id="inner"></div>'
			);

			assert.strictEqual(Wee.$closest('#inner', '#wee-dom-id').length, 1,
				'Closest element was identified successfully'
			);

			assert.isArray(Wee.$closest('#inner', '#wee-dom-id'),
				'Closest element was identified successfully'
			);
		},
		'$contains': function() {
			Wee.$html('#wee-dom-id',
				'<span class="testing-contains"></span>'
			);

			assert.ok(Wee.$contains('#wee-dom-id',
				'.testing-contains'),
				'Element was not selected successfully'
			);

			assert.notOk(Wee.$contains('#wee-dom-id',
				'.another'),
				'Element was not selected successfully'
			);

			assert.isFalse(Wee.$contains('#wee-dom-id'),
				'$contains returned boolean true'
			);
		},
		'$contents': function() {
			Wee.$html('#wee-dom-id',
				'<span></span><span></span>'
			);

			assert.strictEqual(Wee.$contents('#wee-dom-id').length, 2,
				'Contents were not selected successfully'
			);

			assert.isArray(Wee.$contents('#wee-dom-id'),
				'Contents were not selected successfully'
			);
		},
		'$css': {
			'get value': function() {
				assert.strictEqual(Wee.$css('#wee-dom-id', 'paddingTop'), '0px',
					'Default value was not retrieved successfully'
				);
			},
			'single': function() {
				Wee.$css('#wee-dom-id', 'fontSize', '10px');

				assert.strictEqual(Wee.$css('#wee-dom-id', 'fontSize'), '10px',
					'Single property was not set successfully'
				);

				assert.strictEqual(Wee.$css('#wee-dom-id', 'paddingTop'), '0px',
					'Single value was not set successfully'
				);
			},
			'multiple': function() {
				Wee.$css('#wee-dom-id', {
					marginTop: '10px',
					marginBottom: '5px'
				});

				assert.strictEqual(Wee.$css('#wee-dom-id', 'marginTop'), '10px',
					'Top margin was not set correctly'
				);

				assert.strictEqual(Wee.$css('#wee-dom-id', 'marginBottom'), '5px',
					'Bottom margin was not set correctly'
				);

				assert.include(Wee.$attr('#wee-dom-id', 'style'),
					'margin-top: 10px; margin-bottom: 5px;',
					'Multiple properties were not set successfully'
				);
			}
		},
		'$data': {
			'beforeEach': function() {
				Wee.$append('#wee-dom-id',
					'<div id="wee-data" data-id="150"' +
					'data-ref="data-reference" data-test="data-test">'
				);
			},
			'afterEach': function() {
				Wee.$remove('#wee-data');
			},
			'get': {
				'all': function() {
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
				'single': function() {
					assert.strictEqual(Wee.$data('#wee-data', 'id'), 150,
						'Data reference was not returned successfully'
					);

					assert.strictEqual(Wee.$data('#wee-data', 'test'),
						'data-test',
						'Data reference was not returned successfully'
					);
				}
			},
			'set': {
				'single': function () {
					Wee.$data('#wee-data', 'id', '250');

					assert.notStrictEqual(Wee.$data('#wee-data', 'id'), 150,
						'Data reference was not set successfully'
					);

					assert.strictEqual(Wee.$data('#wee-data', 'id'), 250,
						'Data reference was not set successfully'
					);
				},
				'multiple': function() {
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
		'$empty': function() {
			Wee.$html('#wee-dom-id',
				'<span class="testing-empty"></span>'
			);

			assert.strictEqual(Wee.$html('#wee-dom-id'),
				'<span class="testing-empty"></span>',
				'Element was not added successfully'
			);

			Wee.$empty('#wee-dom-id');

			assert.strictEqual(Wee.$('.testing-empty').length, 0,
				'Element was not emptied successfully'
			);

			assert.notInclude(Wee.$html('#wee-dom-id'),
				'<span class="testing-empty"></span>',
				'Element was not emptied successfully'
			);
		},
		'$eq': {
			'positive index': function() {
				Wee.$html('#wee-dom-id',
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
				Wee.$html('#wee-dom-id',
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
		'$filter': {
			'selection': function() {
				Wee.$html('#wee-dom-id',
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
			'function': function() {
				Wee.$html('#wee-dom-id',
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
		'$find': function() {
			Wee.$html('#wee-dom-id',
				'<span class="testing-find"></span>' +
				'<span class="testing-find-2"></span>' +
				'<span class="testing-find-2"></span>'
			);

			assert.strictEqual(Wee.$find('#wee-dom-id', '.testing-find').length, 1,
				'Element was not found successfully'
			);

			assert.strictEqual(Wee.$find('#wee-dom-id', '.testing-find-2').length, 2,
				'Element was not found successfully'
			);
		},
		'$hasClass': {
			'single': function() {
				Wee.$addClass('#wee-dom-id', 'test-class');

				assert.ok(Wee.$hasClass('#wee-dom-id', 'test-class'),
					'Class was not detected successfully'
				);

				assert.ok(Wee.$hasClass('#wee-dom-id', 'wee-dom-class'),
					'Class was not detected successfully'
				);
			},
			'multiple': function() {
				Wee.$addClass('#wee-dom-id',
					'test-class test-class-2 test-class-3'
				);

				assert.ok(Wee.$hasClass('#wee-dom-id',
					'test-class test-class-2 test-class-3'
				),
					'Multiple classes were not detected successfully'
				);
			}
		},
		'$height': {
			'beforeEach': function() {
				Wee.$height('#wee-dom-id', '100px');
			},
			'get': function() {
				assert.strictEqual(Wee.$height('#wee-dom-id'), 100,
					'Element height not set successfully'
				);
			},
			'set': function() {
				Wee.$height('#wee-dom-id', '150px');

				assert.strictEqual(Wee.$height('#wee-dom-id'), 150,
					'Element height not set successfully'
				);
			},
			'function': function() {
				Wee.$height('#wee-dom-id', function(i, height) {
					return (height += 50) + 'px';
				});

				assert.strictEqual(Wee.$height('#wee-dom-id'), 150,
					'Element height not set successfully'
				);
			}
		},
		'$hide': function() {
			Wee.$hide('#wee-dom-id');

			assert.ok(Wee.$hasClass('#wee-dom-id', 'js-hide'),
				'Element was not hidden successfully'
			);
		},
		'$html': {
			'get': {
				'single': function() {
					Wee.$html('#wee-dom-id',
						'<h1>Testing</h1>'
					);

					assert.strictEqual(Wee.$html('#wee-dom-id').toLowerCase(),
						'<h1>testing</h1>',
						'HTML "<h1>testing</h1>" was not set correctly'
					);
				},
				'multiple': function() {
					Wee.$html('#wee-dom-id',
						'<span></span><span></span><span></span>'
					);

					Wee.$html('#wee-dom-id span', '1');

					assert.strictEqual(Wee.$html('#wee-dom-id'),
						'<span>1</span><span>1</span><span>1</span>',
						'HTML span values not returned successfully'
					);
				}
			},
			'set': {
				'beforeEach': function() {
					Wee.$append('#wee-dom-id',
						'<h1>Heading One</h1><h2>Heading Two</h2>'
					);
				},
				'single': function() {
					Wee.$html('#wee-dom-id',
						'<h2>New Heading</h2>'
					);

					assert.strictEqual(Wee.$html('#wee-dom-id'),
						'<h2>New Heading</h2>',
						'HTML was not set successfully'
					);
				}
			},
			'function': function() {
				Wee.$append('#wee-dom-id',
					'<h1>Heading One</h1>' +
					'<h2>Heading Two</h2>'
				);

				Wee.$html('#wee-dom-id', function(el, html) {
					return html.toUpperCase();
				});

				assert.strictEqual(Wee.$html('#wee-dom-id'),
					'<h1>HEADING ONE</h1><h2>HEADING TWO</h2>',
					'Function was not executed successfully'
				);
			}
		},
		'$index': function() {
			Wee.$html('#wee-dom-id',
				'<div id="one"></div>' +
				'<div id="two"></div>' +
				'<div id="three"></div>'
			);

			assert.strictEqual(Wee.$index('#three'), 2,
				'Incorrect element index returned'
			);
		},
		'$insertAfter': function() {
			Wee.$html('#wee-dom-id',
				'<div id="wee-inner"></div>'
			);

			var $el = Wee.$parseHTML('<span class="testing-insertafter"></span>');

			Wee.$insertAfter($el, '#wee-inner');

			var $next = Wee.$next('#wee-inner');

			assert.ok(Wee.$hasClass($next, 'testing-insertafter'),
				'Element added successfully.'
			);
		},
		'$insertBefore': function() {
			Wee.$html('#wee-dom-id', '<div id="wee-inner"></div>');

			var $el = Wee.$parseHTML('<span class="testing-insertbefore"></span>');

			Wee.$insertBefore($el, '#wee-inner');

			var $prev = Wee.$prev('#wee-inner');

			assert.ok(Wee.$hasClass($prev, 'testing-insertbefore'),
				'Element was not added before successfully'
			);
		},
		'$is': {
			'selection': function() {
				Wee.$addClass('#wee-dom-id', 'one');

				assert.ok(Wee.$is('#wee-dom-id', '.one'),
					'Element was not successfully identified with "one" class'
				);

				assert.isFalse(Wee.$is('#wee-dom-id'),
					'$is returned false instead of true'
				);
			},
			'function': function() {
				Wee.$html('#wee-dom-id',
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
		'$last': function() {
			Wee.$html('#wee-dom-id',
				'<span>1</span><span>2</span><span>3</span>'
			);

			assert.strictEqual(Wee.$html(Wee.$last('#wee-dom-id span')), '3',
				'Last element content was not returned successfully'
			);
		},
		'$next': function() {
			Wee.$append('body', '<div id="wee-2"></div>');

			assert.strictEqual(Wee.$next('#wee-dom-id')[0].id, 'wee-2',
				'Next element was not returned successfully'
			);

			$('#wee-2').remove();
		},
		'$not': {
			'selection': function() {
				Wee.$html('#wee-dom-id',
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
			'function': function() {
				Wee.$html('#wee-dom-id',
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
		'$offset': {
			'beforeEach': function() {
				Wee.$css('#wee-dom-id', {
					position: 'absolute',
					top: '-10000px',
					left: '-10000px'
				});
			},
			'get': function() {
				assert.deepEqual(Wee.$offset('#wee-dom-id'), {
					top: -10000,
					left: -10000
				},
					'Offset not returned successfully'
				);

				assert.notDeepEqual(Wee.$offset('#wee-dom-id'), {
					top: 10000,
					left: 10000
				},
					'Offset not returned successfully'
				);
			},
			'set': function() {
				Wee.$offset('#wee-dom-id', {
					top: 100,
					left: 20
				});

				assert.deepEqual(Wee.$offset('#wee-dom-id'), {
					top: 100,
					left: 20
				},
					'Offset value was not set successfully'
				);

				assert.notDeepEqual(Wee.$offset('#wee-dom-id'), {
					top: 101,
					left: 22
				},
					'Offset value was not set successfully'
				);
			}
		},
		'$parent': {
			'all': function() {
				var $fixture = Wee.$('#wee-dom-id');

				Wee.$html($fixture, '<span class="fixture-child"></span>');

				assert.deepEqual(Wee.$parent('.fixture-child'), $fixture,
					'Parent was not returned successfully'
				);
			},
			'filtered': function() {
				var $fixture = Wee.$('#wee-dom-id');

				Wee.$html($fixture, '<div class="fixture-child"></div>');

				assert.deepEqual(Wee.$parent('.fixture-child', 'div'), $fixture,
					'Filtered parent was not returned successfully'
				);
			}
		},
		'$parents': function() {
			var $fixture = Wee.$('#wee-dom-id');

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
		'$position': function() {
			var positionValue = {
					top: -10000,
					left: -10000
				};

			Wee.$css('#wee-dom-id', {
				position: 'absolute',
				top: '-10000px',
				left: '-10000px'
			});

			assert.deepEqual(Wee.$position('#wee-dom-id'), positionValue,
				'Position not returned successfully'
			);

			assert.notDeepEqual(Wee.$position('#wee-dom-id'), {
				top: 10000,
				left: 10000
			},
				'Position not returned successfully'
			);

			assert.isObject(Wee.$position('#wee-dom-id'),
				'$position did not return an object'
			);
		},
		'$prepend': {
			'selection': function() {
				Wee.$prepend('#wee-dom-id',
					'<span class="testing"></span>'
				);

				assert.ok(Wee.$contains('#wee-dom-id', '.testing'),
					'Testing element was not prepended successfully'
				);
			},
			'function': function() {
				Wee.$html('#wee-dom-id',
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
		'$prev': function() {
			Wee.$after('#wee-dom-id',
				'<span id="wee-dom-id-2"></span>'
			);

			assert.strictEqual(Wee.$prev('#wee-dom-id-2')[0].id, 'wee-dom-id');
		},
		'$prop': {
			'beforeEach': function() {
				Wee.$html('#wee-dom-id',
					'<input type="text" class="testing">'
				);
			},
			'afterEach': function() {
				Wee.$remove('.testing');
			},
			'get': function() {
				Wee.$prop('.testing', 'checked');

				assert.notOk(Wee.$prop('.testing', 'checked'),
					'Property was selected successfully'
				);
			},
			'single': function() {
				Wee.$prop('.testing', 'disabled', true);

				assert.ok(Wee.$prop('.testing', 'disabled'),
					'Disabled property was not added successfully'
				);
			},
			'multiple': function() {
				Wee.$prop('.testing', {
					'disabled': true,
					'required': true
				});

				assert.ok(Wee.$prop('.testing', 'disabled'),
					'Disabled property was negated successfully.'
				);
				assert.ok(Wee.$prop('.testing', 'required'),
					'Required property was added successfully.'
				);
			}
		},
		'$remove': function() {
			Wee.$html('#wee-dom-id', '<div id="wee-inner"></div>');

			assert.ok(Wee.$html('#wee-dom-id'), '<div id="wee-inner"></div>',
				'Element was not created successfully'
			);

			Wee.$remove('#wee-inner');

			assert.strictEqual(Wee.$html('#wee-dom-id'), '',
				'Element was not removed successfully'
			);
		},
		'$removeAttr': function() {
			Wee.$attr('#wee-dom-id', 'data-test', 'value');
			Wee.$removeAttr('#wee-dom-id', 'data-test');

			assert.strictEqual(Wee.$attr('#wee-dom-id', 'data-test'), null,
				'Attribute was not removed successfully'
			);
		},
		'$removeClass': {
			'single': function() {
				Wee.$removeClass('#wee-dom-id', 'wee');

				assert.notOk(Wee.$hasClass('#wee-dom-id', 'wee'),
					'Single class was not removed successfully'
				);
			},
			'multiple': function() {
				Wee.$addClass('#wee-dom-id', 'wee-2');
				Wee.$addClass('#wee-dom-id', 'wee-3');
				Wee.$addClass('#wee-dom-id', 'peter');

				Wee.$removeClass ('#wee-dom-id', 'wee wee-2 wee-3');

				assert.notInclude(Wee.$attr('#wee-dom-id', 'class'),
					'wee wee-2',
					'Multiple classes were not removed successfully'
				);
			},
			'function': function() {
				Wee.$addClass('#wee-dom-id', 'wee-dom-id0');

				assert.ok(Wee.$hasClass('#wee-dom-id', 'wee-dom-id0'),
					'Class was not added successfully'
				);

				Wee.$removeClass('#wee-dom-id', function(i, className) {
					return className + i;
				});

				assert.notOk(Wee.$hasClass('#wee-dom-id', 'wee-dom-id0'),
					'Indexed class was not removed successfully'
				);
			}
		},
		'$replaceWith': {
			'markup': function() {
				Wee.$replaceWith('#wee-dom-id',
					'<span class="testing-replacewith"></span>'
				);

				assert.strictEqual(Wee.$('#wee-dom-id').length, 0,
					'Fixture was not removed successfully'
				);

				assert.strictEqual(Wee.$('.testing-replacewith').length, 1,
					'Testing element was not added successfully'
				);

				Wee.$replaceWith('.testing',
					'<div id="wee" class="wee"></div>'
				);
			},
			'function': function() {
				Wee.$html('#wee-dom-id',
					'<ul class="names">' +
						'<li>John Doe</li>' +
					'</ul>');

				Wee.$replaceWith('.names li', function(i, html) {
				    return '<li>The ' + html + '</li>';
				});

				assert.strictEqual(Wee.$html('#wee-dom-id li'), 'The John Doe',
					'Function was not executed successfully'
				);
			}
		},
		'$scrollLeft': {
			'get': function() {
				assert.strictEqual(Wee.$scrollLeft(), 0,
					'Scroll left value not retreived successfully'
				);
			},
			'set': function() {
				Wee.$css('#wee-dom-id', 'width', '15000px');

				Wee.$scrollLeft('body', 10);

				assert.strictEqual(Wee.$scrollLeft(), 10,
					'Scroll left value not set successfully'
				);
			}
		},
		'$scrollTop': {
			'get': function() {
				assert.strictEqual(Wee.$scrollTop(), 0,
					'Scroll top value not retreived successfully'
				);
			},
			'set': function() {
				Wee.$css('#wee-dom-id', 'height', '500px');

				Wee.$scrollTop('body', 10);

				assert.strictEqual(Wee.$scrollTop(), 10,
					'Scroll top value not set successfully'
				);
			}
		},
		'$serializeForm': function() {
			Wee.$html('#wee-dom-id',
				'<form action="#" id="wee-form">' +
					'<input type="text" name="input" value="inputValue">' +
					'<input type="checkbox" name="checkbox" value="checkboxValue" checked>' +
					'<input type="radio" name="radio1" value="radioValue" checked>' +
					'<select name="select">' +
						'<option value="selectValue1" checked>Option 1</option>' +
						'<option value="selectValue2">Option 2</option>' +
					'</select>' +
					'<select name="optgroup">' +
						'<optgroup>' +
							'<option value="optgroupValue1" checked>Optgroup 1</option>' +
							'<option value="optgroupValue2">Optgroup 2</option>' +
						'</optgroup>' +
					'</select>' +
					'<textarea name="textarea">' +
					'Text Area' +
					'</textarea>' +
				'</form>'
			);

			var serializedValue = 'input=inputValue&checkbox=checkboxValue' +
				'&radio1=radioValue&select=selectValue1&' +
				'optgroup=optgroupValue1&textarea=Text+Area';

			assert.strictEqual(Wee.$serializeForm('#wee-form'), serializedValue,
				'Form was not serialized successfully'
			);
		},
		'$show': function() {
			Wee.$hide('#wee-dom-id');

			assert.ok(Wee.$hasClass('#wee-dom-id', 'js-hide'),
				'Element was not hidden successfully'
			);

			Wee.$show('#wee-dom-id');

			assert.notOk(Wee.$hasClass('#wee-dom-id', 'js-hide'),
				'Element was not shown successfully'
			);
		},
		'$siblings': {
			'beforeEach': function() {
				Wee.$html('#wee-dom-id',
					'<p></p>' +
					'<span></span>' +
					'<div id="target-div"></div>'
				);
			},
			'all': function() {
				assert.strictEqual(Wee.$siblings('#target-div').length, 2,
					'All siblings were not retrieved successfully'
				);

				assert.isArray(Wee.$siblings('#target-div'),
					'$siblings did not return an array'
				);
			},
			'filtered': function() {
				assert.strictEqual(Wee.$siblings('#target-div', 'p').length, 1,
					'Filtered siblings were not retrieved successfully'
				);

				assert.isArray(Wee.$siblings('#target-div', 'p'),
					'$siblings did not return an array'
				);
			}
		},
		'$slice': function() {
			Wee.$html('#wee-dom-id',
				'<span>1</span><span>2</span><span>3</span>'
			);

			assert.strictEqual(Wee.$html(Wee.$slice('#wee-dom-id span', 1, 2)), '2',
				'Second element was not selected successfully'
			);
		},
		'$text': {
			'beforeEach': function() {
				Wee.$text('#wee-dom-id', 'Wee Test');
			},
			'get': function() {
				assert.strictEqual(Wee.$text('#wee-dom-id'), 'Wee Test',
					'Text was not retreived successfully'
				);
			},
			'set': function() {
				Wee.$text('#wee-dom-id', 'Testing 123');

				assert.strictEqual(Wee.$text('#wee-dom-id'), 'Testing 123',
					'Element text was not set successfully'
				);
			}
		},
		'$toggle': function() {
			Wee.$toggle('#wee-dom-id');

			assert.ok(Wee.$hasClass('#wee-dom-id', 'js-hide'),
				'Element was not hidden successfully'
			);

			Wee.$toggle('#wee-dom-id');

			assert.notOk(Wee.$hasClass('#wee-dom-id', 'js-hide'),
				'Element was not shown successfully'
			);
		},
		'$toggleClass': {
			'single': function() {
				Wee.$toggleClass('#wee-dom-id', 'test-class');

				assert.ok(Wee.$hasClass('#wee-dom-id', 'test-class'),
					'Class was not added successfully'
				);

				Wee.$toggleClass('#wee-dom-id', 'test-class');

				assert.notOk(Wee.$hasClass('#wee-dom-id', 'test-class'),
					'Class was not removed successfully'
				);
			},
			'multiple': function() {
				Wee.$toggleClass('#wee-dom-id', 'test-class test-class-2');

				assert.strictEqual(Wee.$attr('#wee-dom-id', 'class'),
					'wee-dom-class test-class test-class-2',
					'Multiple classes were not toggled successfully'
				);

				Wee.$toggleClass('#wee-dom-id', 'test-class test-class-2');

				assert.notStrictEqual(Wee.$attr('#wee-dom-id', 'class'),
					'wee-dom-class test-class test-class-2',
					'Multiple classes were not toggled successfully'
				);

				assert.notOk(Wee.$hasClass('#wee-dom-id', 'test-class'),
					'Multiple classes were not toggled successfully'
				);

				assert.notOk(Wee.$hasClass('#wee-dom-id', 'test-class-2'),
					'Multiple classes were not toggled successfully'
				);

			},
			'function': function() {
				Wee.$toggleClass('#wee-dom-id', function() {
					return Wee.$addClass('#wee-dom-id', 'test');
				});

				assert.ok(Wee.$hasClass('#wee-dom-id', 'test'),
					'Function was not executed successfully'
				);
			}
		},
		'$val': {
			'beforeEach': function() {
				Wee.$html('#wee-dom-id',
					'<input type="text" class="testing" value="test">'
				);
			},
			'get': function() {
				assert.strictEqual(Wee.$val('.testing'),
					'test',
					'Value was not retrieved successfully'
				);
			},
			'set': function() {
				Wee.$val('.testing', 'testing');

				assert.strictEqual(Wee.$val('.testing'), 'testing',
					'Value was not set successfully'
				);
			},
			'function': function() {
				Wee.$val('.testing', function(i, value, html) {
					if (value.length > 3) {
						return Wee.$html('#wee-dom-id', '<p>' + value + '</p>');
					}
				});

				assert.ok(Wee.$html('#wee-dom-id p'), 'test',
					'Function was not executed successfully'
				);
			}
		},
		'$width': {
			'beforeEach': function() {
				Wee.$width('#wee-dom-id', '100px');
			},
			'get': function() {
				assert.strictEqual(Wee.$width('#wee-dom-id'), 100,
					'Element width not set successfully'
				);
			},
			'set': function() {
				Wee.$width('#wee-dom-id', '200px');

				assert.strictEqual(Wee.$width('#wee-dom-id'), 200,
					'Element width not set successfully'
				);
			},
			'function': function() {
				Wee.$width('#wee-dom-id', function(i, width) {
					return (width += 50) + 'px';
				});

				assert.strictEqual(Wee.$width('#wee-dom-id'), 150,
					'Element width not set successfully'
				);
			}
		},
		'$wrap': {
			'markup': function() {
				Wee.$append('#wee-dom-id', '<div id="wee-dom-id-inner"></div>');

				Wee.$wrap('#wee-dom-id-inner', '<div id="wrapper"></div>');

				assert.strictEqual(Wee.$parent('#wee-dom-id-inner')[0].id, 'wrapper',
					'Element was not wrapped successfully'
				);
			},
			'function': function() {
				Wee.$html('#wee-dom-id',
					'<div id="test-wrap-1" class="test-wrap-1"></div>'
				);

				Wee.$wrap('#test-wrap-1', function() {
					if (Wee.$hasClass($(this), 'test-wrap-1')) {
						return '<div class="test-wrap-2"></div>';
					}
				});

				assert.ok(Wee.$parent('.test-wrap-1', '.test-wrap-2'),
					'Function was not executed successfully'
				);
			}
		},
		'$wrapInner': {
			'markup': function() {
				Wee.$append('#wee-dom-id',
					'<div id="test"></div>'
				);

				Wee.$wrapInner('#test', '<div id="test-2"></div>');

				assert.ok(Wee.$siblings('#test', '#test-2'),
					'Element was not wrapped successfully'
				);
			},
			'function': function() {
				Wee.$append('#wee-dom-id',
					'<div id="test" class="test"></div>'
				);

				Wee.$wrapInner('#test', function() {
					if (Wee.$hasClass($(this), 'test')) {
						return '<div id="test-2"></div>';
					}
				});

				assert.ok(Wee.$parent('#test-2', '#test'));
			}
		}
	});
});