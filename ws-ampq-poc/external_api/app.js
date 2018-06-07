const express = require('express');
const bodyParser = require('body-parser');

const BrokerService = require('../shared/BrokerService');

const environment = process.argv[2];
const brokerService = new BrokerService({
    rx: environment === 'localhost' ? 'localhost:5672' : '3GdtrY_s:78ov3IyCFAxyMNpysTBMt8AgR38PZnik@sad-silver-53.bigwig.lshift.net:10003/6TAe0JLKstBE',
    tx: environment === 'localhost' ? 'localhost:5672' : '3GdtrY_s:78ov3IyCFAxyMNpysTBMt8AgR38PZnik@sad-silver-53.bigwig.lshift.net:10002/6TAe0JLKstBE',
}, ['localhost:5674'], ['localhost:5674']);

const app = express(); 
const router = express.Router();

function publish(data, channel) {
    const exchange = {
        name : brokerService.configs[channel].external.exchange.name,
        type : brokerService.configs[channel].external.exchange.type,
        durable: brokerService.configs[channel].external.exchange.durable,
        autoDelete: brokerService.configs[channel].external.exchange.autoDelete,
    }
    const routingKey = brokerService.configs[channel].external.queue.bindingKey;
    const msg = {
        payload : {
            unicast : data.unicast,
            multicast : data.multicast,
            broadcast : data.broadcast,
            sparkId : data.sparkId || '',
            sparkIds : data.sparkIds || [],
            message: data.message,
            work_time : data.work_time || 0,
        },
        persistent: true 
    }
    brokerService.publish(exchange, routingKey, msg);    
}

router.post('/voice', (req, res) => {    
    publish(req.body, 'VOICE')
    res.send('DONE');        
});

router.post('/chat', (req, res) => {    
    publish(req.body, 'CHAT')
    res.send('DONE');        
});

router.post('/tickets', (req, res) => {    
    publish(req.body, 'TICKETS')
    res.send('DONE');        
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/external', router);

app.listen(4000, () => {
    console.log('[API] Started on port 4000')
})