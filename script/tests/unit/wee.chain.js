define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	require('script/wee.events.js');
	require('script/wee.chain.js');
	require('script/chain/wee.chain.dom.js');
	require('script/chain/wee.chain.events.js');
	require('script/chain/wee.chain.view.js');


	registerSuite({
		name: 'Wee Chain',

		beforeEach: function() {
			var fixtureOne = document.createElement('div');

			fixtureOne.id = 'wee-chain-id';
			fixtureOne.className = 'wee-chain-class';

			document.body.appendChild(fixtureOne);
		},
		afterEach: function() {
			$('#wee-chain-id').remove();
		},
		'register': function() {
			$.fn.setId = function(id) {
				this.data('id', id);

				return this;
			};

			$('#wee-chain-id').setId(3);

			assert.strictEqual(Wee.$data('#wee-chain-id', 'id'), 3,
				'Chain was not registered successfully'
			);
		},
		'events': {
			'$(sel).on()': {
				'simple': function() {
					$('#wee-chain-id').on('click', function() {
						$(this).addClass('test-class-1');
					});

					$('#wee-chain-id').trigger('click');

					assert.ok(Wee.$hasClass('#wee-chain-id', 'test-class-1'),
						'Event was not bound successfully'
					);
				},
				'delegation': function() {
					Wee.$append('#wee-chain-id', '<span class="test-class"></span>');

					$('.test-class').on('click', function() {
						Wee.$addClass('.test-class', 'test-class-2');
					}, {
					    delegate: '#wee-chain-id'
					});

					Wee.events.trigger('.test-class', 'click');

					assert.ok(Wee.$hasClass('.test-class', 'test-class-2'),
						'Event was not delegated successfully'
					);
				},
				'multiple events': function() {
					$('#wee-chain-id').on({
						click: function() {
							Wee.$addClass('#wee-chain-id', 'test-class');
						},
						blur: function() {
							Wee.$removeClass('#wee-chain-id', 'test-class');
							Wee.$addClass('#wee-chain-id', 'test-class-2');
						}
					});

					Wee.events.trigger('#wee-chain-id', 'click');
					Wee.events.trigger('#wee-chain-id', 'blur');

					assert.ok(Wee.$hasClass('#wee-chain-id', 'test-class-2'),
						'Multple events were not triggered successfully'
					);
				}
			},
			'$(sel).off()': {
				'target': function() {
					Wee.events.on({
						'#wee-chain-id': {
							click: function() {
								Wee.$addClass('#wee-chain-id', 'test-class');
							},
							blur: function() {
								Wee.$addClass('#wee-chain-id-inner', 'test-class-2');
							}
						}
					});

					$('#wee-chain-id').off();

					Wee.events.trigger('#wee-chain-id', 'click');
					Wee.events.trigger('#wee-chain-id', 'blur');

					assert.notOk(Wee.$hasClass('#wee-chain-id', 'test-class'),
						'Event was not removed successfully'
					);
					assert.notOk(Wee.$hasClass('#wee-chain-id', 'test-class-2'),
						'Event was not removed successfully'
					);
				},
				'selection event': function() {
					Wee.events.on({
						'#wee-chain-id': {
							click: function() {
								Wee.$addClass('#wee-chain-id', 'test-class');
							},
							blur: function() {
								Wee.$addClass('#wee-chain-id', 'test-class-2');
							}
						}
					});

					$('#wee-chain-id').off('blur');

					Wee.events.trigger('#wee-chain-id', 'click');
					Wee.events.trigger('#wee-chain-id', 'blur');

					assert.ok(Wee.$hasClass('#wee-chain-id', 'test-class'),
						'Event was not removed successfully'
					);
					assert.notOk(Wee.$hasClass('#wee-chain-id', 'test-class-2'),
						'Event was not removed successfully'
					);
				},
				'selection event callback': function() {
					var callbackFunction = function() {
						Wee.$removeClass('#wee-chain-id', 'test-class');
					};

					$('#wee-chain-id').on('click', function() {
						Wee.$addClass('#wee-chain-id', 'test-class');
					});

					Wee.events.trigger('#wee-chain-id', 'click');

					$('#wee-chain-id').off('click', callbackFunction());

					assert.notOk(Wee.$hasClass('#wee-chain-id', 'test-class-2'),
						'Callback function was not executed successfully'
					);
				}
			},
			'$(sel).trigger()': function() {
				$('#wee-chain-id').on('click', function() {
					Wee.$addClass('#wee-chain-id', 'test-class');
				});

				$('#wee-chain-id').trigger('click');

				assert.ok(Wee.$hasClass('#wee-chain-id', 'test-class'),
					'Event was not triggered successfully'
				);
			}
		},
		'DOM': {
			'$(sel).addClass': {
				'single': function() {
					$('#wee-chain-id').addClass('test-class');

					assert.ok(Wee.$hasClass('#wee-chain-id', 'test-class'),
						'Single class was not added successfully'
					);

					assert.ok(Wee.$hasClass('#wee-chain-id', 'wee-chain-class'),
						'Single class was not added successfully'
					);
				},
				'multiple': function() {
					$('#wee-chain-id').addClass('test-class-1 test-class-2 test-class-3');

					assert.include(Wee.$attr('#wee-chain-id', 'class'),
						'test-class-1 test-class-2 test-class-3',
						'Multiple classes were not added successfully'
					);

					assert.ok(Wee.$hasClass('#wee-chain-id',
						'wee-chain-class test-class-1 test-class-2 test-class-3'),
						'Multiple classes were not added successfully'
					);
				}
			},
			'$(sel).after': {
				'markup': function() {
					$('#wee-chain-id').after('<span class="testing"></span>');

					var $prev = Wee.$next('#wee-chain-id');

					assert.ok(Wee.$hasClass($prev, 'testing'),
						'Testing element added after successfully.'
					);
				},
				'function': function() {
					$('#wee-chain-id').after(function() {
						Wee.$addClass('#wee-chain-id', 'test');
					});

					assert.ok(Wee.$hasClass('#wee-chain-id', 'test'),
						'Function was not executed successfully'
					);
				}
			},
			'$(sel).append': {
				'selection': function() {
					$('#wee-chain-id').append('<span class="testing-append"></span>');

					assert.ok(Wee.$contains('#wee-chain-id', '.testing-append'),
						'Testing element was not appended successfully'
					);

					$('.testing-append').remove();
				},
				'function': function() {
					$('#wee-chain-id').append('<h1></h1>');

					$('#wee-chain-id').append(function() {
						return Wee.$append('h1', 'Test');
					});

					assert.strictEqual(Wee.$html('h1'), 'Test',
						'Append function was not executed successfully'
					);
				}
			},
			'$(sel).appendTo': function() {
				var appendFixture = '<div id="test"></div>';

				$(appendFixture).appendTo('#wee-chain-id');

				assert.ok($('#wee-chain-id').parent(), appendFixture,
					'Element was not appended to element successfully'
				);
			},
			'$(sel).attr': {
				'get': function() {
					$('#wee-chain-id').html(
						'<a id="wee-link" href="https://www.weepower.com">Wee</a>'
					);

					assert.strictEqual($('#wee-link').attr('href'),
						'https://www.weepower.com',
						'Attribute not was accessed successfully'
					);
				},
				'single': function() {
					$('#wee-chain-id').html(
						'<a id="wee-link" href="https://www.weepower.com">Wee</a>'
						);

					assert.strictEqual($('#wee-link').attr('id'), 'wee-link',
						'Attribute not was accessed successfully'
					);
				},
				'multiple': function() {
					$('#wee-chain-id').html('<a id="wee-link" href="https://www.google.com"' +
						'data-ref="data-reference">Wee</a>');

					assert.strictEqual(Wee.$attr('#wee-link', 'href'), 'https://www.google.com',
						'Attribute not was accessed successfully'
					);

					assert.strictEqual(Wee.$attr('#wee-link', 'data-ref'), 'data-reference',
						'Attribute was not accessed successfully'
					);
				}
			},
			'$(sel).before': {
				'markup': function() {
					$('#wee-chain-id').before('<span class="testing"></span>');

					var $prev = Wee.$prev('#wee-chain-id');

					assert.ok(Wee.$hasClass($prev, 'testing'),
						'Testing element was not added before successfully'
					);
				},
				'function': function() {
					$('#wee-chain-id').before(function() {
						Wee.$addClass('#wee-chain-id', 'test');
					});

					assert.ok(Wee.$hasClass('#wee-chain-id', 'test'),
						'Function was not executed successfully'
					);
				}
			},
			'$(sel).children': {
				'all': function() {
					Wee.$html('#wee-chain-id', '<span></span><span></span>');

					assert.strictEqual(Wee.$children('#wee-chain-id').length, 2,
						'Children were not selected successfully'
					);
				},
				'filtered': function() {
					Wee.$html('#wee-chain-id', '<li></li>li<li></li><li></li>');

					assert.strictEqual($('#wee-chain-id').children('li').length, 3,
						'Filtered children were not selected successfully'
					);
				}
			},
			'$(sel).clone': function() {
				Wee.$html('#wee-chain-id', '<h1>testing</h1>');

				var $clone = $('#wee-chain-id').clone();

				assert.strictEqual(Wee.$html($clone),
					'<h1>testing</h1>',
					'Element was not cloned successfully'
				);
			},
			'$(sel).closest': function() {
				Wee.$append('#wee-chain-id', '<div id="inner"></div>');

				assert.strictEqual($('#inner').closest('#wee-chain-id').length, 1,
					'Another element not available'
				);
			},
			'$(sel).contains': function() {
				Wee.$html('#wee-chain-id', '<span class="testing"></span>');

				assert.ok($('#wee-chain-id').contains('.testing'),
					'Testing element was not selected successfully'
				);

				assert.notOk($('#wee-chain-id').contains('.another'),
					'Another element not available'
				);
			},
			'$(sel).contents': function() {
				Wee.$html('#wee-chain-id', '<span></span><span></span>');

				assert.strictEqual($('#wee-chain-id').contents().length, 2,
					'Contents were not selected successfully'
				);
			},
			'$(sel).css': {
				'get value': function() {
					assert.strictEqual($('#wee-chain-id').css('paddingTop'), '0px',
						'Default value was not retrieved successfully'
					);

					assert.notStrictEqual($('#wee-chain-id').css('paddingTop'), '10px',
						'Default value was not retrieved successfully'
					);
				},
				'single': function() {
					$('#wee-chain-id').css('fontSize', '10px');

					assert.strictEqual(Wee.$css('#wee-chain-id', 'fontSize'), '10px',
						'Single property was not set correctly'
					);
				},
				'multiple': function() {
					Wee.$css('#wee-chain-id', {
						marginTop: '10px',
						marginBottom: '5px'
					});

					assert.strictEqual($('#wee-chain-id').css('marginTop'), '10px',
						'Top margin was not set correctly'
					);

					assert.strictEqual($('#wee-chain-id').css('marginBottom'), '5px',
						'Bottom margin was not set correctly'
					);

					assert.include($('#wee-chain-id').attr('style'),
						'margin-top: 10px; margin-bottom: 5px;',
						'Multiple properties were not set successfully'
					);
				}
			},
			'$(sel).data': {
				'beforeEach': function() {
					Wee.$append('#wee-chain-id', '<div id="wee-data" data-id="150"' +
						'data-ref="data-reference" data-test="data-test">'
					);
				},
				'afterEach': function() {
					Wee.$remove('#wee-data');
				},
				'get': {
					'all': function() {
						var weeData = $('#wee-data').data(),
							dataObject = {
								id: 150,
								ref: 'data-reference',
								test: 'data-test'
							};

						assert.deepEqual(weeData, dataObject,
							'Data references were not selected successfully'
						);
					},
					'single': function() {
						assert.strictEqual($('#wee-data').data('id'), 150,
							'Data reference was not selected successfully'
						);
					}
				},
				'set': {
					'single': function () {
						Wee.$data('#wee-data', 'id', '250');

						assert.strictEqual($('#wee-data').data('id'), 250,
							'Data reference was not set successfully'
						);
					},
					'multiple': function() {
						$('#wee-data').data({
							id: 350,
							ref: 'reference',
							test: 'failed'
						});

						var weeData = $('#wee-data').data(),
							dataObject = {
								id: 350,
								ref: 'reference',
								test: 'failed'
							};

						assert.deepEqual(weeData, dataObject,
							'Data references were not set successfully'
						);
					}
				}
			},
			'$(sel).empty': function() {
				Wee.$html('#wee-chain-id', '<span class="testing-empty"></span>');

				assert.strictEqual(Wee.$html('#wee-chain-id'),
					'<span class="testing-empty"></span>',
					'Element was not added successfully'
				);

				$('#wee-chain-id').empty();

				assert.strictEqual(Wee.$('.testing-empty').length, 0,
					'Element was not emptied successfully'
				);

				assert.notInclude(Wee.$html('#wee-chain-id'),
					'<span class="testing-empty"></span>',
					'Element was not emptied successfully'
				);
			},
			'$(sel).eq': {
				'positive index': function() {
					Wee.$html('#wee-chain-id',
						'<div class="testing-eq-pos">1</div>' +
						'<div class="testing-eq-pos">2</div>' +
						'<div class="testing-eq-pos">3</div>'
					);

					var el = $('.testing-eq-pos').eq(1);

					assert.strictEqual(Wee.$text(el), '2',
						'Element with index 1 was not selected successfully.'
					);
				},
				'negative index': function() {
					Wee.$html('#wee-chain-id',
						'<div class="testing-eq-neg">1</div>' +
						'<div class="testing-eq-neg">2</div>' +
						'<div class="testing-eq-neg">3</div>'
					);

					var el = $('.testing-eq-neg').eq(-1);

					assert.strictEqual(Wee.$text(el), '3',
						'Element with index 3 was not selected successfully.'
					);
				}
			},
			'$(sel).filter': function() {
				Wee.$html('#wee-chain-id',
					'<span class="testing-filter one"></span>' +
					'<span class="testing-filter two"></span>' +
					'<span class="testing-filter three"></span>'
				);

				assert.strictEqual($('.testing-filter').filter('.one').length, 1,
					'Filtered elements not returned successfully'
				);

				assert.isObject($('.testing-filter').filter('.one'),
					'$(sel).filter did not return an array'
				);
			},
			'$(sel).find': function() {
				Wee.$html('#wee-chain-id',
					'<span class="testing-find"></span>' +
					'<span class="testing-find-2"></span>' +
					'<span class="testing-find-2"></span>'
				);

				assert.strictEqual($('#wee-chain-id').find('.testing-find').length, 1,
					'Element was not found successfully'
				);

				assert.strictEqual($('#wee-chain-id').find('.testing-find-2').length, 2,
					'Element was not found successfully'
				);
			},
			'$(sel).first': function() {
				Wee.$html('#wee-chain-id',
					'<div class="testing-first">1</div>' +
					'<div class="testing-first">2</div>' +
					'<div class="testing-first">3</div>'
				);

				var el = $('.testing-first').first();

				assert.strictEqual(Wee.$text(el), '1',
					'First element was selected not successfully.'
				);
			},
			'$(sel).get': function() {
				assert.isNull($.get('456-var'),
					'Variable "var-456" is not currently null.'
				);

				assert.isNull($.get('456 var'),
					'Variable "456 var" is not currently null.'
				);

				assert.strictEqual($.get('var-456', 'string'), 'string',
					'Variable "var-456" is not returned as the default "string".'
				);

				assert.isNull($.get('var-456'),
					'Variable "var-456" is still not correctly set to null.'
				);

				assert.strictEqual($.get('cont:var-456', 'string'), 'string',
					'Variable "var-456" is not returned as the default' +
					'"string" in the "cont" namespace.'
				);

				assert.strictEqual($.get('456 var', 'Testing 456'), 'Testing 456',
					'Variable "456 var" is not returned as the default "Testing 456".'
				);

				assert.strictEqual($.get('var-456', function() {
						return 'string';
					}), 'string',
					'Variable "var-456" is not returned as the default "string".'
				);
			},
			'$(sel).hasClass': {
				'single': function() {
					Wee.$addClass('#wee-chain-id', 'test-class');

					assert.ok($('#wee-chain-id').hasClass('test-class'),
						'Class was not detected successfully'
					);

					assert.ok($('#wee-chain-id').hasClass('wee-chain-class'),
						'Class was not detected successfully'
					);
				},
				'multiple': function() {
					Wee.$addClass('#wee-chain-id', 'test-class test-class-2 test-class-3');

					assert.ok($('#wee-chain-id').hasClass(
						'test-class test-class-2 test-class-3'
					),
						'Class was not detected successfully'
					);
				}
			},
			'$(sel).height': {
				'beforeEach': function() {
					Wee.$height('#wee-chain-id', '100px');
				},
				'get': function() {
					assert.strictEqual($('#wee-chain-id').height(), 100,
						'Element height not set successfully'
					);
				},
				'set': function() {
					Wee.$height('#wee-chain-id', '150px');

					assert.strictEqual($('#wee-chain-id').height(), 150,
						'Element height not set successfully'
					);
				},
				'function': function() {
					$('#wee-chain-id').height(function(i, height) {
						return (height += 50) + 'px';
					});

					assert.strictEqual(Wee.$height('#wee-chain-id'), 150,
						'Element height not set successfully'
					);
				}
			},
			'$(sel).hide': function() {
				$('#wee-chain-id').hide();

				assert.ok(Wee.$hasClass('#wee-chain-id', 'js-hide'),
					'Element was not hidden successfully'
				);
			},
			'$(sel).html': {
				'get': {
					'single': function() {
						$('#wee-chain-id').html('<h1>Testing</h1>');

						assert.strictEqual(Wee.$html('#wee-chain-id').toLowerCase(),
							'<h1>testing</h1>',
							'HTML "<h1>testing</h1>" was not set correctly'
						);
					},
					'multiple': function() {
						$('#wee-chain-id').html(
							'<span></span><span></span><span></span>'
						);

						$('#wee-chain-id span').html('1');

						assert.strictEqual(Wee.$html('#wee-chain-id').toLowerCase(),
							'<span>1</span><span>1</span><span>1</span>',
							'HTML span values not returned successfully'
						);
					}
				},
				'set': {
					'beforeEach': function() {
						Wee.$append('#wee-chain-id', '<h1>Heading One</h1><h2>Heading Two</h2>');
					},
					'single': function() {
						$('#wee-chain-id').html('<h2>New Heading</h2>');

						assert.strictEqual(Wee.$html('#wee-chain-id'),
							'<h2>New Heading</h2>',
							'HTML was not set successfully'
						);
					}
				},
				'beforeEach': function() {
					Wee.$append('#wee-chain-id',
						'<h1>Heading One</h1>' +
						'<h2>Heading Two</h2>'
					);
				},
				'function': function() {
					$('#wee-chain-id').html(function(el, html) {
						return html.toUpperCase();
					});

					assert.strictEqual(Wee.$html('#wee-chain-id'),
						'<h1>HEADING ONE</h1><h2>HEADING TWO</h2>',
						'Function was not executed successfully'
					);
				}
			},
			'$(sel).index': function() {
				Wee.$html('#wee-chain-id',
					'<div id="one"></div>' +
					'<div id="two"></div>' +
					'<div id="three"></div>'
				);

				assert.strictEqual($('#three').index(), 2,
					'Incorrect element index returned'
				);

			},
			'$(sel).insertAfter': function() {
				Wee.$html('#wee-chain-id', '<div id="wee-inner"></div>');

				var $el = Wee.$parseHTML('<span class="testing-insertafter"></span>');

				$($el).insertAfter('#wee-inner');

				var $next = Wee.$next('#wee-inner');

				assert.ok(Wee.$hasClass($next, 'testing-insertafter'),
					'Element added successfully.'
				);
			},
			'$(sel).insertBefore': function() {
				Wee.$html('#wee-chain-id', '<div id="wee-inner"></div>');

				var $el = Wee.$parseHTML('<span class="testing-insertbefore"></span>');

				$($el).insertBefore('#wee-inner');

				var $prev = Wee.$prev('#wee-inner');

				assert.ok(Wee.$hasClass($prev, 'testing-insertbefore'),
					'Element was not added before successfully'
				);
			},
			'$(sel).is': {
				'selection': function() {
					Wee.$addClass('#wee-chain-id', 'one');

					assert.ok($('#wee-chain-id').is('.one'),
						'Element was not successfully identified with "one" class'
					);

					assert.isFalse($('#wee-chain-id').is(),
						'$is returned false instead of true'
					);
				},
				'function': function() {
					Wee.$html('#wee-chain-id',
						'<ul class="people">' +
						    '<li data-hidden="false">Charlie Kelly</li>' +
						    '<li data-hidden="true">Dennis Reynolds</li>' +
						    '<li data-hidden="false">Mac</li>' +
						    '<li data-hidden="false">Dee Reynolds</li>' +
						'</ul>'
					);

					var isFunction = $('.people li').is(function(i, el) {
							return Wee.$data(el, 'hidden');
						});

					assert.isTrue(isFunction,
						'Function executed successfully'
					);
				}
			},
			'$(sel).last': function() {
				Wee.$html('#wee-chain-id',
					'<span>1</span><span>2</span><span>3</span>'
				);

				assert.strictEqual(Wee.$html($('#wee-chain-id span').last()), '3',
					'Last element content was not returned successfully'
				);
			},
			'$(sel).next': function() {
				Wee.$append('body', '<div id="wee-chain-2"></div>');

				assert.strictEqual($('#wee-chain-id').next()[0].id, 'wee-chain-2',
					'Next element was not returned successfully'
				);

				$('#wee-chain-id-2').remove();
			},
			'$(sel).not': {
				'selection': function() {
					Wee.$html('#wee-chain-id',
						'<span class="testing-not one"></span>' +
						'<span class="testing-not two"></span>' +
						'<span class="testing-not three"></span>'
					);

					var $elements = Wee.$('.testing-not');

					assert.isObject($($elements).not('.one'));

					assert.strictEqual(Wee.$not($elements, '.one').length, 2,
						'Filtered elements not retuned successfully'
					);
				},
				'function': function() {
					Wee.$html('#wee-chain-id',
						'<ul class="people">' +
						    '<li data-hidden="false">Charlie Kelly</li>' +
						    '<li data-hidden="true">Dennis Reynolds</li>' +
						    '<li data-hidden="false">Mac</li>' +
						    '<li data-hidden="false">Dee Reynolds</li>' +
						'</ul>'
					);

					var notFunction = $('.people li').not(function(i, el) {
							return Wee.$data(el, 'hidden') === true;

						});

					assert.isObject(notFunction,
						'$not did not return an array'
					);

					assert.strictEqual(notFunction.length, 3,
						'Incorrect values were returned'
					);
				}
			},
			'$(sel).offset': {
				'beforeEach': function() {
					Wee.$css('#wee-chain-id', {
						position: 'absolute',
						top: '-10000px',
						left: '-10000px'
					});
				},
				'get': function() {
					assert.deepEqual($('#wee-chain-id').offset(), {
						top: -10000,
						left: -10000
					},
						'Offset not returned successfully'
					);

					assert.notDeepEqual($('#wee-chain-id').offset(), {
						top: 10000,
						left: 10000
					},
						'Offset not returned successfully'
					);
				},
				'set': function() {
					$('#wee-chain-id').offset({
						top: 100,
						left: 20
					});

					assert.deepEqual($('#wee-chain-id').offset(), {
						top: 100,
						left: 20
					},
						'Offset value was not set successfully'
					);

					assert.notDeepEqual($('#wee-chain-id').offset(), {
						top: 101,
						left: 22
					},
						'Offset value was not set successfully'
					);
				}

			},
			'$(sel).parent': {
				'all': function() {
					var $fixture = Wee.$('#wee-chain-id');

					Wee.$html($fixture, '<span class="fixture-child"></span>');

					assert.deepEqual(Wee.$parent('.fixture-child'), $fixture,
						'Parent was not returned successfully'
					);
				},
				'filtered': function() {
					var $fixture = Wee.$('#wee-chain-id');

					Wee.$html($fixture, '<div class="fixture-child"></div>');

					assert.deepEqual(Wee.$parent('.fixture-child', 'div'), $fixture,
						'Filtered parent was not returned successfully'
					);
				}
			},
			'$(sel).parents': function() {
				var $fixture = Wee.$('#wee-chain-id');

				Wee.$html($fixture,
					'<span id="child">' +
						'<span id="child-2">' +
							'<span id="child-3"></span>' +
						'</span>' +
					'</span>'
				);

				assert.strictEqual($('#child-3').parents().length, 5,
					'Parents were not returned successfully'
				);

				assert.strictEqual($('#child-2').parents().length, 4,
					'Parents were not returned successfully'
				);

				assert.isObject($('#child-3').parents(),
					'$parents did not return an array'
				);
			},
			'$(sel).position': function() {
				var positionValue = {
						top: -10000,
						left: -10000
					};

				Wee.$css('#wee-chain-id', {
					position: 'absolute',
					top: '-10000px',
					left: '-10000px'
				});

				assert.deepEqual($('#wee-chain-id').position(), positionValue,
					'Position not returned successfully'
				);

				assert.notDeepEqual($('#wee-chain-id').position(), {
					top: 10000,
					left: 10000
				},
					'Position not returned successfully'
				);

				assert.isObject($('#wee-chain-id').position(),
					'$position did not return an object'
				);
			},
			'$(sel).prepend': {
				'selection': function() {
					$('#wee-chain-id').prepend('<span class="testing"></span>');

					assert.ok(Wee.$contains('#wee-chain-id', '.testing'),
						'Testing element was not prepended successfully'
					);
				},
				'function': function() {
					Wee.$html('#wee-chain-id',
						'<h1 id="list-heading"></h1>' +
						'<ul id="wee-list">' +
							'<li>Dee Reynolds</li>' +
							'<li>Frank Reynolds</li>' +
						'</ul>'
					);

					$('#list-heading').prepend(function() {
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
			'$(sel).prependTo': function() {
				var prependFixture = '<div id="test"></div>';

				$('#wee-chain-id').html('<div id="wee-inner"></div>');

				$(prependFixture).prependTo('#wee-inner');

				assert.ok($('#wee-chain-id-inner').parent(), prependFixture,
					'Element was not appended to element successfully'
				);
			},
			'$(sel).prev': function() {
				Wee.$after('#wee-dom-id',
					'<span id="wee-dom-id-2"></span>'
				);

				assert.strictEqual($('#wee-dom-id-2').prev().length, 1);
			},
			'$(sel).prop': {
				'beforeEach': function() {
					Wee.$html('#wee-chain-id',
						'<input type="text" class="testing">'
					);
				},
				'afterEach': function() {
					Wee.$remove('.testing');
				},
				'get': function() {
					$('.testing').prop('checked');

					assert.notOk($('.testing').prop('checked'),
						'Property was selected successfully'
					);
				},
				'single': function() {
					$('.testing').prop('disabled', true);

					assert.ok($('.testing').prop('disabled'),
						'Disabled property was not added successfully'
					);
				},
				'multiple': function() {
					$('.testing').prop({
						'disabled': true,
						'required': true
					});

					assert.ok($('.testing').prop('disabled'),
						'Disabled property was negated successfully.'
					);
					assert.ok($('.testing').prop('required'),
						'Required property was added successfully.'
					);
				}
			},
			'$(sel).remove': function() {
				Wee.$html('#wee-chain-id', '<div id="wee-inner"></div>');

				assert.ok(Wee.$html('#wee-chain-id'), '<div id="wee-inner"></div>',
					'Element was not created successfully'
				);

				$('#wee-inner').remove();

				assert.strictEqual(Wee.$html('#wee-chain-id'), '',
					'Element was not removed successfully'
				);
			},
			'$(sel).removeAttr': function() {
				Wee.$attr('#wee-chain-id', 'data-test', 'value');

				assert.strictEqual($('#wee-chain-id').attr('data-test'), 'value',
					'Attribute was not added successfully'
				);

				$('#wee-chain-id').removeAttr('data-test');

				assert.strictEqual($('#wee-chain-id').attr('data-test'), null,
					'Attribute was not removed successfully'
				);
			},
			'$(sel).removeClass': {
				'single': function() {
					$('#wee-chain-id').removeClass('wee');

					assert.notOk(Wee.$hasClass('#wee-chain-id', 'wee'),
						'Single class was not removed successfully'
					);
				},
				'multiple': function() {
					Wee.$addClass('#wee-chain-id', 'wee-chain-2');

					$('#wee-chain-id').removeClass('wee-chain-2 wee-chain');

					assert.notInclude(Wee.$attr('#wee-chain-id', 'class'),
						'wee-chain wee-chain-2',
						'Multiple classes were not removed successfully'
					);
				},
			},
			'$(sel).replaceWith': function() {
				$('#wee-chain-id').html('<div id="wee-inner"></div>');

				$('#wee-inner').replaceWith('<span id="span-inner"></span>');

				assert.strictEqual($('#wee-chain-id').html(),
					'<span id="span-inner"></span>',
					'Element was not replaced successfully'
				);
			},
			'$(sel).scrollLeft': {
				'get': function() {
					assert.strictEqual($('body').scrollLeft(), 0,
						'Scroll left value not retreived successfully'
					);
				},
				'set': function() {
					Wee.$css('#wee-chain-id', 'width', '15000px');

					Wee.$scrollLeft('body', 10);

					assert.strictEqual($('body').scrollLeft(), 10,
						'Scroll left value not set successfully'
					);
				}
			},
			'$(sel).scrollTop': {
				'get': function() {
					assert.strictEqual($('body').scrollTop(), 0,
						'Scroll top value not retreived successfully'
					);
				},
				'set': function() {
					Wee.$css('#wee-chain-id', 'height', '500px');

					Wee.$scrollTop('body', 10);

					assert.strictEqual($('body').scrollTop(), 10,
						'Scroll top value not set successfully'
					);
				}
			},
			'$(sel).serialize': function() {
				Wee.$html('#wee-chain-id',
					'<form action="#" id="wee-chain-id-form">' +
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

				assert.strictEqual($('#wee-chain-id-form').serialize(), serializedValue,
					'Form was not serialized successfully'
				);
			},
			'$(sel).show': function() {
				Wee.$hide('#wee-chain-id');

				assert.ok(Wee.$hasClass('#wee-chain-id', 'js-hide'),
					'Element was not hidden successfully'
				);

				$('#wee-chain-id').show();

				assert.notOk(Wee.$hasClass('#wee-chain-id', 'js-hide'),
					'Element was not shown successfully'
				);
			},
			'$(sel).siblings': {
				'beforeEach': function() {
					Wee.$append('#wee-chain-id',
						'<p></p>' +
						'<span></span>' +
						'<div id="target-div"></div>'
					);
				},
				'all': function() {
					assert.strictEqual($('#target-div').siblings().length, 2,
						'All siblings were not retrieved successfully'
					);

					assert.isObject($('#target-div').siblings(),
						'$siblings did not return an array'
					);
				},
				'filtered': function() {
					assert.strictEqual($('#target-div', 'p').siblings().length, 1,
						'Filtered siblings were not retrieved successfully'
					);

					assert.isObject($('#target-div', 'p').siblings(),
						'$siblings did not return an array'
					);
				}
			},
			'$(sel).slice': function() {
				Wee.$html('#wee-chain-id',
					'<span>1</span><span>2</span><span>3</span>'
				);

				assert.strictEqual(Wee.$html($('#wee-chain-id span').slice(1, 2)), '2',
					'Second element was not selected successfully'
				);
			},
			'$(sel).text': {
				'beforeEach': function() {
					Wee.$text('#wee-chain-id', 'Wee Test');
				},
				'get': function() {
					assert.strictEqual($('#wee-chain-id').text(), 'Wee Test',
						'Text was not retreived successfully'
					);
				},
				'set': function() {
					$('#wee-chain-id').text('Testing 123');

					assert.strictEqual(Wee.$text('#wee-chain-id'), 'Testing 123',
						'Element text was not set successfully'
					);
				}
			},
			'$(sel).toggle': function() {
				$('#wee-chain-id').toggle();

				assert.ok(Wee.$hasClass('#wee-chain-id', 'js-hide'),
					'Element was not hidden successfully'
				);

				$('#wee-chain-id').toggle();

				assert.notOk(Wee.$hasClass('#wee-chain-id', 'js-hide'),
					'Element was not shown successfully'
				);
			},
			'$(sel).toggleClass': {
				'single': function() {
					$('#wee-chain-id').toggleClass('test-class');

					assert.ok(Wee.$hasClass('#wee-chain-id', 'test-class'),
						'Class was not added successfully'
					);

					Wee.$toggleClass('#wee-chain-id', 'test-class');

					assert.notOk(Wee.$hasClass('#wee-chain-id', 'test-class'),
						'Class was not removed successfully'
					);
				},
				'multiple': function() {
					$('#wee-chain-id').toggleClass('test-class test-class-2');

					assert.strictEqual(Wee.$attr('#wee-chain-id', 'class'),
						'wee-chain-class test-class test-class-2',
						'Multiple classes were not toggled successfully'
					);

					$('#wee-chain-id').toggleClass('test-class test-class-2');

					assert.notStrictEqual(Wee.$attr('#wee-chain-id', 'class'),
						'wee-chain-class test-class test-class-2',
						'Multiple classes were not toggled successfully'
					);

					assert.notOk(Wee.$hasClass('#wee-chain-id', 'test-class'),
						'Multiple classes were not toggled successfully'
					);

					assert.notOk(Wee.$hasClass('#wee-chain-id', 'test-class-2'),
						'Multiple classes were not toggled successfully'
					);
				},
				'function': function() {
					$('#wee-chain-id').toggleClass(function() {
						return Wee.$addClass('#wee-chain-id', 'test');
					});

					assert.ok(Wee.$hasClass('#wee-chain-id', 'test'),
						'Function was not executed successfully'
					);
				}
			},
			'$(sel).val': {
				'beforeEach': function() {
					Wee.$html('#wee-chain-id',
						'<input type="text" class="testing" value="test">'
					);
				},
				'get': function() {
					assert.strictEqual($('.testing').val(), 'test',
						'Value was not retrieved successfully'
					);
				},
				'set': function() {
					$('.testing').val('testing');

					assert.strictEqual($('.testing').val(), 'testing',
						'Value was not set successfully'
					);
				},
				'function': function() {
					$('.testing').val(function(i, value) {
						if (value.length > 3) {
							return Wee.$html('#wee-chain-id', '<p>' + value + '</p>');
						}
					});

					assert.ok(Wee.$html('#wee-chain-id p'), 'test',
						'Function was not executed successfully'
					);
				}
			},
			'$(sel).width': {
				'beforeEach': function() {
					Wee.$width('#wee-chain-id', '100px');
				},
				'get': function() {
					assert.strictEqual($('#wee-chain-id').width(), 100,
						'Element width not set successfully'
					);
				},
				'set': function() {
					$('#wee-chain-id').width('200px');

					assert.strictEqual(Wee.$width('#wee-chain-id'), 200,
						'Element width not set successfully'
					);
				},
				'function': function() {
					$('#wee-chain-id').width(function(i, width) {
						return (width += 50) + 'px';
					});

					assert.strictEqual(Wee.$width('#wee-chain-id'), 150,
						'Element width not set successfully'
					);
				}
			},
			'$(sel).wrap': function() {
				$('#wee-chain-id').wrap('<div id="wrapper"></div>');

				assert.strictEqual(Wee.$parent('#wee-chain-id')[0].id, 'wrapper',
					'Element was not wrapped successfully'
				);
			},
			'$(sel).wrapInner': function() {
				$('#wee-chain-id').wrapInner('<div id="testing"></div>');

				assert.ok(Wee.$contains('#wee-chain-id', '#testing'),
					'Element was not wrapped successfully'
				);
			}
		}
	});
});