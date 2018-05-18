const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'hello_queue';

    ch.assertQueue(q, {durable: false});
    
    ch.sendToQueue(q, new Buffer.from('Hello World!'));
    console.log(" [x] Sent 'Hello World!'");
    conn.close(); 
    process.exit(0)
  });  
});
