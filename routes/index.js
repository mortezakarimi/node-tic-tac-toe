var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    var data = {title: 'Tic Tak Toe'};
    res.render('index', data);
});

module.exports = router;
