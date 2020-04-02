const RTCRelay = require('rtc-relay');

const relay = new RTCRelay(`ws://${window.location.hostname}`, () => {
    relay.send('i am a client');
}, (msg) => {
    console.log('got a message!');
    console.log(msg);
}, 'arraybuffer');
