// Imports
import express from 'express';
import * as promClient from 'prom-client';
import { container } from '@sapphire/framework';


const app = express();
promClient.collectDefaultMetrics();

function startMetricsServer() {
    app.get('/metrics', async (req, res) => {
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

export default startMetricsServer;
