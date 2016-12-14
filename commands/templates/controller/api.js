Wee.fn.make('api', {
	get: function(conf) {
		this.$private.send(conf);
	},

	post: function(conf) {
		this.$private.send(Wee.$extend(true, {
			method: 'post'
		}, conf));
	},

	put: function(conf) {
		this.$private.send(Wee.$extend(true, {
			method: 'put'
		}, conf));
	},

	delete: function(conf) {
		this.$private.send(Wee.$extend(true, {
			method: 'delete'
		}, conf));
	}
}, {
	send: function(conf) {
		Wee.fetch.request(conf);
	}
});