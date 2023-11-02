const config = require('../../.lintstagedrc.js');

module.exports = {
	...config,
	'*.prisma': [
		'prisma format' //
	]
};
