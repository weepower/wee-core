const fs = require('fs-extra');
const process = require('process');
const configFile = `${process.env.PWD}/wee.config.js`;
let weeConfig;

if (fs.existsSync(configFile)) {
	weeConfig = require(configFile);
} else {
	weeConfig = {
		paths: {}
	}
}

module.exports = weeConfig;