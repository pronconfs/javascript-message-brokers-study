export default class {
    constructor(subscribe, message, action, channel) {
        this.subscribe = subscribe;
        this.message = message;
        this.action = action;
        this.channel = channel;
        this.data = {
            subscribe,
            message, 
            action,
            channel
        }
        Object.freeze(this);
    }
}