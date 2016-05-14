var debug = require('debug')('multimedia');
var express = require('express');
var io = require("socket.io")();
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var uuid = require('node-uuid');
var sessionMiddleware = session({
    genid: function (req) {
        return uuid.v4() // use UUIDs for session IDs
    },
    unset: 'destroy',
    secret: 'keyboard cat'
});

var routes = require('./routes/index');
var game = require('./routes/game');
var socket = require('./libs/sockets');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var socket_routes = require('./libs/sockets')(io);
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('node-compass')({mode: 'expanded'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleware);

app.use('/', routes);
app.use('/game', game);
app.use('/socket', socket_routes);

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
io.attach(server);
io.use(function (socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

module.exports = app;

