import { startSolo, stopSolo } from './api';

let score = 0,
    platforms = [],
    players = [],
    bullets = [],
    enemies = [],
    lives,
    gravity = 0.5,
    random = function (min, max) {
        let num = Math.floor(Math.random() * Math.floor(max));
        return num > min ? num : num + min;
    },
    colors = ['black', 'brown', 'white'],
    loop;

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
            bullets.push(new element(players[0].x + 20, players[0].y + 10, 10, 10, 'gray', 'bullet'));
        }
        if (players.length > 0) {
        players[0].controls = controls;
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

function createGame() {
    startSolo();
    window.addEventListener('keydown', controls.active);
    window.addEventListener('keyup', controls.active);
    loop = setInterval(makeElements, 20);
    lives = 1;
    score = 0;
    enemies.push(new element(0, 0, 0, 0, 'gray', 'enemy_placeholder'));
    players.push(new element(100 + (100 / 2) - (20 / 2), c.height - 50 - 40, 20, 40, 'orange', 'player', '', '🥐'));

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

function makeElements() {
    let floor = c.height + 100;

    if (platforms[0].x + platforms[0].width < 0) {
        platforms.shift();
    }
    if (enemies[1].x + 40 < 0) {
        enemies.splice(1, 1);
    }
    players.forEach(p => {
        if (p.y > c.height) {
            lives -= 1;
            console.log(lives);
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
        platforms.forEach(plat => {
            if (p.x > c.width - 200) {
                plat.x -= 5;
                p.x -= .1;
            }

            if (p.x >= plat.x && p.x <= plat.x + plat.width) {
                floor = c.height - 40 - plat.height;
                if (p.y > floor && p.y < floor + 50) {
                    p.yVelocity = 0;
                    p.y = c.height - plat.height - 40;
                }
            }
        })
    })

let els = [players, platforms.slice(0, 6), enemies, bullets];
            ctx.clearRect(0, 0, c.width, c.height);
            drawElements(els);
            ctx.font = "30px Arial";
            ctx.textAlign = 'left';
            ctx.fillText(`Score: ${score}`,10 ,50);

    if (lives < 1 || players.length === 0) {
        ctx.font = '90px Arial';
        ctx.fillStyle = 'red';
        ctx.fillText(`☠️`, c.width/2 -45, c.height/2 - 20);
            clearInterval(loop);
            platforms = [];
            bullets = [];
            enemies = [];
            players = [];
            console.log('Game Over', lives);
            window.removeEventListener('keydown', controls.active);
            window.removeEventListener('keyup', controls.active);
            stopSolo();
        }

    for (let i = 0; i < bullets.length; i++) {
        bullets[i].x += 5;
        for (let j = 0; j < 15; j++) {
            if (bullets[i].x > enemies[j].x && bullets[i].x < enemies[j].x + enemies[j].width &&
                bullets[i].y > enemies[j].y && bullets[i].y < enemies[j].y + enemies[j].height) {
                enemies.splice(j, j);
                bullets[i].x = c.width;
                score += 1;
            }
        };
        if (bullets[i].x > bullets[i].x + c.width) {
            bullets[i].splice(i, i);
        }
    }
}

export { createGame };