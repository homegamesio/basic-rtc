const http = require("http");
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { RTCPeerConnection, RTCSessionDescription } = require('wrtc');

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

setInterval(() => {
    const timestamp = '' + Date.now();
    for (const wsId in clients) {
        const channel = clients[wsId].channel;
        if (channel) {
            channel.send(timestamp);
        }
    }
}, 5);

wss.on('connection', (ws) => {
    ws.id = socketIdCount++;
    clients[ws.id] = {
        socket: ws
    };
    ws.on('message', (message) => {
        console.log(message);
        const data = JSON.parse(message);
        if (data.type === 'PeerRequest') {
            const connection = new RTCPeerConnection();
            clients[ws.id].connection = connection;
            connection.addEventListener('icecandidate', ({candidate}) => {
                if (!candidate) {
                    ws.send(JSON.stringify(connection.localDescription));
                }
            });
            const dataChannel = connection.createDataChannel('homegames');
            dataChannel.onopen = () => {
                console.log("data channel opened");
                clients[ws.id].channel = dataChannel;
            };

            connection.createOffer().then(offer => {
                const replacedSDP = offer.sdp.replace(/\r\na=ice-options:trickle/g, '');
                offer.sdp = replacedSDP;

 
                connection.setLocalDescription(offer);
            });
        } else if (data.type === 'answer') {
            const connection = clients[ws.id].connection;
            connection.setRemoteDescription(data);
        }
    });

    ws.on('close', () => {
        delete clients[ws.id];
    });
});

server.listen(80);
