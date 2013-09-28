//        ___            
//   ____/ (_)___ _____ _
//  / __  / / __ `/ __ `/
// / /_/ / / /_/ / /_/ / 
// \__,_/_/\__, /\__, /  
//        /____//____/    
// 
// @brief  : a hacker-news-like digg system based on node
// @author : 新浪微博@郭宇 [turing](http://guoyu.me)

var express = require('express'),
    http = require('http'),
    path = require('path'),
    MongoStore = require('connect-mongo')(express),
    pkg = require('./lib/pkg'),
    sys = require('./package.json'),
    errors = require('./lib/error');

var Server = function(params) {

    if (params) {

        var app = express(),
            self = this;

        pkg.set(path.join(__dirname, '/database.json'), params.database);

        // routers
        var index = require('./routes/index'),
            sign = require('./routes/sign'),
            thread = require('./routes/thread'),
            user = require('./routes/user');

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
            if (!res.locals._app) res.locals._app = self.app;
            next();
        });
        app.use(require('less-middleware')({
            src: __dirname + '/public'
        }));
        app.use(express.static(path.join(__dirname, 'public')));
        app.use(app.router);

        // locals
        app.locals.sys = sys;
        app.locals.site = params;

        // errors
        app.use(errors.logger);
        app.use(errors.xhr);
        app.use(errors.common);

        // home
        app.get('/', sign.passport, index);

        // signin & signout
        app.get('/signin', sign.signin);
        app.get('/signout', sign.signout);

        // thread
        app.get('/submit', sign.check, thread.submit);
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

        self.app = app;
        self.params = params;

    }

}

Server.prototype.run = function(port) {
    var defaultPort = 3000;
    this.app.set('port', (port && !isNaN(parseInt(port, 10))) ? parseInt(port, 10) : defaultPort);
    this.app.locals.root = (this.app.get('env') === 'production') ? this.params.url : 'http://localhost:' + this.app.get('port');
    http.createServer(this.app).listen(this.app.get('port'));
}

module.exports = Server;