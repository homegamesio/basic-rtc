let socket;

const init = () => {
    const thing = new RTCPeerConnection();
//    const dataChannel = thing.createDataChannel('test');
    
//    dataChannel.onopen = (thang) => {
//        console.log("OPENED!");
//        console.log(thang);
//    };
//    
//    dataChannel.onmessage = (message) => {
//        console.log("MESSAGE");
//        console.log(message);
//    };
    
//    dataChannel.onconnection = () => {
//        console.log("GOT CONNECTION?");
//    };
    
    const el = document.getElementById('ting');
    
    const button = document.getElementById('button');
    
    const output = document.getElementById('output');
    
    thing.onicecandidate = (e) => {
        if (e.candidate === null) {
            socket.send(JSON.stringify(thing.localDescription));
        }
    };
    
    thing.ondatachannel = (e) => {
        console.log("DATA CHANNEL!");
        const chan = e.channel || e;
        setInterval(() => {
            chan.send(Date.now());
        }, 1000/60);
    };
    
    console.log("huh");
    thing.createOffer().then((desc) => {
        const dataChannel = thing.createDataChannel('test');
        console.log("DATA CHANNEL");
        thing.setLocalDescription(desc);
        socket.onmessage = (msg) => {
            console.log("GOT MESSAGE");
            console.log(msg.data);
            thing.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.data)));
        };
    });
};

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
//    const thing = new RTCPeerConnection();
//    thing.createOffer().then((desc) => {
//        thing.setLocalDescription(desc);
//        thing.ondatachannel = (e) => {
//            console.log("DATA CHANNEL!");
//            const chan = e.channel || e;
//            setInterval(() => {
//                chan.send(Date.now());
//            }, 1000/60);
//        };
// 
//        const dataChannel = thing.createDataChannel('test');
//        socket.send(JSON.stringify(desc));
//        console.log(dataChannel);
//        //socket.onmessage = (msg) => {
//        //    console.log("GOT MESSAGE");
//        //    console.log(msg.data);
//        //    thing.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.data)));
//        //};
//    });
//};

const initializeChannel = () => {
    const thing = new RTCPeerConnection();
    thing.createOffer().then((desc) => {
        thing.setLocalDescription(desc);
        socket.send(JSON.stringify(desc));
        thing.ondatachannel = (e) => {
            console.log("DATA CHANNEL!");
            const chan = e.channel || e;
            console.log(chan);
        };
    });
//            setInterval(() => {
//                chan.send(Date.now());
//            }, 1000/60);
//        };
// 
//        const dataChannel = thing.createDataChannel('test');
//        socket.send(JSON.stringify(desc));
//        console.log(dataChannel);
//        //socket.onmessage = (msg) => {
//        //    console.log("GOT MESSAGE");
//        //    console.log(msg.data);
//        //    thing.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.data)));
//        //};
//    });

};

socket = new WebSocket('ws://localhost');

const connections = {};

const listenForConnections = () => {
    socket.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.type === 'PeerRequest') {
            console.log("nice someone wants to be a peer");
            const thing = new RTCPeerConnection();
 
            thing.onicecandidate = (e) => {
                console.log('ice candidate');
                if (e.candidate === null) {
                    socket.send(JSON.stringify(thing.localDescription));
                }
            };
    
            thing.ondatachannel = (e) => {
                console.log("DATA CHANNEL!");
                const chan = e.channel || e;
                console.log(chan);
                //setInterval(() => {
                //    chan.send(Date.now());
                //}, 1000/60);
            };

            connections[data.id] = thing;

            thing.createOffer().then((offer) => {
                console.log("HUH");
                thing.setLocalDescription(offer);
                socket.send(JSON.stringify({
                    type: "RTCOffer",
                    targetId: data.id,
                    offer
                }));
                //console.log(msg.data);
                //thing.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.data)));
            });
        } else if (data.type === 'answer') {
            console.log("OFFER RESPONSE");
            console.log(data);
            const connection = connections[data.targetId];
            connection.setRemoteDescription(data.answer);
            console.log(data.answer);
            console.log("uhhhh");
            const dataChannel = connection.createDataChannel('test');
            console.log("CREATeD");
        }
    };
};

const makePeerRequest = () => {
    socket.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.type === 'offer') {
            console.log("THIS HAPPENS");
            const connection = new RTCPeerConnection();
 
            connection.onicecandidate = (e) => {
                console.log('peer ice candidate');
                if (e.candidate === null) {
                    //socket.send(JSON.stringify(thing.localDescription));
                }
            };
    
            connection.ondatachannel = (e) => {
                console.log("DATA CHANNEL!");
                const chan = e.channel || e;
                console.log(chan);
                //setInterval(() => {
                //    chan.send(Date.now());
                //}, 1000/60);
            };

            connection.setRemoteDescription(data);
            connection.createAnswer().then((answer) => {
                connection.setLocalDescription(answer);
                socket.send(JSON.stringify(answer));

                const dataChannel = connection.createDataChannel('test');
                console.log('what now');
            });
            
        }
        console.log("DATA");
        console.log(data);
    };

    console.log('sdsfsdf');
    socket.send(JSON.stringify({
        type: "PeerRequest"
    }));
};

socket.onopen = async () => {
    const isHost = await becomeHost();
    console.log("AM I HOST");
    console.log(isHost);
    if (isHost) {
        listenForConnections();
        //initializeChannel();
    } else {
        makePeerRequest();
    }
};

onerror = (a, b, c, d, e) => {
    const ting = document.getElementById('errors');
    ting.innerHTML = ' ' + a + ' ' + b + ' ' + c + ' ' + d + ' ' + e;
}

//throw new Error('ayy lmao');
