var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users_online = {},
    chat_messages = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  var user_name = '';

  socket.on('user name', function(name){
    user_name = name;

    if (users_online[user_name]!=undefined) {
      socket.emit('user exists');
    } else {
      users_online[user_name] = socket;
      socket.emit('start chat', chat_messages, Object.keys(users_online));

      chat_messages.push(user_name + ' connected');
      socket.broadcast.emit('user connected', user_name, Object.keys(users_online));
    }
  });

  socket.on('chat message', function(msg){
    if (user_name != '') {
      msg = user_name + ': ' + msg;
    }
    chat_messages.push(msg);
    socket.broadcast.emit('chat message', msg);
  });

  socket.on('disconnect', function(){
    delete users_online[user_name];
    chat_messages.push(user_name + ' disconnected');
    io.emit('user disconnected', user_name, Object.keys(users_online));
  });
});

http.listen(8000, function(){
  console.log('listening on :8000');
});
