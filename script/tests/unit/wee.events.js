define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	require('script/wee.dom.js');
	require('script/wee.events.js');

	registerSuite({
		name: 'Events',

		beforeEach: function() {
			var container = document.createElement('div');

			container.id = 'container';
			container.className = 'js-container';

			document.body.appendChild(container);
		},

		afterEach: function() {
			Wee.$remove('#container');
		},

		on: {
			simple: function() {
				var $el = Wee.$('#container');

				Wee.events.on($el, 'click', function() {
					Wee.$addClass($el, 'click-class');
				});

				Wee.events.trigger($el, 'click');

				assert.ok(Wee.$hasClass($el, 'click-class'),
					'Event was not bound successfully'
				);
			},

			once: function() {
				var $el = Wee.$('#container');

				Wee.events.on($el, 'click', function() {
					Wee.$append($el, '<span class="test"></span>');
				}, {
					once: true
				});

				Wee.events.trigger($el, 'click');
				Wee.events.trigger($el, 'click');

				assert.strictEqual(Wee.$children($el).length, 1,
					'Event was triggered more than once'
				);
			},

			delegate: function() {
				// TODO: Complete
				assert.isTrue(true);
			},

			'multiple events': function() {
				var $el = Wee.$('#container');

				Wee.events.on($el, {
					click: function() {
						Wee.$addClass($el, 'test-class');
					},
					blur: function() {
						Wee.$removeClass($el, 'test-class');
						Wee.$addClass($el, 'test-class-2');
					}
				});

				Wee.events.trigger($el, 'click');
				Wee.events.trigger($el, 'blur');

				assert.ok(Wee.$hasClass($el, 'test-class-2'),
					'Multple events were not triggered successfully'
				);
			},

			'multiple selections': function() {
				var $el = Wee.$('#container');

				Wee.$append($el, '<div id="wee-inner">inner</div>');

				Wee.events.on({
					'#container': {
						click: function() {
							Wee.$addClass($el, 'test-class');
						}
					},
					'#wee-inner': {
						click: function() {
							Wee.$addClass('#wee-inner', 'test-class-inner');
						}
					}
				});

				Wee.events.trigger($el, 'click');
				Wee.events.trigger('#wee-inner', 'click');

				assert.ok(Wee.$hasClass($el, 'test-class'),
					'Multiple selections not selected successfully'
				);
				assert.ok(Wee.$hasClass('#wee-inner', 'test-class-inner'),
					'Multiple selections not selected successfully'
				);
			}
		},

		off: {
			target: function() {
				var $el = Wee.$('#container');

				Wee.events.on({
					'#container': {
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
				var $el = Wee.$('#container');

				Wee.events.on({
					'#container': {
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
				var $el = Wee.$('#container');

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
				var $el = Wee.$('#container');

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
				    '#container': {
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
			var $el = Wee.$('#container');

			Wee.events.on($el, 'click', function() {
				Wee.$addClass($el, 'test-class');
			});

			assert.isArray(Wee.events.bound());
		},

		trigger: function() {
			var $el = Wee.$('#container');

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