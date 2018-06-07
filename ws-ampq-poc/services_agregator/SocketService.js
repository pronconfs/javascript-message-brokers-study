const Primus = require('primus')
const EventEmitter = require('events');
const PrimusResponder = require('primus-responder');
const _ = require('lodash');

/** 
 * `` 
*/

module.exports = class SocketService extends EventEmitter {
    constructor(server, targetPort) {
        super();
        this.server = server;        
            
        this.ACTIVE_SPARKS_COLLECTION = 'prev_sparks_per_user';
        
        this.SPARKS = {};
        
        const options = { transformer: "engine.io" };
        const primus = new Primus(this.server, { options });        

        primus.plugin('responder', PrimusResponder);  
        primus.on("connection", (spark) => {                             

            spark.write({id : spark.id});            
            spark.on("request from server", (data) => this.onData(data, spark) )
            spark.on("request", (data) => this.onData(data, spark) )
            spark.on("data", (data) => this.onData(data, spark) )
            spark.on("end", (data) => this.onEnd(data,spark))
        });
        this.listen(targetPort);  
        
        primus.save(__dirname +'/primus.js');

    }

    set sparkMappings(mappings) {
        if (typeof this.SPARKS[mappings.currSocket] !== 'object') {
            this.SPARKS[mappings.currSocket] = mappings.userId;                 
        }        
    }

    /** 
     * 
     * 
     * Primus Events section
     * 
     */   

    onData(data, spark) {  
        console.log(`[SERVICE AGREGATOR] Received data on ${this.server.service} || ${JSON.stringify(data)}`)
        if (data.subscribe)  {        
            spark.userId = data.prevSockId;
            this.SPARKS[spark.id] = spark; 
            this.checkForExistingUserMappings(spark);       
            return this.emit('consume_queue', spark, data.prevSockId, this.server.service);                     
        }  
                 
        data.sparkId = spark.id;
        data.unicast = true;
        return this.emit('publish_queue', this.server.service, data, spark);
    }

    onEnd(data, spark) {
        delete this.SPARKS[spark.id];                              
    }

    listen(targetPort) {
        this.server.listen(targetPort, () => {
            console.log(`[AGREGATOR] Listeneing in ${targetPort} for ${this.server.service}`);
        });
    }

    checkForExistingUserMappings(nextSpark) {        
        Object.keys(this.SPARKS).forEach( spark => {            
            if (typeof spark !== 'object' && nextSpark.userId === this.SPARKS[spark]) {                
                this.SPARKS[spark] = nextSpark;
            }
        })        
    }
    
    /**
     * 
     * 
     * Send websocket data section
     * 
     * 
     */

    sendTo(sparkId, msg, finishTransmission) {           
        if (!Object.keys(this.SPARKS).includes(sparkId) || typeof this.SPARKS[sparkId] !== 'object') {
            console.log('[SOCKET SERVICE] No user logged to receive the message')              
            return;
        }        
        
        this.SPARKS[sparkId].writeAndWait(msg, (response) => {
            console.log('DONE')            
        });        
        finishTransmission();       
    }
    
    sendMulticast(sparkIdsArray, msg, finishTransmission) {
        sparkIdsArray.forEach( sparkId => {
            this.sendTo(sparkId, msg, finishTransmission);
        })
    }

    sendBroadcast(msg, finishTransmission) {        
        Object.keys(this.SPARKS).forEach( spark => {
            this.sendTo(spark.id, msg, finishTransmission);
        });             
    }    
}
