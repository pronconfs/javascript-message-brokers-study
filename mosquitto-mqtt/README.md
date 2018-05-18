## Content
One app in ReactJs that acts like the client and one NodeJs app that acts like the server. Each one communicates with the boker that uses mosquitto.

## Configure mosquitto server

* Install - brew install mosquitto;
* Subscribe to topic - mosquitto_sub -h localhost -p 1883 -t 'my_topic'
* Publish on topic - mosquitto_pub -h localhost -p 1883 -t 'my_topic' -m 'Hello World'
* Mac OS config file - /usr/local/etc/mosquitto/mosquitto.conf
* Start server on port - mosquitto -p 4444 -v
* In Default Listner settings add to support websockets
```
port 9000
protocol mqtt

listener 9001
protocol websockets
```
* Change port. Now, mqtt comunicates via 9000 and websockets via 9001.

### Topics

* /topic - One topic on /topic
* /topic/user - One topic on /topic/user
* /topic/# - Wildcard to match /topic/user
* /topic/user/daleixo - One topic on /topic/user/daleixo
* /topic/hardware/computers - One topic on /topic/user/diogo
* /topic/+/# - Wild card + match the whole level. So will match topic /topic/user/daleixo and /topic/hardware/computers

### QOS

* Level 0 - No guarantees. Pretty much like UDP. Does not guarantee the sent order or if they arrive.
* Level 1 - Guarantee delivery - THey are delivered but not guaranteed to be in order.
* Level 2 - Guardantee delivery and order - Like nice and pretty TCP. Of course this is slower.

In order to go up QOS chain, performance must be sacrificed. There are a "lot" of emssages exchange in QOS2.

Each publisher or subscriber can have its qos level with option -q of mosquitto.




