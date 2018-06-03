export default class MessageProtocol {
    static get PACKET_ACTIONS() {
        return {
            consume : 'consume',
            publish : 'publish',
        }
    }

    constructor(distribution, channel, comons) {

        const distribution = {
            broadcast : false,
            multicast : ['312423dsa', '312423dsb'],
            direct : '312423dsa',
        }

        const channel = {
            voice : true,
            chat : false,
            tickets : false,
        }

        const queueConfigs = {
            packet_action : 'consume | publish',
            publish_target : 'exchange_name',
            consume_target : [],
            message : '',
        }        
    }

    isValidDistribution(distribution) {
        if (distribution.broadcast) {
            return distribution.multicast.length === 0 && distribution.direct.length === 0;
        }

        if (action.multicast.length > 0) {
            return distribution.broadcast === false && distribution.direct.length === 0;
        }

        if (action.direct.length > 0) {
            return distribution.broadcast === false && distribution.multicast.length === 0;
        }
    }

    isValidChannel(channel) {
        if (channel.voice) {
            return channel.chat === false && channel.tickets === false;
        }

        if (channel.chat) {
            return channel.voice === false && channel.tickets === false;
        }

        if (channel.tickets) {
            return channel.voice === false && channel.chat === false;
        }
    }

    isValidAction(action) {
        return Object.keys(MessageProtocol.PACKET_ACTIONS).filter( item => item !== action ).length > 0;
    }

    areValidQueueConfigs(queueConfigs) {

    }
}