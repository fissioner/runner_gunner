import io from 'socket.io-client';

const  socket = io.connect('http://localhost:5000'),
jumpSound = new Audio('jump.mp3'),
shootSound = new Audio('laser1.mp3'),
killSound = new Audio('kill.mp3'),
startSound = new Audio('start.mp3'),
deadSound = new Audio('dead.mp3'),
bg = new Image(),
pf = new Image();
bg.src = 'bg.png';
pf.src = 'pf.jpg';

let userName,
    joinedGame = false,
    toggle = true;

function playSound(sound) {
    sound.currentTime = 0.0;
        sound.play();
}
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
function soloGame() {
    socket.emit('soloGame', userName);
    score = 0;
    playSound(startSound);
}
function joinGame() {
    socket.emit('join', userName);
    playSound(startSound);
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
    socket.on('startGame', data => isStart(data));
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

let score = 0,
    controls = {
    left: false,
    right: false,
    up: false,
    sounds: {
        jump: false,
        shoot: false
    },
    active: function(e) {
        let isActive = e.type === 'keydown' ? true : false;
        switch(e.keyCode) {
            case 37: controls.left = isActive;
            break;
            case 39: controls.right = isActive;
            break;
            case 38: controls.up = isActive;
            if (toggle) {
                controls.sounds.jump = true;
                toggle = false;
            }
            break;
            default:
        }
        if (e.type === 'keydown' && e.keyCode === 32) {
            socket.emit('bullets', userName);
            controls.sounds.shoot = true;
        }
        if (e.type === 'keyup' && e.keyCode === 38) {
            toggle = true;
        }
        if (joinedGame) {
        socket.emit('controls', {controls: controls, userName: userName});
        }
        controls.sounds.jump = false;
        controls.sounds.shoot = false;
    }
};

function drawSquare(s) {
    ctx.fillStyle = s.color;
    ctx.fillRect(s.x,s.y,s.width,s.height);
}
function drawElements(els) {
        els.forEach(type => {
        type.forEach(el => {
            if (el.type === 'bg') {
                ctx.drawImage(bg, el.x, 0, c.width, c.height);
            }
            else if (el.type === 'player') {
                if (el.controls.sounds.shoot) playSound(shootSound);
                if (el.controls.sounds.jump) playSound(jumpSound);
                ctx.font = "35px Arial";
                ctx.fillText(el.emoji,el.x ,el.y + 35);
                ctx.font = '12px Arial';
                ctx.fillStyle = '#ff007f'
                ctx.textAlign = 'center';
                ctx.fillText(el.name, el.x + 20, el.y - 20);
            }
            else if (el.type === 'enemy') {
                ctx.font = "40px Arial";
                ctx.fillText(`👹`,el.x ,el.y + 40);
            }
            else if (el.type === 'platform') {
                ctx.drawImage(pf, el.x, el.y, el.width, el.height);
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
 playSound(killSound);
 score = s;
})
socket.on('gameOver', _ => {
    playSound(deadSound);
    ctx.font = '90px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText(`☠️`, c.width/2 -45, c.height/2 - 20);
    joinedGame = false;
});


window.addEventListener('keydown', controls.active);
window.addEventListener('keyup', controls.active);

export { broadcastUser, broadcastUsers, submitMessage, broadcastMessages, joinGame, startGame, stopGame, broadcastScores, soloGame };