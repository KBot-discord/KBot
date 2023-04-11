import { createSchema } from 'schemix';

createSchema({
	basePath: __dirname,
	datasource: {
		provider: 'postgresql',
		url: { env: 'DATABASE_URL' }
	},
	generator: {
		provider: 'prisma-client-js',
		output: './generated'
	}
}).export(__dirname, 'schema');
