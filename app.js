var Server = require('./server');

new Server({
    name: 'digg',
    desc: 'digg news',
    database: {
        name: 'digg'
    }
}).run();