/* global global */

global.type = false;
global.args = [];

process.argv.forEach(function(val, i) {
	var arr = val.split(':'),
		key = arr[0];

	if (key == 'type') {
		type = arr[1];
	}

	if (i > 2) {
		args[key] = arr[1];
	}
});