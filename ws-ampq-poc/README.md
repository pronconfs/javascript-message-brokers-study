# POC RabbitMq

Broker is on heroku : 
- Consumers url - amqp://3GdtrY_s:78ov3IyCFAxyMNpysTBMt8AgR38PZnik@sad-silver-53.bigwig.lshift.net:10003/6TAe0JLKstBE
- Publisher url - amqp://3GdtrY_s:78ov3IyCFAxyMNpysTBMt8AgR38PZnik@sad-silver-53.bigwig.lshift.net:10002/6TAe0JLKstBE

Web interface - https://bigwig.lshift.net/management/192272/

### Client
Starts connections with `services_agregator`.

### services_agregator
É responsável por pegar em ligações websocket do cliente e manter os estados. As ligações vão ser interpretadas pelo agregador e caso necesário, regista um cliente para consumir queues. Na pratica, faz a tradução de ws para ampq que é depois utilizado para comunicar com o broker

### Broker
O broker é responsável pelo encaminhamento das mensagens e pela redundancia e persistencia das mesmas. É a peça central que une o `services_agregator` com o `server`

### server
Implementa as lógicas de negocio internas. A unica coisa que sabe fazer, é receber trabalho de uma queue (ou mais) do broker que o serviço esteja registado, ou publicar algo no broker para ser consumido


## Comunicação servidor - cliente
A comunicação acontece com base em queues. O servidor comunica com o broker por `amqp` que por sua vez comunica com um agregador de serviços para depois comunicar por `ws` com o cliente.

### Queues
- INDOUND ( direção cliente - servidor )
    - Um exchange unico para todas as queues
        - IN_VOICE
        - IN_CHAT
        - IN_TICKETS

- OUBOUND ( direção servidor - cliente )
    - Um exchange unico para todas as queues
        - OUT_VOICE
        - OUT_CHAT
        - OUT_TICKETS        

### Protocol

Para funcionar tem de haver um protocolo para comunicar entre ws e amqp. Tem de responder às seguintes questões:
- O agregador recebe uma ligação websocket tem de saber quando é para consumir uma queue:
    - Depois de saber tem de saber que tipo é (broadcast, multicast, direto);
        - Se bem que aqui, se estivermos a falar de uma subscrição em chat por ex, ele deve consumir todas as queues;
- O agregador recebe uma ligação websocket tem de saber quando é para publicar numa queue;
    - Depois de saber tem de saber em que exchange vai publicar;

```
{
    distribution : {
        broadcast : false,
        multicast : ['312423dsa', '312423dsb'],
        direct : ['312423dsa'],
    },    
    channel : {
        voice : true,
        chat : false,
        tickets : false,
    }
    packet_action : 'consume | publish',
    publish_target : 'exchange_name',
    consume_target : [] // Array vazio é para consumir tudo daquele canal. Não sei se isto é mesmo util.
    message : {}
}
```

### Configurações
#### Queue
- prefetch - Indica ao canal/queue que só deve enviar uma mensagem de cada vez para os workers.

#### Messages
- Persistent

#### Exchanges

### POC TODO
#### Perguntas
- Verificar qual a melhor integração com o Kong.
    - UmA vez que o kong implementa autenticação, o broker fica por baixo. ESTUDAR
- Base: cliente liga-se a 3/4 serviços por sockets
    - Tranquilo.
- Next: cliente liga-se ao broker ligado aos microserviços (minimizando o numero de sockets)
- Como posso definir comportamentos diferentes dentro da mesma queue (ex. posso entregar ao primeiro worker e não querer entregar ao próximo)
    - `Se a questão é. O primeniro worker não acaba o processo e não quero entregar ao segundo, então a resposta é que é preciso ter uma queue configurada assim`.
    - ` Se a questão é, entrego ao primeiro mas não a nenhum outro, independente de tudo, estamos a dizer que essa queue é de utilização exclusiva do worker, o que é configuravel na sua criação`.
    - `Concluindo. Não podemos ter uma queue que em dois momentos no tempo tenha funções diferentes. A queue é instanciada com as suas opções. Basta pensarmos como se fossemos nós a criar uma queue. Não era bom ela poder assumir vários comportamenteos. Em termos de manutenção seria pessimo.`

#### Simulações
- Cai um servidor e o cliente não nota
    - Isto tem de ser uma queue que utiliza round-robin para entregar aos clientes com um exchange to tipo `route` ou `topics`. Mais, a mensagem tem de ter um acknowledgement para o cliente não notar
- Cai um microserviço, sem tarefas pendentes volta a subir e o cliente não nota
    - Isto é praticamente o mesmo de cima
- Cai um microserviço, com tarefas em execução pendentes volta a subir e o cliente não nota
    - Isto é o mesmo do primeiro item
- Resiliência do broker, cai um e o cliente passa a usar outro
    - Montar um cenário de `ha` no broker.
- Cai o cliente (socket), o que acontece?
    - Podem acontecer várias situações dependendo do que se pretende. O cliente pode perder as mensagens, ou estas podem ser persistentes e serem enviadas quando a ligação for restabelecida.
- Adicionar no poc o mecanismos de write and wait.
    - O write é dado pelo primus, o writeAndWait pelo primus-responder
- Utilizar cenários só com uma ligação websocket e cenários com 4 ligações
    - Na prática dois poc´s diferentes. Aqui o que vai mudar é a mensagem que o cliente tem de enviar no socket.


### Architecture

![alt text](RabbitMqPOC.png "Title")