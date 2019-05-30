const chalk = require('chalk');
const notifier = require('node-notifier');
const process = require('process');
const basePath = __filename.split('/').slice(0, -1).join('/');
const projectPath = process.env.PWD;
const weeConfig = require('./config');
let projectSourcePath = `${projectPath}`;

projectSourcePath += weeConfig.paths ?
    `/${weeConfig.paths.source}` :
    '/source';

module.exports = {
    /**
     * Prep a string to become file/folder name
     *
     * @param  {string} string
     * @return {string}
     */
    fileFormat(string) {
        return string.split(/(?=[A-Z])/g).map((word) => word.toLowerCase())
            .join('-');
    },

    /**
     * Notify through a natively available notification option
     *
     * @param {object} options
     * @param {string} [type=notice]
     * @param {boolean} [log=true]
     */
    notify(options, type, log) {
        options.icon = __dirname + '/images/' + (type || 'notice') + '.png';
        options.group = 1;

        if (type == 'error' || type == 'fail') {
            options.group = 2;
            options.sound = true;
            options.wait = true;
        }

        if (log !== false) {
            console.log(options.message);
        }

        notifier.notify(options);

        if (type == 'fail') {
            process.exit(1);
        }
    },

    /**
     * Log an error to the console
     *
     * @param {string} message
     * @param {string} [details]
     */
    logError(message, details) {
        console.log(
            chalk.red.bold('error: ') +
            message + ' ' + (details || '')
        );
    },

    /**
     * Log a success message to the console
     *
     * @param  {string} message
     */
    logSuccess(message) {
        console.log(chalk.green(message));
    },

    logList(name, desc) {
        console.log(
            `\n${chalk.green.bgBlack.bold(name)} - ${chalk.white.bgBlack(desc)}`
        );
    },

    paths: {
        root: basePath,
        styles: `${basePath}/styles`,
        commands: `${basePath}/commands`,
        project: {
            root: projectPath,
            source: projectSourcePath,
            commands: `${projectSourcePath}/commands`,
            styles: `${projectSourcePath}/styles`,
            scripts: `${projectSourcePath}/scripts`,
            components: `${projectSourcePath}/components`
        },
        tests: {
            root: `${basePath}/tests`,
            scripts: `${basePath}/tests/scripts`
        }
    },

    /**
     * Trim the right side of string
     * @param {String} str
     */
    trimRight(str) {
        return str.replace(/\s+$/, '');
    },

    /**
     * Remove stars from line
     * @param {String} line
     */
    stripStars(line) {
        let re = /^(?:\s*[\*]{1,2}\s)/;

        return this.trimRight(line.replace(re, ''));
    }
};
