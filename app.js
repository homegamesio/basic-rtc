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

socket = new WebSocket('ws://localhost');

const connections = {};

const listenForConnections = () => {
    socket.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.type === 'PeerRequest') {
            const thing = new RTCPeerConnection();
            const dataChannel = thing.createDataChannel('homegames');
 
            thing.onicecandidate = (e) => {
                if (e.candidate === null) {
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
                chan.send('uhhhh im a host');
//                setInterval(() => {
//                    chan.send(Date.now());
//                }, 1000/60);
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
                if (e.candidate === null) {
                    socket.send(JSON.stringify(connection.localDescription));
                }
            };
    
            connection.ondatachannel = (e) => {
                const chan = e.channel || e;
                chan.send("AYY LMAO I AM A PEER");
            };

            dataChannel.onmessage = (msg) => {
                console.log("Got a message from the host");
                console.log(msg);
            };

            connection.setRemoteDescription(new RTCSessionDescription(data));
            connection.createAnswer().then((answer) => {
                connection.setLocalDescription(answer);
            });
            
        }
    };

    socket.send(JSON.stringify({
        type: "PeerRequest"
    }));
};

socket.onopen = async () => {
    const isHost = await becomeHost();
    if (isHost) {
        listenForConnections();
    } else {
        makePeerRequest();
    }
};

