// index page
var thread = require('../ctrlers/thread');

// PAGE: 首页
module.exports = function(req, res, next) {
    thread.tops(5, function(err, threads){
        if (!err) {
            res.render('index', {
                threads: threads
            })
        } else {
            next(err)
        }
    });
};