let socket;

const becomeHost = () => new Promise((resolve, reject) => {
    socket.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.type === 'HostResponse') {
            resolve(data.success);
        } else {
            reject();
        }
    };

    socket.send(JSON.stringify({
        type: "HostRequest"
    }));
});

socket = new WebSocket(`ws://${window.location.hostname}`);

const connections = {};
const channels = {};

const outputDiv = document.getElementById('output');

const listenForConnections = () => {
    socket.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.type === 'PeerRequest') {
            const thing = new RTCPeerConnection();
            const dataChannel = thing.createDataChannel('homegames');
 
            thing.onicecandidate = (e) => {
                if (e.candidate !== null) {
                    const offerMessage = {
                        type: "RTCOffer",
                        targetId: data.id,
                        offer: thing.localDescription
                    };
                    socket.send(JSON.stringify(offerMessage));
                }
            };
    
            thing.ondatachannel = (e) => {
                const chan = e.channel || e;
                channels[data.id] = chan;
            };

            dataChannel.onmessage = (msg) => {
                console.log("got a message from a peer?");
                console.log(msg);
            };

            connections[data.id] = thing;

            thing.createOffer().then((offer) => {
                thing.setLocalDescription(offer);
            });

        } else if (data.type === 'answer') {
            const connection = connections[data.targetId];
            connection.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
    };
};

const makePeerRequest = () => {
    socket.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.type === 'offer') {
            const connection = new RTCPeerConnection();
            const dataChannel = connection.createDataChannel('homegames');
 
            connection.onicecandidate = (e) => {
                if (e.candidate !== null) {
                    socket.send(JSON.stringify(connection.localDescription));
                }
            };
    
            connection.ondatachannel = (e) => {
                const chan = e.channel || e;

                if (chan && chan.readyState === 'open') {
                    chan.send("AYY LMAO I AM A PEER");
                }
            };

            const times = [];
            dataChannel.onmessage = (msg) => {
                const diff = Date.now() - Number(msg.data);
                times.push(Date.now());
                if (times.length % 60 === 0) {
                    output.innerHTML = 'Got 60 frames in ' + Number(times[times.length - 1] - times[times.length - 61]) + 'ms. ' + times.length + ' total messages in ' + Number(times[times.length - 1] - times[0]) + 'ms';
                }
            };

            connection.setRemoteDescription(new RTCSessionDescription(data));
            connection.createAnswer().then((answer) => {
                connection.setLocalDescription(answer);
            }).then(_ => {
                console.log("WHAT IS THIS");
                if (connection.canTrickleIceCandidates) {
                    console.log("WHAT");
                    return connection.localDescription;
                }
            }).then(ting => {
                console.log("TING?");
                console.log(ting);
            });
            
        }
    };

    socket.send(JSON.stringify({
        type: "PeerRequest"
    }));
};

const broadcastTimestamps = () => {
    const timestamp = Date.now();
    for (const clientId in channels) {
        const channel = channels[clientId];
        if (channel.readyState === 'open') {
            channel.send(timestamp);
        }
    }
};

socket.onopen = async () => {
    const isHost = await becomeHost();
    if (isHost) {
        listenForConnections();
        setInterval(broadcastTimestamps, 2);
    } else {
        makePeerRequest();
    }
};


onerror = (a, b, c, d, e, f) => {
   errors.innerHTML = '' + a + ' ' + b + ' ' + c + ' ' + d + ' ' + e + ' ' + f; 
};
