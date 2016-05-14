/**
 *  __  __            _                  _  __          _           _
 * |  \/  | ___  _ __| |_ ___ ______ _  | |/ /__ _ _ __(_)_ __ ___ (_)
 * | |\/| |/ _ \| '__| __/ _ \_  / _` | | ' // _` | '__| | '_ ` _ \| |
 * | |  | | (_) | |  | ||  __// / (_| | | . \ (_| | |  | | | | | | | |
 * |_|  |_|\___/|_|   \__\___/___\__,_| |_|\_\__,_|_|  |_|_| |_| |_|_|
 *
 * Created by morteza on 2/22/16.
 */
var signs = {};
var signUsed = [];
var currentGame = {};
var currentGameClients = {}; // current game clients gamer
var winnedGames = {};// object game_id:user_sign win state
var userTurn = 'x'; // session id user turn
var gameFinish = false;
var game = zeros([9, 9]);
module.exports = function (io) {
    var app = require('express');
    var router = app.Router();
    io.on("connection", function (socket) {
        handelRefreshGame(socket, game, winnedGames);
        handleSignSet(socket, signs, signUsed); // handle user sign set
        joinGame(socket, io, 'lobby', currentGameClients);
        // handelGameJoining(socket);
        handelGameState(io, socket, userTurn, 'lobby', currentGameClients);
        handelUserLeftGame(socket, signs, signUsed);
    });

    return router;
};

/*
 {
 'setStateResult':'0 -> gozasht|| 1 -> khune por  || 2-> groupWin || 3 -> gameWin'

 }
 */
var handelRefreshGame = function (socket, game, winnedGames) {
    socket.emit('refreshGame', [game, winnedGames]);
}
var handleSignSet = function (socket, signs, signUsed) {
    if (signUsed.indexOf('x') == -1) {
        signs[socket.id] = 'x';
        signUsed.push('x');
        socket.emit('userSign', {success: true, sign: 'x'});
        return true;
    } else if (signUsed.indexOf('o') == -1) {
        signs[socket.id] = 'o';
        signUsed.push('o');
        socket.emit('userSign', {success: true, sign: 'o'});
        return true;
    } else if (typeof signs[socket.id] == 'string') {
        socket.emit('userSign', {success: true, sign: signs[socket.id]});
    } else {
        socket.emit('userSign', {success: false, message: "You Can't join in game"});
    }
}

var handelUserLeftGame = function (socket, signs, signUsed) {
    socket.on('disconnect', function () {
        var signIndex = signUsed.indexOf(signs[socket.id]);
        delete signUsed.splice(signIndex, 1);
        delete signs[socket.id];
        console.error('User Leave Game!');
    });
}

var joinGame = function (socket, io, game, gameClients) {
    if (!gameClients.hasOwnProperty(game))
        gameClients[game] = 1;
    else if (gameClients.hasOwnProperty(game))
        gameClients[game]++;

    if (gameClients[game] <= 2) {
        socket.join(game);
        currentGame[socket.id] = game;
        socket.emit('joinResult', {success: true, game: game});
    } else {
        gameClients[game]--;
        console.info('user Rejected');
        socket.emit('joinResult', {success: false, message: 'Game is full,You need to select another game'});
    }
    if (gameClients[game] == 2) {
        io.emit('gameStarted', {success: true, message: 'Game Start!'});
    }
}

var handelGameJoining = function (socket) {
    socket.on('join', function (game) {
        socket.leave(currentGame[socket.id]);
        joinGame(socket, game);
    });
}

var handelGameState = function (io, socket, userTurn, game, gameClients) {
    if (gameClients[game] == 2) {
        socket.on('game', function (data) {
            var data = JSON.parse(data);
            checkGameWin(io, socket, data, function (userSign, user_turn) {
                if (userSign == user_turn)  // handle user turn
                    return true;
                else
                    return false;

            });

        });
    }
}

var checkGameWin = function (io, socket, data, fn) {
    if (fn(data.userSign, userTurn)) {
        var fieldID = data.boxUniqId;
        var gameObj = fieldID.split('-');
        gameObj[0]--;
        gameObj[1]--;
        if (typeof game[gameObj[0]] == 'object' &&
            typeof game[gameObj[0]][gameObj[1]] == 'number' &&
            game[gameObj[0]][gameObj[1]] == 0 &&
            typeof winnedGames[gameObj[0]] == 'undefined' && !gameFinish) {

            var resultId = 0;
            game[gameObj[0]][gameObj[1]] = signs[socket.id];
            var boardSmall = game[gameObj[0]];
            var match = checkMatch(boardSmall);
            if (match) {
                resultId = 2;
                winnedGames[gameObj[0]] = signs[socket.id];
                var normalizeWinned = function (array) {
                    var norm = [];
                    for (var i = 0; i < 9; i++) {
                        if (typeof array[i] != 'undefined') {
                            norm.push(array[i]);
                        } else
                            norm.push(0);
                    }
                    return norm;
                }
                var WinGame = checkMatch(normalizeWinned(winnedGames));
                if (WinGame) {
                    resultId = 3;
                    gameFinish = true;
                }
            }
            userTurn = (userTurn == 'x' ? 'o' : 'x');
            io.emit('stateResult', {
                success: true,
                resultId: resultId,
                userSign: data.userSign,
                gameObj: gameObj,
                message: 'Success'
            });
            return true;
        } else if (typeof game[gameObj[0]] == 'object' &&
            typeof game[gameObj[0]][gameObj[1]] == 'number' &&
            game[gameObj[0]][gameObj[1]] != 0 && !gameFinish) {
            socket.emit('stateResult', {
                success: false,
                resultId: 1,
                message: 'Field ID fill out'
            });
            return false;
        } else if (typeof winnedGames[gameObj[0]] == 'undefined' && !gameFinish) {
            socket.emit('stateResult', {
                success: false,
                resultId: 4,
                message: 'Field ID not exist'
            });
            return false;
        }
    }
}

var checkMatch = function (boardSmall) {
    const MATCH = true;
    const NOMATCH = false;
    const state = 0;
    //Checking for a match!
    if (boardSmall[0] == boardSmall[1] && boardSmall[0] == boardSmall[2] && boardSmall[0] != state) {
        return MATCH;
    }
    else if (boardSmall[0] == boardSmall[4] && boardSmall[0] == boardSmall[8] && boardSmall[0] != state) {
        return MATCH;
    }
    else if (boardSmall[0] == boardSmall[3] && boardSmall[0] == boardSmall[6] && boardSmall[0] != state) {
        return MATCH;
    }
    else if (boardSmall[1] == boardSmall[4] && boardSmall[1] == boardSmall[7] && boardSmall[1] != state) {
        return MATCH;
    }
    else if (boardSmall[2] == boardSmall[5] && boardSmall[2] == boardSmall[8] && boardSmall[2] != state) {
        return MATCH;
    }
    else if (boardSmall[2] == boardSmall[4] && boardSmall[2] == boardSmall[6] && boardSmall[2] != state) {
        return MATCH;
    }
    else if (boardSmall[3] == boardSmall[4] && boardSmall[3] == boardSmall[5] && boardSmall[3] != state) {
        return MATCH;
    }
    else if (boardSmall[6] == boardSmall[7] && boardSmall[6] == boardSmall[8] && boardSmall[6] != state) {
        return MATCH;
    }

    //In case of No MATCH
    return NOMATCH
}

/**
 * create 2D array fill with zero
 * @param dimensions
 * @returns {Array}
 */
function zeros(dimensions) {
    var array = [];

    for (var i = 0; i < dimensions[0]; ++i) {
        array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
    }

    return array;
}
