var socket = io.connect('http://localhost:2000');
var previousFrame = null;
var previousRotationX = null;
var previousRotationY = null;
var controllerOptions = {enableGestures: true};

var sessionType = 0; // 2 = User can is playing game, 1 = User is waiting in the queue, 0 = User do nothing

var LeapController = Leap.loop(controllerOptions, function(frame) {

  if (sessionType == 2) {
      if (previousFrame && previousFrame.valid) {
      var rotationAxis = frame.rotationAxis(previousFrame);

      var newRotationX = rotationAxis[0].toFixed(2);
      var newRotationY = rotationAxis[2].toFixed(2);

      if (newRotationX != previousRotationX) {
        socket.emit('rotationX', { rotation: newRotationX });
      };
      if (newRotationY != previousRotationY) {
        socket.emit('rotationY', { rotation: newRotationY });
      };

    }
    previousFrame = frame;
    previousRotationX = newRotationX;
    previousRotationY = newRotationY;
  };

})

socket.on('livestreamClient', function(data) {
  $('#live').css('background-image', 'url(data:image/jpg;base64,' + data + ')');
})

socket.on('userNothing', function(data) {

  $("#userIsPlaying").css("display","none");
  $("#userIsWaiting").css("display","none");
  $("#userNothing").css("display","block");

  sessionType = 0;
})

socket.on('userIsWaiting', function(data) {

  $("#nbFrontOfYouQueue").html(data);

  $("#userIsPlaying").css("display","none");
  $("#userIsWaiting").css("display","block");
  $("#userNothing").css("display","none");

  sessionType = 1;
})

socket.on('userIsPlaying', function(data) {

  $("#userIsPlaying").css("display","block");
  $("#userIsWaiting").css("display","none");
  $("#userNothing").css("display","none");

  sessionType = 2;
})

socket.on('nbFrontOfYouQueue', function(data) {
  $("#nbFrontOfYouQueue").html(data);
})

socket.on('nbTotalQueue', function(data) {
  $("#nbTotalQueue").html(data);
})

$(document).ready(function() {

  $("#playGame").click(function() {
    if (LeapController.streaming()) {
      socket.emit('AddQueue');
    } else {
      $( "#noLeapMotion" ).animate({
        opacity: 1
      }, 500, function() {});
    };
  });

  $("#closeNoLeapMotion").click(function() {
    $( "#noLeapMotion" ).animate({
        opacity: 0
      }, 500, function() {});
  });

  $("#closeTeaser").click(function() {
    $( "#teaser" ).animate({
        opacity: 0
      }, 500, function() {});
  });

  socket.emit('firstConnection');

});


