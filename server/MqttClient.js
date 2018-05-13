const mqtt = require('mqtt');  
const uuidv4 = require('uuid/v4');

const config = require('./settings/config.json');

class MqttClient {

    constructor(subscriptions, clientId = undefined, verbose = false, qosLevel = 2) {
        this.mqttServerUrl = `${config.protocol}://${config.host}:${config.port}/mqtt`;
        this.clientId = clientId ? clientId : uuidv4();        
        const events = ['reconnect', 'close', 'offline', 'error', 'end', 'packetsend', 'packetreceive'];
        
        this.connect();        
        this.subscriptions = subscriptions;       
        this.qosLevel = qosLevel;
        this.setOnConnectEvent();        
        
        this.mqttClient.on('packetreceive', (data) => {  
            console.log('[PACKET REVEIVE] ',verbose ? data : '');
        });
        this.mqttClient.on('packetsend', (data) => {  
            console.log('[PACKET SEND] ',verbose ? data : '');
        });
        this.mqttClient.on('end', () => {  
            console.log('[END]');
        });
        this.mqttClient.on('reconnect', () => {  
            console.log('[RECONNECT] ');
        });
        this.mqttClient.on('close', () => {  
            console.log('[CLOSE] ');
        });
        this.mqttClient.on('offline', () => {  
            console.log('[OFFLINE] ');
        });
        this.mqttClient.on('error', (data) => {  
            console.log('[ERROR] ',data);
        });
        this.mqttClient.on('message', (topic, message) => {  
            console.log(`[MESSAGE] '| Message : ${message} | from topic: ${topic}'`);
        });
    }

    setOnConnectEvent() {
        this.mqttClient.on('connect', (connack) => {  
            console.log('[CONNECT] Using id-> ', this.clientId);  
            if (connack.sessionPresent) {
                console.log('[CONNECT] Already registered. Returning.');
                return;
            }   
         
            this.subscriptions.forEach(item => {                 
              this.subscribe(item.topic)                
            });              

          });
    }
    connect() {
        this.mqttClient = mqtt.connect(this.mqttServerUrl, {
            clean: false,
            clientId: this.clientId
        });
    }

    subscribe(topic) {
        console.log('[SUBSCRIBE] Try to new topic ',topic)
        this.mqttClient.subscribe(topic, {qos : this.qosLevel}, (err, granted) => {
            console.log('[SUBSCRIBE] ERR -> ',err);
            console.log('[SUBSCRIBE] granted -> ', granted)
        });                 
    }
    
    publishMessage(topic, message) {          
        this.mqttClient.publish(topic, {qos : this.qosLevel}, message, (err) => {
            console.log('[PUBLISH ERR] ->', err);
        }); 
    }

    reconnect() {
        this.mqttClient = mqtt.reconnect(this.mqttServerUrl, {
            clean: false,
            clientId: this.clientId
        });
    }

    end() {
        this.mqttClient.end(true, () => {})
    }
}

module.exports = MqttClient;