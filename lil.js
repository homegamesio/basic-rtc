const lilThing = new RTCPeerConnection();

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
        console.log("60fps in " + (times[times.length - 1] - times[times.length - 61]) + 'ms');
    }
//    if (diffMillis >= 5) {
//        console.log("ay");
//        console.log(diffMillis);
//    }
    //lilDataChannel.send('i got that bruv');
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


lilThing.onicecandidate = (e) => {
    if (e.candidate == null) {
        output.innerHTML = JSON.stringify(lilThing.localDescription);
    }
};

button.onclick = () => {
    const offer = JSON.parse(el.value);
    lilThing.setRemoteDescription(offer);
    lilThing.createAnswer().then((answer) => {
        lilThing.setLocalDescription(answer);
    });
};

