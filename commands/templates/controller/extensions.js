Wee.fn.make('extensions', {
	_construct: function() {
		var disabled = '{{ disabledClass }}',
			active = '{{ activeClass }}';

		$.chain({
			disable: function() {
				this.addClass(disabled);

				return this;
			},

			enable: function() {
				this.removeClass(disabled);
			},

			isDisabled: function() {
				return this.hasClass(disabled);
			},

			isEnabled: function() {
				return ! this.hasClass(disabled);
			},

			activate: function() {
				this.addClass(active);

				return this;
			},

			deactivate: function() {
				this.removeClass(active);

				return this;
			},

			isActive: function() {
				return this.hasClass(active);
			},

			isInactive: function() {
				return ! this.hasClass(active);
			}
		});
	}
});