Wee.fn.make('{{ name }}', {
	get: function(conf) {
		this.$private.call(conf);
	},

	post: function(conf) {
		this.$private.call(Wee.$extend(true, {
			method: 'post'
		}, conf));
	},

	put: function(conf) {
		this.$private.call(Wee.$extend(true, {
			method: 'put'
		}, conf));
	},

	delete: function(conf) {
		this.$private.call(Wee.$extend(true, {
			method: 'delete'
		}, conf));
	}
}, {
	call: function(conf) {
		Wee.fetch.request(Wee.$extend(true, {
			root: Wee.$get('apiUrl')
		}, conf));
	}
});