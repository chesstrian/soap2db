$( document ).ready(function () {
  var socket = io();

  socket.emit('count');

  socket.on('client:count', function (count) {
    $( 'h4#events' ).text(count.events);
    $( 'h4#participants' ).text(count.participants);
    $( 'h4#odds' ).text(count.odds);

    if (count.error) {
      $( 'span#status-title' ).removeClass('label-primary').addClass('label-danger');
    }
  });

  socket.on('client:log', function (message) {
    var output = $( 'pre' );

    output.append(message + '\n');
    output.animate({ scrollTop: output.prop('scrollHeight') }, 1000);
  });

  socket.on('client:added', function (added) {
    var current;

    if (added.events) {
      var events = $( 'h4#events' );
      current = parseInt(events.text());
      events.text(current + added.events);
    }

    if (added.participants) {
      var participants = $( 'h4#participants' );
      current = parseInt(participants.text());
      participants.text(current + added.participants);
    }

    if (added.odds) {
      var odds = $( 'h4#odds' );
      current = parseInt(odds.text());
      odds.text(current + added.odds);
    }
  });

  $( 'button#button-clean' ).on('click', function () {
    $( 'pre' ).text('');
  });
});