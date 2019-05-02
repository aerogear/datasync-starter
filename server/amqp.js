var container = require('rhea');
container.on('connection_open', function (context) {
    console.log('connected')
    // context.connection.open_receiver('myqueue');
    // context.connection.open_sender('myqueue');
});
container.on('message', function (context) {
    console.log(context.message.body);
    // context.connection.close();
});
container.on('sendable', function (context) {
    // context.sender.send({body:'Hello World!'});
    // context.sender.detach();
});

container.connect({
    username: 'user-494d7ce2-67fe-11e9-9888-0a580a010007',
    password: 'FqxmZGBiLm3ALYtjqA8CuDXhh8MTKQ-F',
    port:80,
    host:'mqtt-broker-amq-showcase-with-amq.apps.pahayes-5b54.openshiftworkshop.com',
    transport:'tcp',
    rejectUnauthorized:false
});