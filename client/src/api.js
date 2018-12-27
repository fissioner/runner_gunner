import io from 'socket.io-client';
const  socket = io.connect('http://localhost:5000');
let userName,
    joinedGame = false;

function broadcastUser(user) {
socket.on('user', data => {
    user(data);
    userName = data;
});
}
function broadcastUsers(users) {
    socket.on('users', data => users(data))
}
function submitMessage(e, msg) {
    e.preventDefault();
    socket.emit('submitMsg', msg);
}
function broadcastMessages(msgs) {
    socket.on('msg', data => msgs(data));
}
function broadcastScores(scores) {
    socket.on('showScores', data => scores(data));
}

function joinGame() {
    socket.emit('join', userName);
}
socket.on('joinedGame', function() {
    joinedGame = true;
});
socket.on('waiting', function(userName) {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'blue';
    ctx.font = "30px Courier";
    ctx.fillText(`Waiting for another player to join...`,c.width/2 ,100);
    ctx.font = "25px Arial";
    ctx.fillStyle = 'magenta';
    ctx.fillText(`Lobby: ${userName}`,c.width/2 ,170);
    ctx.fillStyle = 'black';
ctx.font = "40px Courier";
ctx.fillText(`Controls`,c.width/2 ,250);
ctx.font = "20px Arial";
ctx.fillText(`Space: shoot`,c.width/2 ,300);
ctx.fillText(`Hold Up Arrow: jump`,c.width/2 ,330);
ctx.fillText(`Right Arrow: move right`,c.width/2 ,360);
ctx.fillText(`Left Arrow: move left`,c.width/2 ,390);
})
function startGame(isStart) {
    socket.on('startGame', data => isStart(data))
}
function stopGame(isStart) {
    socket.on('stopGame', data => isStart(data))
}

let c = document.getElementById("canvas"),
ctx = c.getContext("2d");
ctx.textAlign = 'center';
ctx.fillStyle = 'brown';
ctx.font = "50px Courier";
ctx.fillText(`Runner Gunner`,c.width/2 ,100);
ctx.textAlign = 'center';
ctx.fillStyle = 'black';
ctx.font = "40px Courier";
ctx.fillText(`Controls`,c.width/2 ,250);
ctx.font = "20px Arial";
ctx.fillText(`Space: shoot`,c.width/2 ,300);
ctx.fillText(`Hold Up Arrow: jump`,c.width/2 ,330);
ctx.fillText(`Right Arrow: move right`,c.width/2 ,360);
ctx.fillText(`Left Arrow: move left`,c.width/2 ,390);

let score = 0;
let controls = {
    left: false,
    right: false,
    up: false,
    active: function(e) {
        let isActive = e.type === 'keydown' ? true : false;
        switch(e.keyCode) {
            case 37: controls.left = isActive;
            break;
            case 39: controls.right = isActive;
            break;
            case 38: controls.up = isActive;
            break;
            default:
        }
        if (e.type === 'keydown' && e.keyCode === 32) {
            socket.emit('bullets', userName);
        }
        if (joinedGame) {
        socket.emit('controls', {controls: controls, userName: userName});
        }
    }
}

function drawSquare(s) {
    ctx.fillStyle = s.color;
    ctx.fillRect(s.x,s.y,s.width,s.height);
}
function drawElements(els) {
        els.forEach(type => {
        type.forEach(el => {
            if (el.type === 'player') {
                ctx.font = "35px Arial";
                ctx.fillText(el.emoji,el.x ,el.y + 35);
            }
            else if (el.type === 'enemy') {
                ctx.font = "40px Arial";
                ctx.fillText(`👹`,el.x ,el.y + 40);
            }
            else {
                drawSquare(el);
            }
        })
    })
}

socket.on('drawElements', els => {
    ctx.clearRect(0, 0, c.width, c.height);
    drawElements(els);
    ctx.font = "30px Arial";
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`,10 ,50);
});
socket.on('score', s => {
 score = s;
})
socket.on('gameOver', _ => {
    ctx.font = '90px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText(`☠️`, c.width/2 -45, c.height/2 - 20);
    joinedGame = false;
});
function startSolo() {
    socket.emit('startSolo');
}
function stopSolo() {
    socket.emit('stopSolo');
}

window.addEventListener('keydown', controls.active);
window.addEventListener('keyup', controls.active);

export { broadcastUser, broadcastUsers, submitMessage, broadcastMessages, joinGame, startGame, stopGame, startSolo, stopSolo, broadcastScores };