import http from 'http';
import { app } from './app.js';
import { config } from 'dotenv';

config();

let server = http.createServer(app);
let port = process.env.PORT;

server.listen(port, () => {
    console.log('Server is listening at port number ' + port);
})