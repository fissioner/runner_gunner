const express = require('express');
app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    UsernameGenerator = require('username-generator'),
    engine = require('./engine');
let users = [];
let messages = [];

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
let score = 0;
let controls = {};
let platforms = [],
    players = [],
    bullets = [],
    enemies = [],
    lives = 1,
    random = function (min, max) {
        let num = Math.floor(Math.random() * Math.floor(max));
        return num > min ? num : num + min;
    },
    colors = ['black', 'brown', 'white'],
    c = {
        height: 500,
        width: 750
    };

function restart() {

    platforms = [];
    players = [];
    bullets = [];
    enemies = [];
    lives = 1;
    score = 0;

//create players

players.push(new element(100 + (100 / 2) - (20 / 2), c.height - 50 - 40, 20, 40, 'orange', 'player'));

//create initial platforms

platforms.push(new element(100, c.height - 50, 100, 50, 'green', 'platform'));
for (let i = 1; i < 500; i++) {
    let width = random(50, 400),
        height = random(50, 400),
        color = colors[random(0, colors.length)],
        x = platforms[i - 1].x + random(50, 200) + platforms[i - 1].width;
    platforms.push(new element(x, c.height - height, width, height, color, 'platform'));
}

//create enemies

platforms.forEach(p => {
    if (p !== platforms[0] && random(0, 10) < 5) {
        enemies.push(new element(p.x + random(10, p.width - 30), p.y - 45, 25, 45, 'green', 'enemy'));
    }
    function enemy() {
        if (p !== platforms[0] && random(0, 10) < 4) {
            enemies.push(new element(p.x + random(10, p.width - 30), p.y - 45, 25, 45, 'green', 'enemy'));
            enemy();
        }
    }
    enemy();
})
};
restart();


setInterval(function makeElements() {
    let floor = c.height + 100;

    players.forEach(p => {
        if (p.y > c.height) {
            lives -= 1;
        }
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
            bullets.push(new element(p.x + 20, p.y + 10, 10, 10, 'gray', 'bullet'));
        }
        if (p.x <= 0) {
            p.x = 0;
        }
        if (controls.space) {
            bullets.push(new element(p.x + 20, p.y + 10, 10, 10, 'gray', 'bullet'));
        }
        enemies.forEach(e => {
            if (p.x > e.x && p.x < e.x + e.width &&
                p.y > e.y && p.y < e.y + e.height) {
                lives -= 1;
            }
            bullets.forEach(b => {
                if (b.x > e.x && b.x < e.x + e.width &&
                    b.y > e.y && b.y < e.y + e.height) {
                    e.x = 50000;
                    b.x = 60100;
                    score += 1;
                    io.emit('score', score);
                }
            })
        })
        bullets.forEach(b => {
            b.x += 5;
            if (b.x > p.x + c.width) {
                b.x = 50000;
            }
        })
        platforms.forEach(plat => {
            if (p.x > c.width - 200) {
                plat.x -= 5;
                p.x -= .05;
            }
            if (p.x >= plat.x && p.x <= plat.x + plat.width) {
                floor = c.height - 40 - plat.height;
                if (p.y > floor && p.y < floor + 50) {
                    p.yVelocity = 0;
                    p.y = c.height - plat.height - 40;
                }
            }
        })
        if (lives > 0) {
            io.emit('drawElements', [players, platforms, enemies, bullets]);
        }
        else {
            restart();
        }
    })
}, 10
);


io.on('connection', function (socket) {

    console.log(`New User Connection, Socket ID: ${socket.id}`);
    let user = UsernameGenerator.generateUsername("-");
    user = user.split('-');
    user = user[1] + '-' + user[0];

    users.push(user);
    socket.emit('user', user);
    io.emit('users', users);
    io.emit('msg', messages);

    socket.on('submitMsg', function (msg) {
        messages.unshift(msg);
        console.log(messages);
        io.emit('msg', messages);
    });

    socket.on('disconnect', function () {
        console.log(`User Disconnected, Socket ID: ${socket.id}`);
        users = users.filter(u => u !== user);
        io.emit('users', users);
    });

    socket.on('controls', function (c) {
        controls = c;
    });
    socket.on('bullets', function() {
        bullets.push(new element(players[0].x + 20, players[0].y + 10, 10, 10, 'gray', 'bullet'));
    });
});

const port = process.env.PORT || 5000;
http.listen(port, () => console.log(`Server listening on port ${port}...`));