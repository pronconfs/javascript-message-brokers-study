import Primus from './lib/primus';

export default class PrimusManager {
    constructor(host, port) {
        const primus = new Primus(`http://${host}:${port}`);
        
        primus.on('reconnect', function () {
            console.log('primus: reconnect event happend');
        });
        primus.on('open', function () {
            console.log('primus: connection established');
            primus.write('hello world');
        });
        primus.on('error', function (err) {
            console.log('primus: error event', err);
        });
        primus.on('data', function (data) {
            this.onData(data);
            console.log('primus: received data', data);
        });
        primus.on('end', function () {
            console.log('primus: connection closed');
        });
    }

    write(message) {
        primus.write(message);
    }

    onData(callback) {
        callback(data);
    }
}