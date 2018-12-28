require('dotenv').config();
const express = require('express'),
sms = require('twilio')(process.env.TWILIO_ID, process.env.TWILIO_TOKEN),
app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    UsernameGenerator = require('username-generator'),
    emojis = require('emojis-list');
let users = [],
    messages = [],
    score = 0,
    platforms = [],
    players = [],
    bullets = [],
    enemies = [],
    lives,
    gravity = 0.5,
    soloGame = false,
    random = function (min, max) {
        let num = Math.floor(Math.random() * Math.floor(max));
        return num > min ? num : num + min;
    },
    colors = ['black', 'brown', 'white'],
    c = {
        height: 500,
        width: 750
    },
    loop;

const { Client } = require('pg'),
  client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

client.connect();

function element(x, y, width, height, color, type, name, emoji) {
    this.name = name || '';
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.type = type;
    this.yVelocity = 0;
    this.xVelocity = 0;
    this.emoji = emoji || '';
    this.controls = {
        left: false,
        right: false,
        up: false,
    };
}
    function createPlatforms() {
        for (let i = 1; i < 10; i++) {
            let width = random(50, 400),
                height = random(50, 400),
                color = colors[random(0, colors.length)],
                x = platforms[platforms.length - 1].x + random(50, 200) + platforms[platforms.length - 1].width;
            platforms.push(new element(x, c.height - height, width, height, color, 'platform'));
            if (random(0, 10) < 6) {
                function makeEnemy() {
                    enemies.push(new element(x + random(10, width - 25), platforms[platforms.length - 1].y - 45, 25, 45, 'green', 'enemy'));
                    if (random(0, 10) < 5) makeEnemy();
                }
                makeEnemy();
            }
        }
    }
function startGame() {
    loop = setInterval(makeElements, 20);
    lives = 1;
    score = 0;
    enemies.push(new element(0, 0, 0, 0, 'gray', 'bullet'));

    //create initial platforms & enemies

    platforms.push(new element(100, c.height - 50, 100, 50, 'green', 'platform'));
    createPlatforms();
};

function makeElements() {
    let floor = c.height + 100;

    if (platforms.length < 10) {
        createPlatforms();
        //createEnemies(6);
    }

    if (platforms[0].x + platforms[0].width < 0) {
        platforms.shift();
    }
    if (enemies[1] && enemies[1].x + 40 < 0) {
        enemies.splice(1, 1);
    }
    players.forEach(p => {
        if (p.y > c.height) {
            lives -= 1;
        }
        p.yVelocity += gravity;
        p.y += p.yVelocity;
        if (p.controls.up) {
            p.y -= 18;
        }
        if (p.controls.left) {
            p.x -= 5;
        }
        if (p.controls.right) {
            p.x += 5;
        }
        if (p.x > c.width - 200) {
            enemies.forEach(e => {
                e.x -= 5;
            })
        }
        if (p.x <= 0) {
            p.x = 0;
        }
        enemies.forEach(e => {
            if (p.x > e.x && p.x < e.x + e.width &&
                p.y > e.y && p.y < e.y + e.height) {
                lives -= 1;
            }
        })
        if (p.x > c.width - 200) {
            platforms.forEach(plat => {
            plat.x -= 5;
            });
            p.x -= 5;
            if (!soloGame) {
            let otherPlayer = players.filter(pl => pl !== p);
            otherPlayer[0].x -= 5;
            }
        }
        platforms.forEach(plat => {
            if (p.x >= plat.x && p.x <= plat.x + plat.width) {
                floor = c.height - 40 - plat.height;
                if (p.y > floor && p.y < floor + 50) {
                    p.yVelocity = 0;
                    p.y = c.height - plat.height - 40;
                }
            }
        })
    })

    io.emit('drawElements', [players, platforms, enemies, bullets]);

    if (lives < 1 || players.length === 0) {
            io.emit('gameOver');
            io.emit('stopGame', false);
            clearInterval(loop);

            if (players.length > 0) {
            client.query(`insert into scores values(default, '${players[0].name}', ${score}, default)`, (err, res) => {
                if (err) throw err;
              });

            client.query(`select * from scores order by score desc limit 25`, (err, res) => {
                if (err) throw err;
                io.emit('showScores', JSON.stringify(res.rows));
              });
            }
            platforms = [];
            bullets = [];
            enemies = [];
            players = [];
            soloGame = false;
            console.log('Game Over');
        }


    for (let i = 0; i < bullets.length; i++) {
        bullets[i].x += 8;
        for (let j = 0; j < enemies.length; j++) {
            if (bullets[i].x > enemies[j].x && bullets[i].x < enemies[j].x + enemies[j].width &&
                bullets[i].y > enemies[j].y && bullets[i].y < enemies[j].y + enemies[j].height) {
                enemies.splice(j, 1);
                bullets[i].x = c.width;
                score += 1;
                io.emit('score', score);
            }
        };
        if (bullets[i].x > c.width) {
            bullets.splice(i, 1);
        }
    } console.log(bullets.length); 
}


io.on('connection', function (socket) {
    console.log(`New User Connection, Socket ID: ${socket.id}`);
    /*sms.messages.create({
        to: process.env.TWILIO_TO,
        from: process.env.TWILIO_FROM,
        body: 'A user connected to Runner Gunner'
    })*/
    let user = UsernameGenerator.generateUsername("-");
    user = user.split('-');
    user = user[1] + '-' + user[0];

    client.query(`select * from scores order by score desc limit 25`, (err, res) => {
        if (err) throw err;
        io.emit('showScores', JSON.stringify(res.rows));
      });

    users.push(user);
    socket.emit('user', user);
    io.emit('users', users);
    io.emit('msg', messages);

    socket.on('submitMsg', function (msg) {
        messages.unshift(msg);
        io.emit('msg', messages);
    });

    socket.on('disconnect', function () {
        console.log(`User Disconnected, Socket ID: ${socket.id}`);
        users = users.filter(u => u !== user);
        players = players.filter(p => p.name !== user);
        io.emit('users', users);
        players = [];
    });

    socket.on('controls', function (c) {
        if (players.length === 2 || soloGame) {
            let player = players.filter(p => p.name === c.userName);
            player[0].controls = c.controls;
        }
    });
    socket.on('bullets', function (userName) {
        if (players.length === 2 || soloGame) {
        let player = players.filter(p => p.name === userName);
        bullets.push(new element(player[0].x + 20, player[0].y + 10, 10, 10, 'gray', 'bullet'));
        }
    });
    socket.on('join', function (userName) {
        let exists = players.filter(p => p.name === userName);
        if (players.length < 3 && exists.length === 0) {
            players.push(new element(100 + (100 / 2) - (20 / 2), c.height - 50 - 40, 20, 40, 'orange', 'player', userName, emojis[random(0, 2440)]));
            socket.emit('joinedGame');
            io.emit('waiting', userName);
        }
        if (players.length === 2) {
            io.emit('startGame', true);
            startGame();
            console.log('Game in Progress');
        }
    });
    socket.on('soloGame', function (userName) {
        soloGame = true;
        socket.emit('joinedGame');
        players.push(new element(100 + (100 / 2) - (20 / 2), c.height - 50 - 40, 20, 40, 'orange', 'player', userName, emojis[random(0, 2440)]));
        io.emit('startGame', true);
        startGame();
        console.log('Game in Progress');
    })
});

const port = process.env.PORT || 5000;
http.listen(port, () => console.log(`Server listening on port ${port}...`));