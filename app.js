const thing = new RTCPeerConnection();

let socket;

const init = () => {
    const dataChannel = thing.createDataChannel('test');
    
    dataChannel.onopen = (thang) => {
        console.log("OPENED!");
        console.log(thang);
    };
    
    dataChannel.onmessage = (message) => {
        console.log("MESSAGE");
        console.log(message);
    };
    
    dataChannel.onconnection = () => {
        console.log("GOT CONNECTION?");
    };
    
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
    
    thing.createOffer().then((desc) => {
        thing.setLocalDescription(desc);
        socket.onmessage = (msg) => {
            console.log("GOT MESSAGE");
            console.log(msg.data);
            thing.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.data)));
        };
    });
};

socket = new WebSocket('ws://localhost');
socket.onopen = () => {
    init();
};

onerror = (a, b, c, d, e) => {
    const ting = document.getElementById('errors');
    ting.innerHTML = ' ' + a + ' ' + b + ' ' + c + ' ' + d + ' ' + e;
}

//throw new Error('ayy lmao');
