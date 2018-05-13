const MqttClient = require('./MqttClient');
const config = require('./settings/config.json');

const mqttClientS = new MqttClient(config.subscriptions);

setTimeout( () => {
    //mqttClientS.end(true);
}, 2000);

setTimeout( () => {
    //mqttClientS.connect();
}, 8000);