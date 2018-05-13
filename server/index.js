const MqttClient = require('./MqttClient');
const config = require('./settings/config.json');

const mqttClientS = new MqttClient(config.subscriptions, process.argv[2], true, 2);