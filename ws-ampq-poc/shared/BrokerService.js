const amqp = require('amqplib/callback_api');
const EventEmitter = require('events');
const brokerConfigs = require('../settings/brokerConfigs.json');

module.exports = class BrokerService extends EventEmitter {
    constructor(host, slavesConsumer=[], slavesPublisher=[]) {
        super();

        this.masterDiscoveryTimeout = 3000;
        this.CONN_REFUSED_ERR = 'ECONNREFUSED';
        this.CHANNEL_CLOSE_ERR = 'Channel closed'
        this.isBrokerConnected = false;
        this.discoverdMaster = false;    

        this.brokerUriConsumer = `amqp://${host.rx}`;
        this.brokerUriProducer = `amqp://${host.tx}`;

        this.activeChannels = [];

        this.configs = brokerConfigs;

        this.slavesConsumer = slavesConsumer.map( slave => {
            return `amqp://${slave}`;
        });

        this.slavesPublisher = slavesPublisher.map( slave => {
            return `amqp://${slave}`;
        });                      
    }
    
    startMasterDiscovery() {    
        this.discoverdMaster = false    
        console.log('[BROKER SERVICE] Master lookup');
        amqp.connect(this.brokerUriProducer, (err, conn) => {            
            if (err && err.code === 'ECONNREFUSED') {
                return setTimeout( () => {
                    this.startMasterDiscovery();                    
                }, this.masterDiscoveryTimeout);                
            }                        
            this.onMasterDiscovery()            
        });
    }

    forceLogout(channels) {
        this.activeChannels = channels.filter( channel => {
            try{
                channel.close();                
            }catch(e) {
                if (e.message !== this.CHANNEL_CLOSE_ERR) {
                    console.log('[BROKER SERVICE] Exception forceLogout ',e);                
                }                
            }            
            return false;
        }); 
    }

    consume(queue, channel ,ack = false, exchange = null, prefetch = 0, slave = undefined, slaveIndes = 0) {        
        amqp.connect(slave ? slave : this.brokerUriConsumer, (err, conn) => {
            if (err && err.code === this.CONN_REFUSED_ERR) {                               
                console.log(`[BROKER SERVICE] [ERROR] CONNECTING TO BROKER. Will retry with slave index ${slaveIndes} URL:${this.slavesConsumer[slaveIndes]}`);
                const newSlaveIndex = slaveIndes + 1;
                if (slaveIndes === 0) {
                    this.startMasterDiscovery();
                }
                if (newSlaveIndex > this.slavesConsumer.length) {
                    console.log(`[BROKER SERVICE] [ERROR] COULD NOT RECONNECT TO SLAVES`); 
                    return;                     
                }
                return this.consume(queue,channel,ack,exchange,prefetch,this.slavesConsumer[slaveIndes], newSlaveIndex);
            }
            
            this.isBrokerConnected = true;
            conn.on('close',this.onConnectionClose.bind(this));

            conn.createChannel((err, ch) => {   
                this.activeChannels.push(ch);                                             
                exchange !== null && ch.assertExchange(exchange.name, exchange.type, {
                    durable: exchange.durable,
                    autoDelete: exchange.autoDelete,                                   
                });
                prefetch > 0 && ch.prefetch(prefetch);
                ch.assertQueue(queue.name, {
                    exclusive: queue.exclusive,                    
                    durable: queue.durable,
                    autoDelete: queue.autoDelete,
                }, (err, q) => {
                    console.log('[BROKER SERVICE] Waiting for logs.',q);
                    exchange !== null && ch.bindQueue(q.queue, exchange.name, queue.key);
                    ch.consume(q.queue, (msg) => {                        
                        this.emit('received_queue_data', queue, msg, channel, () => ack && ch.ack(msg) );
                    }, {noAck: !ack});
                });
            });
        });
    }

    publish(exchange, key, msg, slave=undefined, slaveIndes=0) {
        amqp.connect(slave ? slave : this.brokerUriProducer, (err, conn) => {
            if (err && err.code === this.CONN_REFUSED_ERR) {                               
                console.log(`[ERROR] CONNECTING TO BROKER. Will retry with slave index ${slaveIndes} URL:${this.slavesPublisher[slaveIndes]}`);
                const newSlaveIndex = slaveIndes + 1;
                if (slaveIndes === 0) {
                    this.startMasterDiscovery();
                }
                if (newSlaveIndex > this.slavesPublisher.length) {
                    console.log(`[BROKER SERVICE] [ERROR] COULD NOT RECONNECT TO SLAVES`); 
                    return;                     
                }
                return this.publish(exchange, key,msg, this.slavesPublisher[slaveIndes], newSlaveIndex);
            }            
                     
            this.isBrokerConnected = true;
            conn.on('close',this.onConnectionClose.bind(this));

            conn.createChannel( (err, ch) => {                        
                ch.assertExchange(exchange.name, exchange.type, {
                    durable: exchange.durable,                    
                    autoDelete: exchange.autoDelete,                    
                });
                
                const newMsg = typeof msg.payload !== 'string' ? JSON.stringify(msg.payload) : msg.payload;
                ch.publish(exchange.name, key, new Buffer.from(newMsg), {
                    contentType: 'application/json',
                    persistent: msg.persistent
                });
                console.log(`[BROKER SERVICE] New publish in ${key}`);
            });        
        });
    }

    onConnectionClose() {    
        console.log('[BROKER SERVICE] ON CONNECTION CLOSE')                          
        this.isBrokerConnected && this.emit('closed_connection');
        this.isBrokerConnected = false;
    }

    onMasterDiscovery() {           
        if(this.discoverdMaster) {
            return;
        }       

        this.forceLogout(this.activeChannels); 
        this.emit('dicovered_master');               
        this.discoverdMaster = true;
    }
}
