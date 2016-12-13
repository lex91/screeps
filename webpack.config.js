const path = require('path');
const distVersion = '0.0.2';
//
// module.exports = {
// 	entry: {
// 		//context: path.join(__dirname,'app'),
// 		filename: "index.js"
// 	},
// 	output: {
// 		path: path.join(__dirname,'dist',distVersion),
// 		filename: "main.js",
// 		// libraryTarget: 'var',
// 		// library: 'screepsApp'
// 	},
// 	module: {
//
// 	}
// };


module.exports = {
	entry: path.join(__dirname,'app','main.js'),
	output: {
		path: path.join(__dirname,'dist',distVersion),
		filename: "main.js",
		libraryTarget: 'commonjs2',
		// library: 'screepsApp'
	},
	resolve: {
		root: path.join(__dirname,'app')
	},
	module: {
	}
};