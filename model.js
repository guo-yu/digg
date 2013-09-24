/**
 * db models
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    config = require('./database'),
    db = mongoose.createConnection('localhost', config.name);

// users
var userModel = new Schema({
    nickname: String,
    email: String,
    avatar: String,
    password: String,
    phone: String,
    url: String,
    karma: {
        type: Number,
        default: 0
    },
    created: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        default: 'normal'
    },
    threads: [{
        type: Schema.Types.ObjectId,
        ref: 'thread'
    }],
    duoshuo: {
        user_id: {
            type: String,
            unique: true
        },
        access_token: String
    }
});

// threads
var threadModel = new Schema({
    name: String,
    content: String,
    url: String,
    score: {
        type: Number,
        default: 0
    },
    vote: {
        type: Number,
        default: 0
    },
    pubdate: {
        type: Date,
        default: Date.now
    },
    lz: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
});

exports.user = db.model('user', userModel);
exports.thread = db.model('thread', threadModel);