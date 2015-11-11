define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee'),
		el;

	require('js/wee.dom.js');
	require('js/wee.events.js');

	registerSuite({
		name: 'Events',

		beforeEach: function() {
			el = document.createElement('div');

			el.id = 'wee';
			el.className = 'js-wee';

			document.body.appendChild(el);
		},

		afterEach: function() {
			el.parentNode.removeChild(el);
		},

		on: {
			simple: function() {
				Wee.events.on(el, 'click', function() {
					Wee.$addClass(el, 'test');
				});

				Wee.events.trigger(el, 'click');

				assert.ok(Wee.$hasClass$el, 'test'),
					'Event was not bound successfully'
				);
			},

			once: function() {
				Wee.events.on(el, 'click', function() {
					Wee.$append(el, '<div class="test"></div>');
				}, {
					once: true
				});

				Wee.events.trigger(el, 'click');
				Wee.events.trigger(el, 'click');

				assert.strictEqual(Wee.$children(el).length, 1,
					'Event was triggered more than once'
				);
			},

			delegate: function() {
				// TODO: Complete
				assert.isTrue(true);
			},

			'multiple events': function() {
				Wee.events.on(el, {
					click: function() {
						Wee.$addClass(el, 'test');
					},
					blur: function() {
						Wee.$removeClass(el, 'test');
						Wee.$addClass(el, 'test-2');
					}
				});

				Wee.events.trigger(el, 'click');
				Wee.events.trigger(el, 'blur');

				assert.ok(Wee.$hasClass($el, 'test-2'),
					'Multple events were not triggered successfully'
				);
			},

			'multiple selections': function() {
				Wee.$append(el, '<div id="test">inner</div>');

				Wee.events.on({
					'#wee': {
						click: function() {
							Wee.$addClass(this, 'test');
						}
					},
					'#test': {
						click: function() {
							Wee.$addClass(this, 'test-inner');
						}
					}
				});

				Wee.events.trigger(el, 'click');
				Wee.events.trigger('#test', 'click');

				assert.ok(Wee.$hasClass(el, 'test'),
					'Multiple selections not selected successfully'
				);

				assert.ok(Wee.$hasClass('#test', 'test-inner'),
					'Multiple selections not selected successfully'
				);
			}
		},

		off: {
			target: function() {
				var $el = Wee.$('#wee');

				Wee.events.on({
					'#wee': {
						click: function() {
							Wee.$addClass($el, 'test-class');
						},
						blur: function() {
							Wee.$addClass('#wee-inner', 'test-class-2');
						}
					}
				});

				Wee.events.off($el);

				Wee.events.trigger($el, 'click');
				Wee.events.trigger($el, 'blur');

				assert.notOk(Wee.$hasClass($el, 'test-class'),
					'Event was not removed successfully'
				);
				assert.notOk(Wee.$hasClass($el, 'test-class-2'),
					'Event was not removed successfully'
				);
			},

			'selection event': function() {
				var $el = Wee.$('#wee');

				Wee.events.on({
					'#wee': {
						click: function() {
							Wee.$addClass($el, 'test-class');
						},
						blur: function() {
							Wee.$addClass($el, 'test-class-2');
						}
					}
				});

				Wee.events.off($el, 'blur');

				Wee.events.trigger($el, 'click');
				Wee.events.trigger($el, 'blur');

				assert.ok(Wee.$hasClass($el, 'test-class'),
					'Event was not removed successfully'
				);
				assert.notOk(Wee.$hasClass($el, 'test-class-2'),
					'Event was not removed successfully'
				);
			},

			'selection event callback': function() {
				var $el = Wee.$('#wee');

				var callbackFunction = function() {
					Wee.$removeClass($el, 'test-class');
				};

				Wee.events.on($el, 'click', function() {
					Wee.$addClass($el, 'test-class');
				});

				Wee.events.trigger($el, 'click');

				Wee.events.off($el, 'click', callbackFunction());

				assert.notOk(Wee.$hasClass($el, 'test-class-2'),
					'Callback function was not executed successfully'
				);
			},

			'multiple selections': function() {
				var $el = Wee.$('#wee');

				Wee.$append($el, '<div id="wee-inner"></div>');

				var callbackFunctionOne = function() {
						Wee.$removeClass($el, 'test-class');
					},
					callbackFunctionTwo = function() {
						Wee.$removeClass('#wee-inner', 'test-class-2');
					};

				Wee.events.on($el, 'click', function() {
					Wee.$addClass($el, 'test-class');
				});

				Wee.events.on('#wee-inner', 'blur', function() {
					Wee.$addClass('#wee-inner', 'test-class-2');
				}, {
					delegate: $el
				});

				Wee.events.trigger($el, 'click');
				Wee.events.trigger('#wee-inner', 'blur');

				Wee.events.off({
				    '#wee': {
				        click: callbackFunctionOne()
				    },
				    '#wee-inner': {
				        blur: callbackFunctionTwo()
				    }
				});

				assert.notOk(Wee.$hasClass($el, 'test-class'),
					'Multiple selections were not called back successfully'
				);
				assert.notOk(Wee.$hasClass('#wee-inner', 'test-class-2'),
					'Multiple selections were not called back successfully'
				);
			}
		},

		bound: function() {
			var $el = Wee.$('#wee');

			Wee.events.on($el, 'click', function() {
				Wee.$addClass($el, 'test-class');
			});

			assert.isArray(Wee.events.bound());
		},

		trigger: function() {
			var $el = Wee.$('#wee');

			Wee.events.on($el, 'click', function() {
				Wee.$addClass($el, 'test-class');
			});

			Wee.events.trigger($el, 'click');

			assert.ok(Wee.$hasClass($el, 'test-class'),
				'Event was not triggered successfully'
			);
		}
	});
});