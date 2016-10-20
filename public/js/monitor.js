$( document ).ready(function () {
  var socket = io();

  socket.on('log', function (message) {
    var output = $( 'pre' );

    output.append(message + '\n');
    output.animate({ scrollTop: output.prop('scrollHeight') }, 1000);
  });

  $( 'button#button-clean' ).on('click', function () {
    var output = $( 'pre' );

    output.text('');
  });
});