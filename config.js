const fs = require('fs-extra');
const process = require('process');
const configFile = `${process.env.PWD}/wee.json`;
let weeConfig = {
	"paths": {
		"root": "public",
		"assets": "assets",
		"source": "source",
		"build": "build"
	},
	"style": {
		"features": {
			"buttons": true,
			"code": true,
			"forms": true,
			"print": true,
			"tables": true
		},
		"breakpoints": {
			"mobileLandscape": 480,
			"tablet": 768,
			"desktop": 1024,
			"desktop2": 1280,
			"desktop3": 1440
		},
		"breakpointOffset": 25,
		"build": [],
		"compile": {}
	},
	"script": {
		"entry": {
			"app": "app.js"
		},
		"output": {
			"filename": "[name].bundle.js"
		},
		"chunking": {
			"enable": false,
			"options": {
				"name": "common",
				"minChunks": 2
			}
		}
	},
	"server": {
		"ghostMode": false,
		"host": "auto",
		"port": 9000,
		"https": true,
		"proxy": "https://wee.dev",
		"static": true,
		"reload": {
			"enable": true,
			"watch": {
				"root": true,
				"paths": [],
				"extensions": [
					"html"
				],
				"ignore": []
			}
		}
	}
};

if (fs.existsSync(configFile)) {
	weeConfig = JSON.parse(fs.readFileSync(`${process.env.PWD}/wee.json`, 'utf8'));
}

module.exports = weeConfig;