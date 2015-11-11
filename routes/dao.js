var redis = require('redis'),
    client = redis.createClient();


var keys = {
    'messages': 'messages',
    'nicknames': 'nicknames'
};

var dao = {
    getMessages: function(start, after) {
        var key = keys['messages'];

        client.llen(key, function (err, length) {
            if (start > length) {
                after([], length+1);
                return;
            }
            client.lrange(key, 0, length-start, function (err, replies) {
                if (err) {
                    throw err;
                }
                var decoded = replies.map(function(elem, index) {
                    return JSON.parse(elem);
                });
                after(decoded.reverse(), length+1);
            });
        });
    },
    addMessage: function(message, after) {
        var key = keys['messages'];
        client.incr('counter', function (err, val) {
            if (err) { throw err; }
            mssage['id'] = val;
            var strMessage = JSON.stringify(message);
            client.lpush(key, strMessage, redis.print);
            after();
        });
    },
    addNewUser: function(nickname, secret, after) {
        var key = keys['nicknames'];
        if (nickname.indexOf('secret') > -1) {
            after(false, "nickname cannot contains secret");
        }
        client.sismember(key, nickname, function (err, result) {
            if (err) {
                throw err;
            }

            if (result) {
                after(false, "duplicated name");
            } else {
                client.sadd(key, nickname, function (err, replies) {
                    if (err) {
                        throw err;
                    }
                    client.set(nickname + "-secret", secret, function (err) {
                        if (err) {
                            after(false, "Unknown error");
                        } else {
                            after(true);
                        }
                    });
                });
            }
        });
    },
    checkUser: function(nickname, secret, success, error) {
        var key = keys['nicknames'];
        client.sismember(key, nickname, function (err, result) {
            if (err) {
                throw err;
            }

            if (result) {
                client.get(nickname + "-secret", function(err, result) {
                    if (err) {
                        throw err;
                    } else if (result && result == secret) {
                        success();
                    } else {
                        error("secret is not correct");
                    }
                });
            } else {
                error("Cannot find user");
            }
        });
    }
}

client.on("error", function(err) {
    console.log("Error " + err);
});


module.exports = dao;
