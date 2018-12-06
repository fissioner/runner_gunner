const express = require('express');
app = express(),
http = require('http').Server(app),
io = require('socket.io')(http),
UsernameGenerator = require('username-generator'),
engine = require ('./engine');
let users = [];
let messages = [];

io.on('connection', function(socket){

  console.log(`New User Connection, Socket ID: ${socket.id}`);
    let user = UsernameGenerator.generateUsername("-");
    user = user.split('-');
    user = user[1] + '-' +user[0];

  users.push(user);
  socket.emit('user', user);
  io.emit('users', users);
  io.emit('msg', messages);

    socket.on('submitMsg', function(msg) {
        messages.unshift(msg);
        console.log(messages);
        io.emit('msg', messages);
    });

    socket.on('disconnect', function() {
        console.log(`User Disconnected, Socket ID: ${socket.id}`);
        users = users.filter(u => u !== user);
        io.emit('users', users);
    });
    socket.on ('positions', function() {
        console.log('');
    });

    function element(x, y, width, height, color, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.type = type;
    }
    
    let platform = new element(0, 0, 50, 50, 'blue', 'barrier');
    

});

const port = process.env.PORT || 5000;
http.listen(port, () => console.log(`Server listening on port ${port}...`));