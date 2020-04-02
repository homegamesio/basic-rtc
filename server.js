const http = require("http");
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const PATH_MAP = {
    "/": { 
        path: "index.html",
        contentType: "text/html"
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
    ws.id = socketIdCount++;
    clients[ws.id] = {
        socket: ws
    }
    ws.on('message', (message) => {
        if (message === 'ready') {
            console.log("THEY READY");
            clients[ws.id].ready = true;
        } else {
            const data = JSON.parse(message);
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
                const target = clients[data.targetId].socket;
                target.send(JSON.stringify(data.offer));
            } else if (data.type === 'answer') {
                if (hostId) {
                    clients[hostId].socket.send(JSON.stringify({
                        type: 'answer',
                        answer: data,
                        targetId: ws.id
                    }));
                }
            } else if (data.type === 'PeerRequest') {
                if (hostId) {
                    clients[hostId].socket.send(JSON.stringify({
                        type: "PeerRequest",
                        id: ws.id
                    }));
                }
            }
        }
    });

    ws.on('close', () => {
        if (hostId === ws.id) {
            hostId = null;
        }
        delete clients[ws.id];
    });
});

setInterval(() => {
    for (const clientId in clients) {
        if (clients[clientId].ready) {
            clients[clientId].socket.send('I am a server');
        }
    }
}, 1000);

server.listen(80);
