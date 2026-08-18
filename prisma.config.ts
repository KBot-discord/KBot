import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnvFile } from 'node:process';
import { defineConfig } from 'prisma/config';

if (existsSync('.env')) {
	loadEnvFile();
}

export default defineConfig({
	datasource: {
		url: process.env.DATABASE_URL,
	},
	schema: join('prisma', 'schema'),
});
