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

The exchange is then connected to one or more queues. In practice, we will instead of sending messages from the 
producer to the queue, we will send messages to the exchange

* To see bindings  -> rabbitmqctl list_bindings

## 
