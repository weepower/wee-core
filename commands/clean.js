(function() {
	var fs = require('fs-extra'),
		paths = [
			'.codeclimate.yml',
			'bower.json',
			'LICENSE',
			'README.md',
			'source/modules/welcome'
		];

	paths.forEach(function(path) {
		fs.remove(path);
	});
})();