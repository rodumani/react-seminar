var express = require('express');
var dao = require('./dao');
var router = express.Router();
var path = require("path");

router.get('/', function(req, res, next) {
    res.sendFile(path.join(path.join(__dirname, '../') + '/views/index.html'));
});

router.post('/login', function(req, res, next) {
    var nickname = req.body.nickname.trim();
    if (nickname == undefined) {
        res.status(400).send({
            error: '"nickname" should not be empty'
        });
    }

    var randomSecret = Math.round(Math.random() * 100000000000000);

    dao.addNewUser(nickname, randomSecret, function(ok, message) {
        if (ok) {
            res.send({'status': 'ok', 'message': "Success", 'secret': randomSecret});
        } else {
            res.status(400).send({'status': 'error', 'message': message});
        }
    });
});

router.post('/send', function(req, res, next) {
    var from = req.body.from;
    var secret = req.body.secret;
    if (from == undefined) {
        res.status(400).send({
            error: '"from" should not be empty'
        });
        return;
    }

    dao.checkUser(from, secret, function() {
        var text = req.body.message;
        var message = {
            from: from,
            message: text,
            timestamp: new Date()
        };

        dao.addMessage(message, function(err) {
            if (err) {
                throw "Something is wrong";
            } else {
                res.send({status: 'ok'});
            }
        });
    }, function(msg) {
        res.status(400).send({
            error: msg
        });
    });
});

router.get('/read', function(req, res, next) {
    var start = req.query.start;
    if (!start) { start = 0; }

    dao.getMessages(start, function(replies, nextStart) {
        res.send({
            'messages':replies,
            'nextStart':nextStart
        });
    });
});

module.exports = router;
