define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert');

	require('js/tests/support/exports.js');

	registerSuite({
		name: 'View',

		render: function() {
			var data = {
				firstName: 'Keith',
				lastName: 'Roberts',
				married: false,
				citizen: true,
				pets: [
					'dog',
					'cat',
					'turtle'
				],
				children: [
					{
						firstName: 'Tim',
						lastName: 'Roberts'
					},
					{
						firstName: 'Kathy',
						lastName: 'Jackson'
					}
				]
			};

			assert.strictEqual(Wee.view.render('{{ firstName }}', data), 'Keith',
				'Single variable parsed successfully.'
			);

			assert.strictEqual(Wee.view.render('{{ $root.firstName }}', data), 'Keith',
				'Root variable parsed successfully.'
			);

			assert.strictEqual(Wee.view.render('{{ pets.0 }}', data), 'dog',
				'Array variable parsed successfully.'
			);

			assert.strictEqual(Wee.view.render('{{ firstName }}', {}), '',
				'Unavailable variable cleared successfully.'
			);

			assert.strictEqual(Wee.view.render('{{ firstName || "Keith" }}', {}), 'Keith',
				'Variable fallback output successfully.'
			);

			assert.strictEqual(Wee.view.render('{{ firstName }} {{ lastName }}', data), 'Keith Roberts',
				'Two variables parsed successfully.'
			);

			assert.strictEqual(Wee.view.render('{{ #married|is(false) }}Not married{{ /married }}', data), 'Not married',
				'Did not return expected result from "is" filter'
			);

			assert.strictEqual(Wee.view.render('{{ #married|not(true) }}Not married{{ /married }}', data), 'Not married',
				'Did not return expected result from "is" filter'
			);

			assert.strictEqual(Wee.view.render('{{ #children|notEmpty }}Has children{{ /children }}', data),
				'Has children', 'Children exist.'
			);

			assert.strictEqual(Wee.view.render('{{ #cousins|notEmpty }}Has cousins{{ /cousins }}', data), '',
				'There are no cousins.'
			);

			assert.strictEqual(Wee.view.render('{{ #cousins|isEmpty }}No cousins{{ /cousins }}', data),
				'No cousins', 'There are no cousins.'
			);

			assert.strictEqual(Wee.view.render('<ul>{{ #children|each }}<li>{{ firstName }}</li>{{ /children }}</ul>', data), '<ul><li>Tim</li><li>Kathy</li></ul>',
				'Child variables parsed successfully.'
			);

			assert.strictEqual(Wee.view.render('<ul>{{ #children|each }}<li>{{ ../firstName }}</li>{{ /children }}</ul>', data),
				'<ul><li>Keith</li><li>Keith</li></ul>',
				'Traversal was not successful'
			);
		},

		addHelper: function() {
			Wee.view.addHelper('range', function(min, max) {
				return this.val >= min && this.val <= max;
			});

			var data = {
				numbers: [
					1,
					2,
					3,
					4,
					5
				]
			};

			assert.strictEqual(Wee.view.render('{{ #numbers|each|range(2, 4) }}{{ . }}{{ /numbers }}', data), '234',
				'Template parsed successfully.'
			);

			Wee.view.addHelper('upper', function() {
				return this.val.toUpperCase();
			});

			assert.strictEqual(Wee.view.render('{{ name|upper }}', {name: 'Chris'}), 'CHRIS',
				'Template parsed successfully.'
			);
		},

		addView: function() {
			Wee.view.addView('partial', '123');
			Wee.view.addView('partial2', '456');

			assert.strictEqual(Wee.view.render('{{> partial }}{{> partial }}{{> partial2 }}', {}), '123123456',
				'Template parsed successfully.'
			);
		},

		app: {
			make: function() {
				var view = '<ul><li>{{ firstName }}</li><li>{{ lastName }}</li></ul>';

				Wee.app.make('test', {
					view: view,
					model: {
						firstName: 'Peter',
						lastName: 'McLovin'
					},
					_destruct: function() {
						$.set('destroyed', true);
					}
				});

				assert.isObject(Wee.app.test,
					'App is not an object'
				);

				assert.strictEqual(Wee.app.test.$get('firstName'), 'Peter',
					'App data retreieved successfully'
				);
			},

			$destroy: function() {
				Wee.app.test.$destroy();

				assert.isNotObject(Wee.app.test,
					'App was not destroyed'
				);

				assert.isUndefined(Wee.app.test,
					'App was not destroyed'
				);

				// TODO: add this to docs maybe?
				assert.isTrue($.get('destroyed'),
					'Destroy callback not executed'
				);
			},

			$pause: function() {
				// TODO: complete
				assert.isTrue(true);
			},

			$resume: function() {
				// TODO: complete
				assert.isTrue(true);
			}
		}
	});
});