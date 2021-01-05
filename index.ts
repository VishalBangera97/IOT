import cluster from 'cluster';
import http from 'http';
import os from 'os';
import { app } from './app.js';
import { config } from 'dotenv';
config();

let port = process.env.PORT!;
if (cluster.isMaster) {
    for (let i = 0; i < os.cpus().length; i++) {
        cluster.fork();
    }
} else {
    let server = http.createServer(app);
    server.listen(port, () => {
        console.log('Server is listening at port number ' + port);
    });
}
