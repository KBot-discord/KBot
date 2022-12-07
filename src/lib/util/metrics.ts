import express from 'express';
import * as promClient from 'prom-client';
import { container } from '@sapphire/framework';
import { Counter, register } from 'prom-client';

const app = express();
promClient.collectDefaultMetrics();

export function initMetrics() {
	container.metrics = {
		counters: {
			commands: {
				count: new Counter({
					name: 'kbot_command_total',
					help: 'Counter for total amount of command uses.',
					registers: [register],
					labelNames: ['name', 'category', 'result']
				})
			}
		}
	};
}

export function startMetricsServer() {
	app.get('/metrics', async (_req, res) => {
		try {
			res.set('Content-Type', promClient.register.contentType);
			res.end(await promClient.register.metrics());
		} catch (ex) {
			res.status(500).end(ex);
		}
	});

	app.listen(container.config.metrics.port, () => {
		container.logger.info(`Metrics server started on port: ${container.config.metrics.port}`);
	});
}
