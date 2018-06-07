export default class {
    constructor(subscribe, message, action, channel, noReply=true, work_time = 0, prevSockId=0) {        
        this.data = {
            subscribe,
            message, 
            action,
            channel,
            noReply,
            work_time,
            prevSockId,
        }        
        Object.freeze(this);
    }
}