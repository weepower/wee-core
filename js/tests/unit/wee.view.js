define(function(require) {
	var registerSuite = require('intern!object'),
		assert = require('intern/chai!assert'),
		Wee = require('Wee');

	require('js/wee.view.js');

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

			assert.strictEqual(Wee.view.render('{{ firstName }}', {}), '',
				'Unavailable variable cleared successfully.'
			);

			assert.strictEqual(Wee.view.render('{{ firstName || "Keith" }}', {}), 'Keith',
				'Variable fallback output successfully.'
			);

			assert.strictEqual(Wee.view.render('{{ firstName }} {{ lastName }}', data), 'Keith Roberts',
				'Two variables parsed successfully.'
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

		addPartial: function() {
			Wee.view.addPartial('partial', '123');
			Wee.view.addPartial('partial2', '456');

			assert.strictEqual(Wee.view.render('{{> partial }}{{> partial }}{{> partial2 }}', {}), '123123456',
				'Template parsed successfully.'
			);
		}
	});
});