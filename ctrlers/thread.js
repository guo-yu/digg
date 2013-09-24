var model = require('../model'),
	thread = model.thread,
	user = require('./user'),
	async = require('async');

// vote and caclu score
exports.vote = function(params, cb) {
	// 查询投票者的karma
	exports.read(params.to, function(err, th) {
		var result = karma(params.from);
		th.vote = th.vote + 1;
		th.score = th.score + result;
		th.lz.karma = th.lz.karma + result;
		async.waterfall([
			function(callback) {
				th.lz.save(function(err){
					callback(err);
				});
			},
			function(callback) {
				th.save(function(err){
					callback(err);
				});
			}
		], function(err) {
			callback(err, th);
		});
	});
}

// list top threds
exports.tops = function(number, cb) {
	var n = number ? number : 10;
	thread.find({}).limit(n).sort('-score').populate('lz').exec(function(err, threads) {
		cb(err, threads);
	});
}

// list all threads
exports.ls = function(cb) {
	thread.find({}).exec(function(err, threads) {
		cb(err, threads);
	});
}

// 查看当前用户是否是楼主 或者 是否是admin用户
exports.checkLz = function(tid, uid, cb) {
	thread.findById(tid).exec(function(err, thread) {
		if (!err) {
			if (thread) {
				if (thread.lz == uid) {
					cb(null, true, thread)
				} else {
					user.checkAdmin(uid, function(err, result) {
						if (!err) {
							if (result) {
								cb(null, true, thread)
							} else {
								cb(null, false)
							}
						} else {
							cb(err)
						}
					})
				}
			} else {
				cb(null, false)
			}
		} else {
			cb(err)
		}
	});
}

// read by id ?
exports.read = function(id, cb) {
	if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
		thread.findById(id).populate('lz').exec(function(err, thread) {
			cb(err, thread);
		});
	} else {
		cb(new Error('404'));
	}
}

// create thread
exports.create = function(baby, cb) {
	var baby = new thread(baby);
	async.waterfall([
		function(callback) {
			baby.save(function(err) {
				cb(err, baby);
			});
		},
		function(baby, callback) {
			board.brief(baby.board, function(err, b) {
				if (!err) {
					b.threads.push(baby._id);
					b.save(function(err) {
						cb(err, baby);
					})
				} else {
					cb(err)
				}
			})
		},
		function(baby, callback) {
			user.queryById(baby.lz, function(err, u) {
				if (!err) {
					u.threads.push(baby._id);
					u.save(function(err) {
						cb(err, baby);
					})
				} else {
					cb(err)
				}
			})
		}
	], function(err, baby) {
		cb(err, baby)
	});
}

// update thread
exports.update = function(id, body, cb) {
	thread.findByIdAndUpdate(id, body, function(err) {
		cb(err, body);
	})
}

// 删除之后要删除在相应board的索引？
exports.remove = function(id, cb) {
	thread.findByIdAndRemove(id, function(err) {
		cb(err, id);
	});
}