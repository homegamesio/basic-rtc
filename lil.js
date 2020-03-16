const lilThing = new RTCPeerConnection();

let socket; 

const init = () => {
    const lilDataChannel = lilThing.createDataChannel('test');
    
    lilDataChannel.onopen = (thang) => {
        console.log("HEY");
        console.log(thang);
    };
    
    const times = [];
    lilDataChannel.onmessage = (message) => {
        const now = Date.now()
        const diffMillis = now - Number(message.data);
        times.push(now);
        if (times.length % 60 == 0) {
            output.innerHTML = "60fps in " + (times[times.length - 1] - times[times.length - 61]) + 'ms. ' + times.length + ' total messages received';
        }
    };
    
    lilDataChannel.ondatachannel = (e) => {
        console.log("DATA CHANNEL!");
        console.log(e.channel || e);
    };
    
    lilDataChannel.onconnection = () => {
        console.log("GOT CONNECTION?");
    };
    
    lilDataChannel.ondatachannel = (e) => {
        console.log("E");
        console.log(e);
    };
    
    const el = document.getElementById('ting');
    
    const button = document.getElementById('button');
    
    const output = document.getElementById('output');
    
    socket.onmessage = (msg) => {
        console.log("UHDSF");
        console.log(msg);
        const offer = JSON.parse(msg.data);
        lilThing.setRemoteDescription(offer);
        lilThing.createAnswer().then((answer) => {
            lilThing.setLocalDescription(answer);
        });

    };

    lilThing.onicecandidate = (e) => {
        if (e.candidate == null) {
            socket.send(JSON.stringify(lilThing.localDescription));
        }
    };
    
};

const hostname = window.location.hostname;

socket = new WebSocket('ws://' + hostname);
socket.onopen = () => {
    init();
};

onerror = (a, b, c, d, e) => {
    const ting = document.getElementById('errors');
    ting.innerHTML = ' ' + a + ' ' + b + ' ' + c + ' ' + d + ' ' + e;
}

//throw new Error('ayy lmao');
