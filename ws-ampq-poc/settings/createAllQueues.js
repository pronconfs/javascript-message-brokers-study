const BrokerService = require('../shared/BrokerService');
const environment = process.argv[2];
const brokerService = new BrokerService({
    rx: environment === 'localhost' ? 'localhost:5672' : '3GdtrY_s:78ov3IyCFAxyMNpysTBMt8AgR38PZnik@sad-silver-53.bigwig.lshift.net:10003/6TAe0JLKstBE',
    tx: environment === 'localhost' ? 'localhost:5672' : '3GdtrY_s:78ov3IyCFAxyMNpysTBMt8AgR38PZnik@sad-silver-53.bigwig.lshift.net:10002/6TAe0JLKstBE',
}, ['localhost:5674'], ['localhost:5674']);

function consumeChannels(channels, queueType, spark, userId, socketChannel, shoudAckMsgs = true) {         
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
            brokerService.consume(queue, brokerService.configs[channel].channel, shoudAckMsgs, exchange);
        })        
    })      
}

consumeChannels(['VOICE', 'CHAT', 'TICKETS'],['out','in','external'])

