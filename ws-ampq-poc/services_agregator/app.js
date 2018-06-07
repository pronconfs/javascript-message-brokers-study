const express = require('express')
const amqp = require('amqplib/callback_api');

const BrokerService = require('../shared/BrokerService');
const SocketService = require('./SocketService');

const app = express();
const environment = process.argv[2];
const brokerService = new BrokerService({
    rx: environment === 'localhost' ? 'localhost:5672' : '3GdtrY_s:78ov3IyCFAxyMNpysTBMt8AgR38PZnik@sad-silver-53.bigwig.lshift.net:10003/6TAe0JLKstBE',
    tx: environment === 'localhost' ? 'localhost:5672' : '3GdtrY_s:78ov3IyCFAxyMNpysTBMt8AgR38PZnik@sad-silver-53.bigwig.lshift.net:10002/6TAe0JLKstBE',
}, ['localhost:5674'], ['localhost:5674']);
 

const VOICE_PORT = process.argv[3];
const CHAT_PORT = process.argv[4];
const TICKETS_PORT = process.argv[5];

const VOICE_CHANNEL = 'VOICE';
const CHAT_CHANNEL = 'CHAT';
const TICKETS_CHANNEL = 'TICKETS'
const SPARKS_CHANNEL = 'SPARKS';

const serverVoice = require('http').createServer(app)
serverVoice.service = VOICE_CHANNEL;
const voiceSocket = new SocketService(serverVoice, VOICE_PORT)
.on('consume_queue' , (spark, prevSockId, socketChannel) => consumeChannels([VOICE_CHANNEL],['out'], spark, prevSockId, socketChannel) )
.on('publish_queue', (channel, data) => onPublishQueue(channel,data,['in'] ));

const serverChat = require('http').createServer(app)
serverChat.service = 'CHAT';
const chatSocket = new SocketService(serverChat, CHAT_PORT)
.on('consume_queue' , (spark, prevSockId, socketChannel) => consumeChannels(['CHAT'],['out'], spark, prevSockId, socketChannel) )
.on('publish_queue', (channel, data) => onPublishQueue(channel,data,['in'] ));

const serverTickets = require('http').createServer(app)
serverTickets.service = 'TICKETS';
const ticketsSocket = new SocketService(serverTickets, TICKETS_PORT)
.on('consume_queue' , (spark, prevSockId, socketChannel) => consumeChannels(['TICKETS'],['out'], spark, prevSockId, socketChannel) )
.on('publish_queue', (channel, data) => onPublishQueue(channel,data,['in']) );

const queueChannelMapper = {
    VOICE : {
        socket : voiceSocket,        
    },
    CHAT : {
        socket : chatSocket,        
    },
    TICKETS : {
        socket : ticketsSocket,        
    },       
}

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
    if (channels[0] !== SPARKS_CHANNEL) {     
        setInterval( () => {
            const msg = {userId: userId, currSocket : spark.id, socketChannel : socketChannel}
            onPublishQueue(SPARKS_CHANNEL, msg, ['pub_sub'], false);
        },2000);        
    }    
}


function onPublishQueue(channel, data, queueType, persistMsg = true) {   
    const exchange = {
        name : brokerService.configs[channel][queueType].exchange.name,
        type : brokerService.configs[channel][queueType].exchange.type,
        durable: brokerService.configs[channel][queueType].exchange.durable,
        autoDelete: brokerService.configs[channel][queueType].exchange.autoDelete,
    }
    const routingKey = brokerService.configs[channel][queueType].queue.bindingKey;      
    brokerService.publish(exchange, routingKey, {persistent : persistMsg, payload : JSON.stringify(data)});
}

function onInOutQueues(queue, data, channel, reply) {
    let jsonedData = JSON.parse(data.content)    
    if (typeof jsonedData === 'string') {
        jsonedData = JSON.parse(jsonedData);
    }
    console.log('[SERVICE_AGREGATOR] Received data in queue onInOutQueues',queue, jsonedData);

    const socket = queueChannelMapper[channel].socket;
    if (jsonedData.unicast) {        
        socket.sendTo(jsonedData.sparkId, jsonedData.message, reply);
    }  

    if (jsonedData.multicast) {
        socket.sendMulticast(jsonedData.sparkIds, jsonedData.message, reply);
    }
    
    if (jsonedData.broadcast) {
        socket.sendBroadcast(jsonedData.message, reply);
    }       
}

function onSparksFanout(data, reply) {
    console.log('[SERVICE_AGREGATOR] Received data in queue onSparksFanout ', data.content.toString());
    const parsedData = JSON.parse(data.content.toString());
    let server;
    if (parsedData.socketChannel === VOICE_CHANNEL) {
        server = voiceSocket;            
    }
    if (parsedData.socketChannel === CHAT_CHANNEL) {     
        server = chatSocket;  
    }
    if (parsedData.socketChannel === TICKETS_CHANNEL) {        
        server = ticketsSocket
    }
    server.sparkMappings = {userId: parsedData.userId, currSocket: parsedData.currSocket};
    return reply();
}

consumeChannels([SPARKS_CHANNEL],['pub_sub'], false);

brokerService.on('received_queue_data', (queue, data, channel, reply) => {  
    if (channel === 'SPARKS') {
        return onSparksFanout(data, reply);
    }  
    return onInOutQueues(queue, data, channel, reply)        
})