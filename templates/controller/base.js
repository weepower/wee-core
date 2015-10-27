Wee.fn.make('{{ name }}', {
	_construct: function() {
		// ...
	},
	init: function() {
		this.$private.method();
	}
}, {
	method: function() {
		// ...
	}
});