const BrokerService = require('./BrokerService');
const express = require('express');
const bodyParser = require('body-parser');

const environment = process.argv[2];
const brokerService = new BrokerService({
    rx: environment === 'localhost' ? 'localhost' : '3GdtrY_s:78ov3IyCFAxyMNpysTBMt8AgR38PZnik@sad-silver-53.bigwig.lshift.net:10003/6TAe0JLKstBE',
    tx: environment === 'localhost' ? 'localhost' : '3GdtrY_s:78ov3IyCFAxyMNpysTBMt8AgR38PZnik@sad-silver-53.bigwig.lshift.net:10002/6TAe0JLKstBE',
});

const app = express(); 
const router = express.Router();

const brokerExternalConfigs = {
    external_events_voice : {
        name : 'external_events_voice',        
        exchange : {
            name : 'external_events_exchange',
            bindingKey : 'bind_external_events_voice',
            type: 'direct',
        }
    },
    external_events_chat : {
        name : 'external_events_chat',        
        exchange : {
            name : 'external_events_exchange',
            bindingKey : 'bind_external_events_chat',
            type: 'direct',
        }
    },
    external_events_tickets : {
        name : 'external_events_tickets',        
        exchange : {
            name : 'external_events_exchange',
            bindingKey : 'bind_external_events_tickets',
            type: 'direct',
        }
    }
}

function produce(data, exchangeType) {
    const exchange = {
        name : brokerExternalConfigs[exchangeType].exchange.name,
        type : brokerExternalConfigs[exchangeType].exchange.type,
        durable : false,
        autoDelete : true,
        bindingKey : brokerExternalConfigs[exchangeType].exchange.bindingKey,
    };

    brokerService.publish(exchange, {
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
    });
}

router.post('/external_events_voice', (req, res) => {    
    produce(req.body, 'external_events_voice')
    res.send('DONE');        
});

router.post('/external_events_chat', (req, res) => {    
    produce(req.body, 'external_events_chat')
    res.send('DONE');        
});

router.post('/external_events_tickets', (req, res) => {    
    produce(req.body, 'external_events_tickets')
    res.send('DONE');        
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/external', router);

app.listen(4000, () => {
    console.log('[API] Started on port 4000')
})