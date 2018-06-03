const amqp = require('amqplib/callback_api');
const EventEmitter = require('events');

module.exports = class BrokerService extends EventEmitter {
    constructor(host) {
        super();
        this.ERROR_CODES = {
            ACCESS_REFUSED : '403',
            PRECONDITION_FAILED : '406',
            RESOURCE_LOCKED : 'XXX',            
        }
        this.brokerUriConsumer = `amqp://${host.rx}`;
        this.brokerUriProducer = `amqp://${host.tx}`;
    }

    consume(queue, channel ,ack=false, exchange=null) {        
        amqp.connect(this.brokerUriConsumer, (err, conn) => {
            if (err) {
                console.log('[ERROR] CONNECTING TO BROKER', error);
                return;
            }
            conn.createChannel((err, ch) => {                                
                exchange !== null && ch.assertExchange(exchange.name, exchange.type, {
                    durable: exchange.durable,
                    autoDelete: exchange.autoDelete,
                    /* internal: exchange.internal, */                    
                });

                ch.assertQueue(queue.name, {
                    exclusive: queue.exclusive,                    
                    durable: queue.durable,
                    autoDelete: queue.autoDelete,
                    /* messageTtl: queue.messageTtl,
                    expires: queue.expires,
                    deadLetterExchange: queue.deadLetterExchange,
                    deadLetterRoutingKey: queue.deadLetterRoutingKey,
                    maxLength: queue.maxLength,
                    maxPriority: queue.maxPriority, */
                }, (err, q) => {
                    console.log(` [*] Waiting for logs. To exit press CTRL+C`);
                    exchange !== null && ch.bindQueue(q.queue, exchange.name, queue.key);
                    ch.consume(q.queue, (msg) => {                        
                        this.emit('new_message', queue, msg, channel, () => {                            
                            setTimeout( () => { ack && ch.ack(msg) },4000);
                        });
                    }, {noAck: !ack});
                });
            });
        });
    }

    bulkConsume(brokerExternalConfigs) {        
        Object.keys(brokerExternalConfigs).forEach( item => {
            this.consume({
                name : brokerExternalConfigs[item].name,
                durable : false,
                autoDelete : true,
                key: brokerExternalConfigs[item].exchange.bindingKey 
            }, brokerExternalConfigs[item].channel, true, {
                name: brokerExternalConfigs[item].exchange.name,
                type: brokerExternalConfigs[item].exchange.type,
                durable: false,
                autoDelete: true,
            })
        })
    }

    publish(exchange, msg) {
        amqp.connect(this.brokerUriProducer, (err, conn) => {
            conn.createChannel( (err, ch) => {                        
                ch.assertExchange(exchange.name, exchange.type, {
                    durable: exchange.durable,                    
                    autoDelete: exchange.autoDelete,
                    /* internal: exchange.internal, */
                });

                ch.publish(exchange.name, exchange.bindingKey, new Buffer.from(JSON.stringify(msg.payload)), {persistent: msg.persistent});
                console.log(" [x] Sent %s:'%s'", exchange.bindingKey, msg.payload);
            });        
        });
    }
}