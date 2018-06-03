const Primus = require('primus')
const EventEmitter = require('events');

module.exports = class SocketService extends EventEmitter {
    constructor(server, targetPort) {
        super();
        this.server = server;        
        
        const INBOUND_QUEUES = {
            newTicket : 'new_ticket',
            newCall : 'new_call',
            newChat : 'new_chat',
        }

        this.SPARKS = {};
        const options = { transformer: "engine.io" };
        const primusVoice = new Primus(this.server, { options });

        primusVoice.on("connection", (spark) => {    
              
            this.SPARKS[spark.id] = spark;

            spark.write(`CONNECTED TO ${server.service} ID = ${spark.id} || CURR CONNECTIONS = ${Object.keys(this.SPARKS).length}`)

            spark.on("data", (data) => {
                console.log(`[SERVICE AGREGATOR] ON Data -> ${server.service}: ${JSON.stringify(data)}`)
                if (data.subscribe)  {                    
                    const targetQueue = '';
                    return this.emit('consume_queue', data, spark);                    
                }               
                return this.emit('publish_to_queue', data, spark, targetQueue);
            })

            spark.on("end", (data) => {   
                if (Object.keys(this.SPARKS).includes(spark.id)) {
                    delete this.SPARKS[spark.id];
                }                                  
            })
        });
        this.listen(targetPort);
        
    }

    listen(targetPort) {
        this.server.listen(targetPort, () => {
            console.log(`[AGREGATOR] Listneing in ${targetPort} for ${this.server.service}`);
        });
    }

    sendTo(sparkId, msg) {
        if (Object.keys(this.SPARKS).includes(sparkId)) {
            this.SPARKS[sparkId].write(msg);
        }        
    }
    
    sendMulticast(sparkIdsArray, msg) {
        sparkIdsArray.forEach( sparkId => {
            this.sendTo(sparkId, msg);
        })
    }

    sendBroadcast(msg) {
        Object.keys(this.SPARKS).forEach( sparkId => {
            this.sendTo(sparkId, msg);
        })
    }
}
