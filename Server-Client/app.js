var express = require('express');
var app = express();
var server = app.listen(2000);
var io = require('socket.io').listen(server);
var idArduino = null;

// Queue
var currentIdSession = null;
var socketQueue = [];

// Frame livestream
var nbFrame = 0;

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {

  //
  // Arduino
  //

  // Save Arduino socket ID
  socket.on('arduinoID', function (data) {
    console.log("Arduino is connected");
    idArduino = socket.id;
  });

  // Stream webcam
  socket.on('livestream', function (data) {
    
    nbFrame++;

    if (nbFrame >= 5) {
      nbFrame = 0;
      socket.broadcast.emit('livestreamClient',data);
    };

    if (currentIdSession) {
      io.to(currentIdSession).emit('livestreamClient', data);
    };
  });

  // Delete Arduino socket ID
  socket.on('disconnect', function() {
    if (idArduino == socket.id) {
      console.log("Arduino is disconnected");
      idArduino == null;
    } else {
      if (socketQueue.indexOf(socket.id) > 0) {
        socketQueue.splice(socketQueue.indexOf(socket.id),1);
      };
    };
  });

  //
  // Client
  //

  socket.on('firstConnection', function (data) {
    socket.emit('nbTotalQueue',socketQueue.length);
  });

  //
  // Client - Queue
  //

  // Add client to the queue
  socket.on('AddQueue', function (data) {
    addToTheQueue(socket.id);
  });

  //
  // Client - Rotation
  //
  socket.on('rotationX', function (data) {
    if (idArduino && currentIdSession) {
      if (currentIdSession == socket.id) {
        io.to(idArduino).emit('arduinoRotationX', data);
      };
    };
  });
  socket.on('rotationY', function (data) {
    if (idArduino && currentIdSession) {
      if (currentIdSession == socket.id) {
        io.to(idArduino).emit('arduinoRotationY', data);
      };
    };
  });

});

//
// Queue
//

function addToTheQueue (socketID) {
  
  var alreadyInQueue = false;

  for (var i = socketQueue.length - 1; i >= 0; i--) {
    if (socketQueue[i] == socketID) {
      alreadyInQueue = true;
    };
  };

  if (!alreadyInQueue) {
    socketQueue.push(socketID);
    if (socketQueue.length == 1) {
      startSession();
    } else {
      io.to(socketID).emit('userIsWaiting',socketQueue.length - 1);
    };

    io.sockets.emit('nbTotalQueue',socketQueue.length);

  };

}

function startSession () {
  currentIdSession = socketQueue[0];
  io.to(currentIdSession).emit('userIsPlaying');
  setTimeout(function() {
        manageSession();
  }, 30000);
}

function manageSession () {
  
  io.to(currentIdSession).emit('userNothing');

  currentIdSession = null;
  socketQueue.splice(0,1);

  for (index = 1; index < socketQueue.length; index++) {
    io.to(socketQueue[index]).emit('userIsWaiting',index);
  }
  
  io.sockets.emit('nbTotalQueue',socketQueue.length);

  if (socketQueue.length != 0) {
    startSession();
  } else {
    io.to(idArduino).emit('arduinoRotationX', 0.35);
    io.to(idArduino).emit('arduinoRotationY', 0.33);
  };

}