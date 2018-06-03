const EventEmitter = require('events');

module.exports = class VoiceService extends EventEmitter {
    constructor() {
        super();        
    }

    processMessage(msg) {
        console.log('[x] [VOICE SERVICE]');
        console.log("[x] %s:'%s'", msg.fields.routingKey, msg.content.toString(), msg.fields.exchange);
        
        const jsonedMessage = JSON.parse(msg.content);            
    }
}