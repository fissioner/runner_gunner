import io from 'socket.io-client';
import { request } from 'http';
const  socket = io.connect('http://localhost:5000');
function broadcastUser(user) {
socket.on('user', data => user(data));
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
function broadcastPositions(pos) {

}
let c = document.getElementById("canvas"),
ctx = c.getContext("2d");
let score = 0;
let controls = {
    left: false,
    right: false,
    up: false,
    space: false,
    active: function(e) {
        let isActive = e.type === 'keydown' ? true : false;
        switch(e.keyCode) {
            case 37: controls.left = isActive;
            break;
            case 39: controls.right = isActive;
            break;
            case 38: controls.up = isActive;
            break;
            case 32: controls.space = isActive;
            break;
            default:
        }

    }

}

function element(x, y, width, height, color, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.type = type;
    this.gravity = .5;
    this.yVelocity = 0;
    this.xVelocity = 0;
    this.drag = 0.9;
    this.friction = 0.9;
    this.jump = false;
}
let platforms = [],
players = [],
bullets = [],
enemies = [],
random = function(min, max) {
    let num = Math.floor(Math.random() * Math.floor(max));
    return num > min ? num : num + min;
},
colors = ['black', 'brown', 'white'];

//create players

players.push(new element(100 + (100/2) - (20/2), c.height - 50 - 40, 20, 40, 'orange', 'player'));

//create initial platforms

platforms.push(new element(100, c.height - 50, 100, 50, 'green', 'platform'));
for (let i=1; i<1000; i++) {
        let width = random(50, 400),
        height = random(50, 400),
        color = colors[random(0, colors.length)],
        x = platforms[i-1].x + random(50, 200) + platforms[i-1].width;
        platforms.push(new element(x, c.height - height, width, height, color, 'platform'));
}

//create enemies
platforms.forEach(p => {
    if (p !== platforms[0] && random(0, 10) < 5) {
        enemies.push(new element(p.x + random(10, p.width - 10), p.y - 40, 20, 40, 'green', 'enemy'));
    }
    function enemy() {
        if (p !== platforms[0] && random(0, 10) < 4) {
        enemies.push(new element(p.x + random(10, p.width - 10), p.y - 40, 20, 40, 'green', 'enemy'));
        enemy();
    }
    }
enemy();
})


function drawSquare(s) {
    ctx.fillStyle = s.color;
    ctx.fillRect(s.x,s.y,s.width,s.height);
}

function drawElements() {
    let floor = c.height + 100;
    requestAnimationFrame(drawElements)
    ctx.clearRect(0, 0, c.width, c.height);

    ctx.font = "30px Arial";
    ctx.fillText(`Score: ${score}`,10 ,50);

//draw platforms
    for (let i=0; i < platforms.length; i++) {
        //platforms[i].x += -1.5;
        drawSquare(platforms[i]);
    };
    players.forEach(p => {
        drawSquare(p);
        p.yVelocity += p.gravity;
        p.y += p.yVelocity;
        if (controls.up) {
            p.y -= 18;
        }
        if (controls.left) {
            p.x -= 5;
        }
        if (controls.right) {
            p.x += 5;
            if (p.x > c.width - 200) {
                enemies.forEach(e => {
                e.x -= 5;
            })
            }
        }
        if (controls.space) {
        }
        document.body.onkeyup = function(e) {
            if(e.keyCode === 32) {
                bullets.push(new element(p.x + 20, p.y + 10, 10, 10, 'gray', 'bullet'));
            }
        }
        if (p.x <= 0) {
            p.x = 0;
        }
        enemies.forEach(e => {
            drawSquare(e);
            bullets.forEach(b => {
                if (b.x > e.x && b.x < e.x + e.width &&
                    b.y > e.y && b.y < e.y + e.height) {
                        e.x = 50000;
                        b.x = 50100;
                        score += 1;
                    }
            })
        })
        bullets.forEach(b => {
            drawSquare(b);
            b.x +=5;
            if (b.x > p.x + c.width) {
                b.x = 50000;
            }
        })
        platforms.forEach(plat => {
            if (p.x > c.width - 200) {
                plat.x -= 5;
                p.x -= .01;
            }
            if (p.x >= plat.x && p.x <= plat.x + plat.width) {
                floor = c.height - 40 - plat.height;
                if (p.y > floor && p.y < floor+50) {
            p.yVelocity = 0;
            p.y = c.height - plat.height - 40;
        }
            }
        })

    })
}

drawElements();

window.addEventListener('keydown', controls.active);
window.addEventListener('keyup', controls.active);

export { broadcastUser, broadcastUsers, submitMessage, broadcastMessages };