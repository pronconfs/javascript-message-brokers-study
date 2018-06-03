module.exports = class ChatService {
    processMessage(msg) {
        console.log('[x] [CHAT SERVICE]');
        console.log("[x] %s:'%s'", msg.fields.routingKey, msg.content.toString(), msg.fields.exchange);
    }
}