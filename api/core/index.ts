import { APIGatewayEvent, Context } from 'aws-lambda'
import createAPI from 'lambda-api'

const http = require('http')
const https = require('https')

const api = createAPI();

const server = https.createServer(httpsOptions, (req, res) => {
    res.writeHead(200);
    // here we reach to the net.Socket instance saved on the tls.TLSSocket object,
    // for extra dirtiness
    res.end('OK ' + req.socket._parent.marker + '\n');
});

proxy.on('connect', (request, requestSocket, head) => {
    requestSocket.marker = Math.random();
    server.emit('connection', requestSocket);
    requestSocket.write('HTTP/1.1 200 Connection established\r\n\r\n');
});


export async function handler(event: APIGatewayEvent, context: Context) {
    return await api.run(event, context);
};
