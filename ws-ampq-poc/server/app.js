const VoiceService = require('./VoiceService');
const ChatService = require('./ChatService');
const TicketService = require('./TicketsService');
const BrokerService = require('../shared/BrokerService');

const environment = process.argv[2];
const brokerService = new BrokerService({
    rx: environment === 'localhost' ? 'localhost:5672' : '3GdtrY_s:78ov3IyCFAxyMNpysTBMt8AgR38PZnik@sad-silver-53.bigwig.lshift.net:10003/6TAe0JLKstBE',
    tx: environment === 'localhost' ? 'localhost:5672' : '3GdtrY_s:78ov3IyCFAxyMNpysTBMt8AgR38PZnik@sad-silver-53.bigwig.lshift.net:10002/6TAe0JLKstBE',
}, ['localhost:5674'], ['localhost:5674']);

const voiceService = new VoiceService();
const ticketsService = new TicketService();
const chatService = new ChatService();

function consumeChannels(channels, queueType) {
    channels.forEach( channel => {
        queueType.forEach( type => {
            const queue = {
                name : brokerService.configs[channel][type].queue.name,
                durable : brokerService.configs[channel][type].queue.durable,
                autoDelete : brokerService.configs[channel][type].queue.autoDelete,
                exclusive : brokerService.configs[channel][type].queue.exclusive,
                key : brokerService.configs[channel][type].queue.bindingKey,
            }
            const exchange = {
                name : brokerService.configs[channel][type].exchange.name,
                type : brokerService.configs[channel][type].exchange.type,
            }
            brokerService.consume(queue, brokerService.configs[channel].channel, true, exchange);
        })        
    })
}

consumeChannels(['VOICE','CHAT','TICKETS'],['external','in']);

brokerService.on('received_queue_data', (queue, data, channel, finish) => {        
    let jsonedData = JSON.parse(data.content)
    if (typeof jsonedData === 'string') {
        jsonedData = JSON.parse(jsonedData);
    }
    
    console.log('[SERVER] Received new message from queue. Will now process it', JSON.stringify(jsonedData, undefined, 2));
    
    setTimeout( () => {
        console.log('[SERVER] Finished with message');
        finish();
        
        if (jsonedData.noReply) {
            console.log('[SERVER] Will break the event since client sent noReply');
            return;
        }

        console.log(`[SERVER] Will publish on ${channel}`);

        const exchange = {
            name : brokerService.configs[channel].out.exchange.name,
            type : brokerService.configs[channel].out.exchange.type,
            durable: brokerService.configs[channel].out.exchange.durable,
            autoDelete: brokerService.configs[channel].out.exchange.autoDelete,
        }
        const routingKey = brokerService.configs[channel].out.queue.bindingKey;    
        brokerService.publish(exchange, routingKey, {persistent : true, payload : data.content.toString()});
        //const serviceProcess = brokerExternalConfigs[queue.name].service(msg);
        //console.log('NEW MESSAGE', queue, msg.content.toString(), channel);                    
    }, jsonedData.work_time * 1000)    
})

brokerService.on('closed_connection', () => {    
    console.log('[SERVER] Closed connection') 
    consumeChannels(['VOICE','CHAT','TICKETS'],['external','in']);
})

brokerService.on('dicovered_master', () => {   
    console.log('[SERVER] Discovered master.') 
    consumeChannels(['VOICE','CHAT','TICKETS'],['external','in']);
    brokerService.discoverdMaster = false;
})