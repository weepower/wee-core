const fs = require('fs-extra');
const process = require('process');
const configFile = `${process.env.PWD}/wee.json`;
let weeConfig;

if (fs.existsSync(configFile)) {
	weeConfig = JSON.parse(fs.readFileSync(`${process.env.PWD}/wee.json`, 'utf8'));
} else {
	weeConfig = {
		paths: {}
	}
}

module.exports = weeConfig;