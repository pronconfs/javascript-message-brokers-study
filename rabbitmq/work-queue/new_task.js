const amqp = require('amqplib/callback_api');

amqp.connect('amqp://3GdtrY_s:78ov3IyCFAxyMNpysTBMt8AgR38PZnik@sad-silver-53.bigwig.lshift.net:10002/6TAe0JLKstBE', function(err, conn) {  
  conn.createChannel(function(err, ch) {
    var q = 'task_queue';
    var msg = "Hello World! .";

    ch.assertQueue(q, {durable: false});
    ch.sendToQueue(q, new Buffer.from(msg), {persistent: true});
    console.log(" [x] Sent '%s'", msg);
    setTimeout( () => {conn.close(); process.exit(0) }, 500)
  });    
});
