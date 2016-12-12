const path = require('path');
const distVersion = '0.0.2';

module.exports = {
	entry: {
		context: path.join(__dirname,'app'),
		filename: "index.js"
	},
	output: {
		path: path.join(__dirname,'dist',distVersion),
		filename: "main.js"
	},
	module: {
		
	}
};