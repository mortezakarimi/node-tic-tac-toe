var socket;
socket = io();
var refreshGame = function () {
    socket.on('refreshGame', function (data) {
        var gamesState = data[0];
        var winned = data[1];
        gamesState.forEach(function (game, gameIndex) {
            game.forEach(function (box, boxIndex) {
                // console.log($("#" + gameIndex + '-' + boxIndex), box);
                if (box == 'x' || box == 'o')
                    $("#" + (gameIndex + 1) + '-' + (boxIndex + 1)).addClass(box + 'Player');
            });
        });
        console.log(winned, gamesState);
        for (var key in winned) {
            $('#' + (parseInt(key) + 1)).addClass(winned[key] + 'Win');
        }
    });
};
refreshGame();
socket.on('userSign', function (data) {
    if (data.success) {
        $('#player-sign').addClass(data.sign + '-player').attr('data-sign', data.sign);
    }
    else
        $('#player-sign').parent('p').html(data.message);
});
socket.on('gameStarted', function (data) {
    (function ($) {
        $(document).on('click', '.game-box', function (e) {
            var data, gameNumber, playerSign, uniqId;
            e.preventDefault();
            gameNumber = $(this).data('gamenumber');
            uniqId = $(this).data('uniqid');
            playerSign = $('#player-sign').data('sign');
            data = {
                userSign: playerSign,
                boxUniqId: uniqId
            };
            return socket.emit('game', JSON.stringify(data));
        });
    })(jQuery);
    socket.on('lastChange', function (data) {
        console.log(data);
    });
    socket.on('noTurn', function (data) {
        alert(data.message);
    });
    socket.on('stateResult', function (data) {
        if (data.success) {
            switch (data.resultId) {
                case 3:
                    var playerSign = $('#player-sign').data('sign');
                    $('#sign').addClass("hidden");
                    if (data.userSign == playerSign) {
                        $('#' + playerSign + 'WinMessage').removeClass('hidden');
                    }
                    else {
                        $('#' + playerSign + 'WinMessage').removeClass('hidden').text('You Lose');
                    }
                    setInterval(function () {
                        draw('O', "#ff5955");
                        draw('X', "#5ea8ff");
                    }, font_size * 3);
                case 2:
                    $('#' + (data.gameObj[0] + 1)).addClass(data.userSign + 'Win');
                case 0:
                    $("#" + (data.gameObj[0] + 1) + '-' + (data.gameObj[1] + 1)).addClass(data.userSign + 'Player');
                    break;
                default:
                    alert(data.message);
            }
        }
        else
            alert(data.message);
    });
});
var c = document.getElementById("c");
var ctx = c.getContext("2d");
//making the canvas full screen
c.height = window.innerHeight;
c.width = window.innerWidth;
var font_size = 33;
var columns = c.width / font_size; //number of columns for the rain
//an array of drops - one per column
var drops = [];
//x below is the x coordinate
//1 = y co-ordinate of the drop(same for every drop initially)
for (var x = 0; x < columns; x++)
    drops[x] = 1;
//drawing the characters
function draw(charecters, color) {
    //charecters characters - taken from the unicode charset
    //converting the string into an array of single characters
    charecters = charecters.split("");
    //Black BG for the canvas
    //translucent BG to show trail
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = color; //green text
    ctx.font = font_size + "px helvetica";
    //looping over drops
    for (var i = 0; i < drops.length; i++) {
        //a random charecters character to print
        var text = charecters[Math.floor(Math.random() * charecters.length)];
        //x = i*font_size, y = value of drops[i]*font_size
        ctx.fillText(text, i * font_size, drops[i] * font_size);
        //sending the drop back to the top randomly after it has crossed the screen
        //adding a randomness to the reset to make the drops scattered on the Y axis
        if (drops[i] * font_size > c.height && Math.random() > 0.975)
            drops[i] = 0;
        //incrementing Y coordinate
        drops[i]++;
    }
}
//# sourceMappingURL=main.js.map