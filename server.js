const http = require("http");
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const PATH_MAP = {
    "/": { 
        path: "index.html",
        contentType: "text/html"
    },
    "/client": { 
        path: "index2.html",
        contentType: "text/html"
    },
    "/lil.js": { 
        path: "lil.js",
        contentType: "text/javascript"
    },
    "/app.js": {
        path: "app.js",
        contentType: "text/javascript"
    }
};

const server = http.createServer((req, res) => {
    let requestPath = req.url;

    const queryParamIndex = requestPath.indexOf("?");

    if (queryParamIndex > 0) {
        requestPath = requestPath.substring(0, queryParamIndex);
    }

    const pathMapping = PATH_MAP[requestPath];

    if (pathMapping) {
        res.statusCode = 200;
        res.setHeader("Content-Type", pathMapping.contentType);
        const payload = fs.readFileSync(path.join(__dirname, pathMapping.path));
        res.end(payload);
    } else {
        res.statusCode = 404;
        res.end();
    }
});

const wss = new WebSocket.Server({server});

let socketIdCount = 1;

const clients = {};

wss.on('connection', (ws) => {
    console.log('someone connected!');
    ws.id = socketIdCount++;
    clients[ws.id] = ws;
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type) {// === 'offer') {
            for (const clientId in clients) {
                if (clientId != ws.id) {
                    const client = clients[clientId];
                    client.send(message);
                }
            }
        }
        console.log('message!');
        console.log(message);
    });

    ws.on('close', () => {
        delete clients[ws.id];
    });
});

server.listen(80);
