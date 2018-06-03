#Intro

Those exemples are mostly developed using https://www.rabbitmq.com/getstarted.html 

RabbitMq has one dashboard that can be installed via one pluggin. 
rabbitmq-plugins enable rabbitmq_management
* user : guest
* password : guest

## Simple-queue-amqp

One simple example using only one publisher and one consumer

Many publishers send messages that goes to one queue and many subscribers consume them in order. Basically, the consumer sits there waiting for messages.

The three parts, consumerr, queue and producer do not have to reside on the same local machine.

* npm install amqplib
* see rabitmq queues - sudo rabbitmqctl list_queues

## Work-queues

Here we build one work queue or task queue. The idea is that it allows us to distribute work among several workers in order not to block the current thread since js is single-threaded. Therefore, we get working on several async workers.

We encapsulate a task or a message and send it to the queue to be consumed by on of the workers.

The round robin is used to parallelise work.

Usage of ack flag on the worker when consuming is something very powerfull.Be carefull with the ack cycles with unacknowledge messaged. 
Just turn on the field on rabbit
* sudo rabbitmqctl list_queues name messages_ready messages_unacknowledged

Options 
* ch.assertQueue(q, {durable: true}) -> Indicate that rabbit will never lose our queue
* {noAck : false} -> Indicate that rabbit will wait for ack and if not true will give the task to other worker.
* ch.sendToQueue(q, new Buffer(msg), {persistent: true}) - Mark messages as persistent to stick in the queue 
* ch.prefetch(1) -> Tells rabbitmq to send only one message at a time to the workers. Only after the ack signal will send another

## Pubsub

This memechanism simply send the message to all (broadcast) the consumers.

The producer should not know about the queue, so, there is one component called exchange. It receives
messages from the producers and pushes them to the queues. The exchange decided what to do with the message based on rules or exchange types. There are, direct, topic, headrs and fanout

PubSub we use fanout, that means broadcasting.

* List exchanges on rabbit - sudo rabbitmqctl list_exchanges

The exchange is then connected to one or more queues. In practice, we will instead of sending messages from the producer to the queue, we will send messages to the exchange

* To see bindings  -> rabbitmqctl list_bindings

##   Routing
In this example we use binding keys. Recall that binding is just a way to say that a given queue is interested in a given exchange Eg. `ch.bindQueue(queue_name, exchange_name, 'black');` this says that the queue_name is binded with the exchange_name and that binding has a key black.

Fanout type just ignores the binding key, we will use direct exchange type. the direct type is kinda simple. It only says that a message goes to the queues with the given binding key matching exactly the `routing key`

## Topics

Here we change routing keys to topics based system.

I want to have messages on my queue from portugal cars and portugal bikes. So i use topics

Topics are a base string splitted by dots. `portugal.cars` up to 255 bytes

There are various types of expected behaviours.
* One consumer per topic. You can pass `ch.assertQueue('', {exclusive: true}, function(err, q) {`. Here we create a dynamic named queue, so and set it to be exclusive for the client that is creating it.
* One queue per topic with several consumers. `ch.assertQueue('cars', function(err, q) {`. Here, the algorithm to dispatch messages will still be roud robin and only one user will receive it.

The rest is the same as Routing. The publisher routing key, must be the same from the binding queue that binds exchange and the queue where multiple queues can have the same binding. In other words, multiple queues can receive from the same topic, then, they will dispatch the message in a round-robin fashion.

Now lets see the topics construction. 
Say we have topics
* /portugal/cars/diesel
* /portugal/motos/diesel

- Two special wildcards. 
* One start(*) replaces exactly one word. Eg - *.*.diesel will match the two topics 
* One hash(#) replaces zero or more words. Eg - portugal.# will match the two topics

We can use the wildcards on the exchange and queue bindings.

Those topic exchanges can also work like fanout. Just bind it fo "#". WHen the wildcards are not used in bindings, the exchange will behave like a direct one.

So, to conclude the topic is very interested because of the wildcards, if there were none, it would be like the direct exchange type.
