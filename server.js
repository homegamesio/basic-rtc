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

let hostId;

wss.on('connection', (ws) => {
    console.log('someone connected!');
    ws.id = socketIdCount++;
    clients[ws.id] = ws;
    ws.on('message', (message) => {
        const data = JSON.parse(message);
//        if (data.type) {// === 'offer') {
//            for (const clientId in clients) {
//                if (clientId != ws.id) {
//                    const client = clients[clientId];
//                    client.send(message);
//                }
//            }
//        }
//        console.log('message!');
//        console.log(message);
        if (data.type === 'HostRequest') {
            if (!hostId) {
                hostId = ws.id;
                ws.send(JSON.stringify({
                    type: 'HostResponse',
                    success: true
                }));
            } else {
                ws.send(JSON.stringify({
                    type: 'HostResponse',
                    success: false
                }));
            }
        } else if (data.type === 'RTCOffer') {
            console.log("got offer request");
            console.log(data);
            const target = clients[data.targetId];
            target.send(JSON.stringify(data.offer));
        } else if (data.type === 'answer') {
            clients[hostId].send(JSON.stringify({
                type: 'answer',
                answer: data,
                targetId: ws.id
            }));
        } else if (data.type === 'PeerRequest') {
            console.log("GOT PEER REQUEST");
            clients[hostId].send(JSON.stringify({
                type: "PeerRequest",
                id: ws.id
            }));
        }
    });

    ws.on('close', () => {
        delete clients[ws.id];
    });
});

server.listen(80);
