const RTCRelay = require('rtc-relay');

const times = [];
const output = document.getElementById('output');

const relay = new RTCRelay(`ws://${window.location.hostname}`, () => {
    relay.send('i am a client');
}, (msg) => {
    times.push(Date.now());
    if (times.length % 100 === 0) {
        output.innerHTML = `Got 100 messages in ${times[times.length - 1] - times[times.length - 61]}ms`;
    }
}, 'arraybuffer');
