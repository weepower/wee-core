const { spawn } = require('child_process');
const utils = require('../utils');

module.exports = {
    name: 'run',
    description: 'run development server',
    usage: '- wee run [options]',
    options: [
        ['-l, --local', 'wrap proxy around local dev domain'],
        ['-s, --static', 'serve static files']
    ],
    action(config, options) {
        let project = config.project;

        if (options.local) {
            if (! project.server.proxy) {
                utils.logError('Set proxy domain in wee.config.js');
                process.exit();
            }
        }

        // Execute npm run
        let child = spawn('npm', ['start'], {
            cwd: config.rootPath,
            stdio: 'inherit'
        });

        child.on('error', data => {
            utils.logError(data);
        });
    }
};
