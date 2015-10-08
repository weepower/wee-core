define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	require('script/wee.events.js');

	registerSuite({
		name: 'Wee Events',

		beforeEach: function() {
			var fixtureOne = document.createElement('div');

			fixtureOne.id = 'wee-events-id';
			fixtureOne.className = 'wee-events-class';

			document.body.appendChild(fixtureOne);
		},
		afterEach: function() {
			$('#wee-events-id').remove();
		},
		'events.on': {
			'simple': function() {
				Wee.events.on('#wee-events-id', 'click', function() {
					Wee.$addClass('#wee-events-id', 'link-class');
				});

				Wee.events.trigger('#wee-events-id', 'click');

				assert.ok(Wee.$hasClass('#wee-events-id', 'link-class'),
					'Event was not bound successfully'
				);
			},
			'once': function() {
				Wee.events.on('#wee-events-id', 'click', function() {
					Wee.$append('#wee-events-id', '<span class="test"></span>');
				}, {
					once: true
				});

				Wee.events.trigger('#wee-events-id', 'click');
				Wee.events.trigger('#wee-events-id', 'click');

				assert.strictEqual(Wee.$children('#wee-events-id').length, 1,
					'Event was triggered more than once'
				);
			},
			'delegation': function() {
				Wee.$append('#wee-events-id', '<span class="test-class"></span>');

				Wee.events.on('.test-class', 'click', function() {
					$(this).addClass('test-class-2')
				}, {
				    delegate: '#wee-events-id'
				});

				Wee.events.trigger('.test-class', 'click');

				assert.ok(Wee.$hasClass('.test-class', 'test-class-2'),
					'Event was not delegated successfully'
				);
			},
			'multiple events': function() {
				Wee.events.on('#wee-events-id', {
					click: function() {
						Wee.$addClass('#wee-events-id', 'test-class');
					},
					blur: function() {
						Wee.$removeClass('#wee-events-id', 'test-class');
						Wee.$addClass('#wee-events-id', 'test-class-2');
					}
				});

				Wee.events.trigger('#wee-events-id', 'click');
				Wee.events.trigger('#wee-events-id', 'blur');

				assert.ok(Wee.$hasClass('#wee-events-id', 'test-class-2'),
					'Multple events were not triggered successfully'
				);
			},
			'multiple selections': function() {
				Wee.$append('#wee-events-id', '<div id="wee-inner">inner</div>');

				Wee.events.on({
					'#wee-events-id': {
						click: function() {
							Wee.$addClass('#wee-events-id', 'test-class');
						}
					},
					'#wee-inner': {
						click: function() {
							Wee.$addClass('#wee-inner', 'test-class-inner');
						}
					}
				});

				Wee.events.trigger('#wee-events-id', 'click');
				Wee.events.trigger('#wee-inner', 'click');

				assert.ok(Wee.$hasClass('#wee-events-id', 'test-class'),
					'Multiple selections not selected successfully'
				);
				assert.ok(Wee.$hasClass('#wee-inner', 'test-class-inner'),
					'Multiple selections not selected successfully'
				);
			}
		},
		'events.off': {
			'target': function() {
				Wee.events.on({
					'#wee-events-id': {
						click: function() {
							Wee.$addClass('#wee-events-id', 'test-class');
						},
						blur: function() {
							Wee.$addClass('#wee-inner', 'test-class-2');
						}
					}
				});

				Wee.events.off('#wee-events-id');

				Wee.events.trigger('#wee-events-id', 'click');
				Wee.events.trigger('#wee-events-id', 'blur');

				assert.notOk(Wee.$hasClass('#wee-events-id', 'test-class'),
					'Event was not removed successfully'
				);
				assert.notOk(Wee.$hasClass('#wee-events-id', 'test-class-2'),
					'Event was not removed successfully'
				);
			},
			'selection event': function() {
				Wee.events.on({
					'#wee-events-id': {
						click: function() {
							Wee.$addClass('#wee-events-id', 'test-class');
						},
						blur: function() {
							Wee.$addClass('#wee-events-id', 'test-class-2');
						}
					}
				});

				Wee.events.off('#wee-events-id', 'blur');

				Wee.events.trigger('#wee-events-id', 'click');
				Wee.events.trigger('#wee-events-id', 'blur');

				assert.ok(Wee.$hasClass('#wee-events-id', 'test-class'),
					'Event was not removed successfully'
				);
				assert.notOk(Wee.$hasClass('#wee-events-id', 'test-class-2'),
					'Event was not removed successfully'
				);
			},
			'selection event callback': function() {
				var callbackFunction = function() {
					Wee.$removeClass('#wee-events-id', 'test-class');
				};

				Wee.events.on('#wee-events-id', 'click', function() {
					Wee.$addClass('#wee-events-id', 'test-class');
				});

				Wee.events.trigger('#wee-events-id', 'click');

				Wee.events.off('#wee-events-id', 'click', callbackFunction());

				assert.notOk(Wee.$hasClass('#wee-events-id', 'test-class-2'),
					'Callback function was not executed successfully'
				);
			},
			'multiple selections': function() {
				Wee.$append('#wee-events-id', '<div id="wee-inner"></div>');

				var callbackFunctionOne = function() {
						Wee.$removeClass('#wee-events-id', 'test-class');
					},
					callbackFunctionTwo = function() {
						Wee.$removeClass('#wee-inner', 'test-class-2');
					};

				Wee.events.on('#wee-events-id', 'click', function() {
					Wee.$addClass('#wee-events-id', 'test-class');
				});

				Wee.events.on('#wee-inner', 'blur', function() {
					Wee.$addClass('#wee-inner', 'test-class-2');
				}, {
					delegate: '#wee-events-id'
				});

				Wee.events.trigger('#wee-events-id', 'click');
				Wee.events.trigger('#wee-inner', 'blur');

				Wee.events.off({
				    '#wee-events-id': {
				        click: callbackFunctionOne()
				    },
				    '#wee-inner': {
				        blur: callbackFunctionTwo()
				    }
				});

				assert.notOk(Wee.$hasClass('#wee-events-id', 'test-class'),
					'Multiple selections were not called back successfully'
				);
				assert.notOk(Wee.$hasClass('#wee-inner', 'test-class-2'),
					'Multiple selections were not called back successfully'
				);
			}
		},
		'events.bound': function() {
			Wee.events.on('#wee-events-id', 'click', function() {
				Wee.$addClass('#wee-events-id', 'test-class');
			});

			assert.isArray(Wee.events.bound());
		},
		'events.trigger': function() {
			Wee.events.on('#wee-events-id', 'click', function() {
				Wee.$addClass('#wee-events-id', 'test-class');
			});

			Wee.events.trigger('#wee-events-id', 'click');

			assert.ok(Wee.$hasClass('#wee-events-id', 'test-class'),
				'Event was not triggered successfully'
			);
		}
	});
});