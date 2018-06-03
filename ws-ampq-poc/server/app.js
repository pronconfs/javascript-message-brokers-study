const VoiceService = require('./VoiceService');
const ChatService = require('./ChatService');
const TicketService = require('./TicketsService');
const BrokerService = require('./BrokerService');

const environment = process.argv[2];
const brokerService = new BrokerService({
    rx: environment === 'localhost' ? 'localhost' : '3GdtrY_s:78ov3IyCFAxyMNpysTBMt8AgR38PZnik@sad-silver-53.bigwig.lshift.net:10003/6TAe0JLKstBE',
    tx: environment === 'localhost' ? 'localhost' : '3GdtrY_s:78ov3IyCFAxyMNpysTBMt8AgR38PZnik@sad-silver-53.bigwig.lshift.net:10002/6TAe0JLKstBE',
});

const voiceService = new VoiceService();
const ticketsService = new TicketService();
const chatService = new ChatService();

const brokerExternalConfigs = {
    external_events_voice : {
        channel : 'VOICE',
        name : 'external_events_voice',
        service : voiceService.processMessage,
        exchange : {
            name : 'external_events_exchange',
            bindingKey : 'bind_external_events_voice',
            type: 'direct',
        }
    },
    external_events_chat : {
        channel : 'CHAT',
        name : 'external_events_chat',
        service : chatService.processMessage,
        exchange : {
            name : 'external_events_exchange',
            bindingKey : 'bind_external_events_chat',
            type: 'direct',
        }
    },
    external_events_tickets : {
        channel : 'TICKETS',
        name : 'external_events_tickets',
        service : ticketsService.processMessage,
        exchange : {
            name : 'external_events_exchange',
            bindingKey : 'bind_external_events_tickets',
            type: 'direct',
        }
    }
}

brokerService.bulkConsume(brokerExternalConfigs);
brokerService.on('new_message', (queue, msg, channel, finish) => {
    const serviceProcess = brokerExternalConfigs[queue.name].service(msg);
    console.log('NEW MESSAGE', queue, msg.content.toString(), channel);    
    finish();
})

