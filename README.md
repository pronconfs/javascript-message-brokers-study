# javascript-message-broker-poc
This repo contains study on message-broker. This study was made because of a need to scale and improve availability of a given system

## Mosquitto-mqtt
This message broker supports only mqtt that is a pub/sub protocol.

The example has one client (frontend) and server. Both publish and subscribe so communications are bi-directional.

Client starts the connection with the server view WebSockets directly to mosquitto broker (i know. Not cool).

## RabbitMq

