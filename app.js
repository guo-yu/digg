//        ___            
//   ____/ (_)___ _____ _
//  / __  / / __ `/ __ `/
// / /_/ / / /_/ / /_/ / 
// \__,_/_/\__, /\__, /  
//        /____//____/    
// 
// @brief  : a hacker-news-like digg system based on node
// @author : 新浪微博@郭宇 [turing](http://guoyu.me)

var Server = function(params) {

    var express = require('express'),
        path = require('path'),
        MongoStore = require('connect-mongo')(express),
        pkg = require('./pkg'),
        self = this;

    var app = express(),
        MemStore = express.session.MemoryStore;

    pkg.set('/database.json', params.database);

    var thread = require('./routes/thread'),
        user = require('./routes/user'),
        index = require('./routes/index'),
        sign = require('./routes/sign'),
        admin = require('./routes/admin'),
        errhandler = require('./lib/error');

    // all environments
    app.set('env', params.env ? params.env : 'development');
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser({
        keepExtensions: true,
        uploadDir: path.join(__dirname, '/public/uploads')
    }));
    app.use(express.methodOverride());
    app.use(express.cookieParser(params.database.name));
    app.use(express.session({
        secret: params.database.name,
        store: new MongoStore({
            db: params.database.name,
            collection: 'sessions'
        })
    }));
    app.use(function(req, res, next) {
        if (!res.locals.App) {
            res.locals.App = self;
        }
        next();
    });
    app.use(require('less-middleware')({
        src: __dirname + '/public'
    }));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(app.router);

    // errhandler
    app.use(errhandler.logger);
    app.use(errhandler.xhr);
    app.use(errhandler.common);

    // home
    app.get('/', sign.passport, index);

    // signin & signout
    app.get('/signin', sign.in);
    app.get('/signout', sign.out);

    // thread
    app.get('/thread/new', sign.check, thread.new);
    app.post('/thread/new', sign.checkJSON, thread.create);
    app.get('/thread/list', sign.checkJSON, thread.ls);
    app.get('/thread/:id', sign.passport, thread.read);
    app.get('/thread/:id/edit', sign.check, thread.edit);
    app.post('/thread/:id/update', sign.checkJSON, thread.update);
    app.post('/thread/:id/vote', sign.checkJSON, thread.vote);
    app.delete('/thread/:id/remove', sign.checkJSON, thread.remove);

    // user
    app.get('/user/:id', sign.passport, user.read);
    app.post('/user/sync', sign.check, user.sync);
    app.post('/user/:id', user.update);
    app.delete('/user/remove', user.remove);

    // user center
    app.get('/member/:id', sign.passport, user.mime);

    // 404
    app.get('*', errhandler.notfound)

    this.app = app;
    this.params = params;

}

Server.prototype.run = function(port) {
    var self = this,
        http = require('http');
    if (port && !isNaN(parseInt(port))) {
        self.app.set('port', parseInt(port));
    } else {
        self.app.set('port', 3000);
    }
    http.createServer(self.app).listen(self.app.get('port'));
}

exports.server = Server;