let socket;

socket = new WebSocket(`ws://${window.location.hostname}`);

const connections = {};
const channels = {};

const output = document.getElementById('output');

const makePeerRequest = () => {

    socket.onmessage = (msg) => {
        socket.onmessage = null;
        const connection = new RTCPeerConnection({});
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

            const times = [];
            let lastTimestamp;
            chan.onmessage = (msg) => {
                if (!lastTimestamp) {
                    lastTimestamp = msg.data;
                } else if (msg.data < lastTimestamp) {
                    return;
                }
                const diff = Date.now() - Number(msg.data);
                times.push(Date.now());
                if (times.length % 60 === 0) {
                    output.innerHTML = 'Got 60 frames in ' + Number(times[times.length - 1] - times[times.length - 61]) + 'ms. ' + times.length + ' total messages in ' + Number(times[times.length - 1] - times[0]) + 'ms';
                }
            };

        };

        connection.setRemoteDescription(JSON.parse(msg.data));
        connection.createAnswer().then(answer => {
            connection.setLocalDescription(answer);
        });
    };

    socket.send(JSON.stringify({
        type: "PeerRequest"
    }));
};

socket.onopen = async () => {
    makePeerRequest();
};


onerror = (a, b, c, d, e, f) => {
   errors.innerHTML = '' + a + ' ' + b + ' ' + c + ' ' + d + ' ' + e + ' ' + f; 
};
