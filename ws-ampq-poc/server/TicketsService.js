module.exports = class TicketsService {
    processMessage(content) {
        console.log('[x] [TICKETS SERVICE]');
        console.log("[x] %s:'%s'", msg.fields.routingKey, msg.content.toString(), msg.fields.exchange);
    }
}