const { spawn } = require('child_process');

module.exports = {
    name: 'build',
    description: 'build and compile assets',
    usage: '- wee build [options]',
    options: [
        ['-p, --prod', 'minify assets for production build'],
    ],
    action(config, options) {
        let command = 'build';

        if (options.prod) {
            command += ':prod';
        }

        // Execute npm run
        let child = spawn('npm', ['run', command], {
            cwd: config.rootPath,
            stdio: 'inherit'
        });
    },
};
