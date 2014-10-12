var requirejs = require('requirejs');
var Noduino;
requirejs.config({nodeRequire: require});

var prevAngleX = 90, prevAngleY = 90;

var io = require('socket.io-client');
var socket = io.connect('http://localhost:2000', {reconnect: true});

socket.emit('arduinoID');

socket.on('arduinoRotationX', function (data) {
  moveServoX(-1 * data["rotation"]);
});

socket.on('arduinoRotationY', function (data) {
  moveServoY(-1 * data["rotation"]);
});

requirejs(['./public/scripts/libs/Noduino', './public/scripts/libs/Noduino.Serial', './public/scripts/libs/Logger'], function (NoduinoObj, NoduinoConnector, Logger) {
  Noduino = new NoduinoObj({'debug': true}, NoduinoConnector, Logger);
  Noduino.connect(function(err, board) {
    if (err) {
      console.log("Conection Arduino Failed!");
    } else {
      console.log("Conection Arduino!");
    };
  });
});

function moveServoX (angleData) {
  if (!isNaN(angleData)) {
    angle = convertAngle(angleData);
    sendToServo(angle,2);
  };
}

function moveServoY (angleData) {
  if (!isNaN(angleData)) {
    angle = convertAngle(angleData);
    sendToServo(angle,1);
  };
}

function sendToServo (angle,servo) {
  if (angle < 10) {
    Noduino.write("00"+servo+"00"+angle);
  } else if (angle < 100) {
    Noduino.write("00"+servo+"0"+angle);
  } else {
    Noduino.write("00"+servo+angle);
  };
}

function convertAngle (angleData) {
  angleFloat = parseFloat(angleData) + 1;
  angle = angleFloat*90;

  gap = 22;

  angle = gap * angle / 180;

  angle = Math.round((90 - (gap / 2)) + angle); 

  if (angle < 79) {
    angle = 79;
  } else if (angle > 101) {
    angle = 101;
  };
  // angle = 90;
  return angle;
}

// Live stream

var WebSocket = require('ws')
var ws = new WebSocket('ws://localhost:8080/p5websocket');

ws.onmessage = function (e) {
  socket.emit('livestream', e.data);
}