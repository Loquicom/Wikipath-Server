const iphex = require ('./src/helper/iphex');
const Server = require('./src/server');

const serv = new Server();

serv.on('error', (err) => {
    console.log(err.message);
});
serv.on('disconnection', (id) => {
    console.log(`Client ${id} disconnected`);
});
serv.on('broken', (id) => {
    console.log(`Connection with the client ${id} broken`);
});
serv.on('connection', (socket) => {
    socket.send('hi', {id: socket.getId()});
});

serv.action('hi', (data, socket) => {
    console.log(data.msg);
});
serv.action('plouf', (data, socket) => {
    socket.respond({plouf: 'noup'});
});

serv.start((port) => {
    console.log('Server started on port ' + port);
});