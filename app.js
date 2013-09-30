var Server = require('./server');

new Server({
    name: 'digg',
    desc: 'digg news',
    database: {
        name: 'digg'
    },
    duoshuo: { 
        short_name: 'candydemo', // 多说 short_name
        secret: '055834753bf452f248602e26221a8345' // 多说 secret
    }
}).run();