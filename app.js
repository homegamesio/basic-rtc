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
            console.log("gonna send");
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
    
    let clacked;
    thing.createOffer().then((desc) => {
        thing.setLocalDescription(desc);
        button.onclick = () => {
                if (clacked) {
                    return;
                }
                clacked = true;
                thing.setRemoteDescription(new RTCSessionDescription(JSON.parse(el.value)));
            };
        });
    };
};

socket = new WebSocket('ws://localhost');
socket.onopen = () => {
    console.log('opened that shit');
    init();
};
