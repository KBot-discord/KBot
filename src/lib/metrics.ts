import express from 'express';
import * as promClient from 'prom-client';
import { Config } from "./types/config";

const config: Config = require('../../config.js');


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

    app.listen(config.metrics.port, () => {
        console.log(`Metrics server started on port: ${config.metrics.port}`)
    });
}

export default startMetricsServer;
