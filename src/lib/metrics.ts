import express from 'express';
import * as promClient from 'prom-client';


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

    app.listen(8501);
}

export default startMetricsServer;
