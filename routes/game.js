var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
    req.session.destroy();
    var data = {title: 'Tic Tak Toe'};
    if (!req.xhr)
        res.render('match_make', data);
    else
        res.json(data);
});

router.get('/play', function (req, res, next) {
    var data = {title: 'Tic Tak Toe'};
    if (!req.xhr)
        res.render('game', data);
    else
        res.json(data);
});
module.exports = router;