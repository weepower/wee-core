/* global __dirname, fs, path, project */

module.exports = function(grunt) {
	grunt.registerTask('loadHelpers', function(task) {
		var build = Wee.$toArray(project.generator.build),
			configPath = '../../' + build[task],
			json = fs.readJsonSync(configPath),
			staticRoot = path.dirname(configPath),
			helperRoot = path.join(staticRoot, json.config.paths.helpers),
			helpers = grunt.file.expand({
				cwd: helperRoot
			}, '**/*.js');

		helpers.forEach(function(name) {
			var helper = path.relative(__dirname, path.join(helperRoot, name));
			delete require.cache[require.resolve(helper)];
			require(helper);
		});
	});
};