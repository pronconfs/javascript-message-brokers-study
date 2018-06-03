const express = require('express')
const amqp = require('amqplib/callback_api');

const BrokerService = require('./BrokerService');
const SocketService = require('./SocketService');

const app = express();
const environment = process.argv[2];
const brokerService = new BrokerService({
    rx: environment === 'localhost' ? 'localhost' : '3GdtrY_s:78ov3IyCFAxyMNpysTBMt8AgR38PZnik@sad-silver-53.bigwig.lshift.net:10003/6TAe0JLKstBE',
    tx: environment === 'localhost' ? 'localhost' : '3GdtrY_s:78ov3IyCFAxyMNpysTBMt8AgR38PZnik@sad-silver-53.bigwig.lshift.net:10002/6TAe0JLKstBE',
});

const VOICE_PORT = 4001;
const CHAT_PORT = 4002;
const TICKETS_PORT = 4003;

const serverVoice = require('http').createServer(app)
serverVoice.service = 'VOICE';
const voiceSocket = new SocketService(serverVoice, VOICE_PORT)
.on('consume_queue' , onConsumeQueuesForChannel )
.on('publish_to_queue', onPublishQueue );

const serverChat = require('http').createServer(app)
serverChat.service = 'CHAT';
const chatSocket = new SocketService(serverChat, CHAT_PORT)
.on('consume_queue' , onConsumeQueuesForChannel )
.on('publish_to_queue', onPublishQueue );

const serverTickets = require('http').createServer(app)
serverTickets.service = 'TICKETS';
const ticketsSocket = new SocketService(serverTickets, TICKETS_PORT)
.on('consume_queue' , onConsumeQueuesForChannel )
.on('publish_to_queue', onPublishQueue );

const queueChannelMapper = {
    VOICE : {
        socket : voiceSocket,
        name : 'out_voice_queue',     
        exchange : {
            name : 'out_voice_exchange',
            bindingKey : 'out_voice_bind_key',
            type: 'direct',
        }
    },
    CHAT : {
        socket : chatSocket,
        name : 'out_chat_queue',        
        exchange : {
            name : 'out_chat_exchange',
            bindingKey : 'out_chat_bind_key',
            type: 'direct',
        }
    },
    TICKETS : {
        socket : ticketsSocket,
        name : 'out_tickets_queue',        
        exchange : {
            name : 'out_tickets_exchange',
            bindingKey : 'out_tickets_bind_key',
            type: 'direct',
        }
    },       
}

function onConsumeQueuesForChannel(data, spark) {
    if (Object.prototype.hasOwnProperty.call(queueChannelMapper, data.channel)) {        
        const consumeConfigs = queueChannelMapper[data.channel];
        const queue = {
            name : consumeConfigs.name,
            durable : false,
            autoDelete : true,
            key : consumeConfigs.exchange.bindingKey,
        }
        const exchange = {
            name: consumeConfigs.exchange.name,
            type: consumeConfigs.exchange.type,
            durable: false,
            autoDelete: true,
        }
        brokerService.consume(queue, data.channel  ,true, exchange);
    } 
}

function onPublishQueue(data, spark, targetQueue) {
    console.log('on publish')
}
/**
 * {
    "unicast" : false,
    "multicast" : true,
    "broadcast" : false,
    "sparkId" : '',
    "sparkIds" : ["Zv_jzSU7YZyembimOLAO0", "GCO8hkfAdmMzJEMink1ya"],
    "message":"teste"
    }
 */
brokerService.on('new_message_arrived', (queue, data, channel, reply) => {        
    const jsonedData = JSON.parse(data.content);
    const socket = queueChannelMapper[channel].socket;
    if (jsonedData.unicast) {
        socket.sendTo(jsonedData.sparkId, jsonedData.message);
    }  

    if (jsonedData.multicast) {
        socket.sendMulticast(jsonedData.sparkIds, jsonedData.message);
    }
    
    if (jsonedData.broadcast) {
        socket.sendBroadcast(jsonedData.message);
    }    
    reply();
})

