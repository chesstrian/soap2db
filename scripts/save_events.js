var config = require('config');
var sql = require('mssql');

var lib = require("../lib/index");

var insertEventStatement = function (event) {
  return "INSERT INTO Event (Description, IsProp, InGame, LeagueId, ScheduledTime, StartTime, ReferenceId) VALUES " +
    "( " + "'" + event.description + "'" +
    ", " + (event.is_prop == 'true' ? 1 : 0) +
    ", " + (event.in_game == 'true' ? 1 : 0) +
    ", " + parseInt(event.league_id) +
    ", " + "'" + event.scheduled_time + "'" +
    ", " + "'" + event.start_time + "'" +
    ", " + parseInt(event.id) + " )";
};

var updateEventStatement = function (eventId) {
  return "UPDATE Event SET InGame = !InGame WHERE ReferenceId = " + eventId;
};

var insertParticipantStatement = function (eventId, participant) {
  return "INSERT INTO Participant (EventId, Name, Pitcher, RotationNumber, IsScheduled, Shortname) VALUES " +
      "( " + eventId +
      ", " + "'" + participant.long_name + "'" +
      ", " + "'" + participant.pitcher + "'" +
      ", " + parseInt(participant.rotation) +
      ", " + (participant.scheduled == 'true' ? 1 : 0) +
      "' " + "'" + participant.short_name + "' )";
};

module.exports = function () {
  lib.getToken(function (err, token) {
    if (err) {
      console.log(err);
      return;
    }

    console.log('Token:', token);

    lib.getEvents(token, function (err, events) {
      if (err) {
        console.log(err);
        return;
      }

      console.log('Processing', events.length, 'events');

      events.forEach(function (event) {
        new sql.Request()
          .input('event_id', sql.Int, parseInt(event.id))
          .query("SELECT * FROM Event WHERE ReferenceId = @event_id")
          .then(function (record) {
            var transaction = new sql.Transaction();

            if (record.length == 0) {
              lib.runStatement(transaction, insertEventStatement(event));

              if (event.participants != null) {
                event.participants.SMTOParticipant.forEach(function (participant) {
                  lib.runStatement(transaction, insertParticipantStatement(parseInt(event.id), participant));
                });
              }
            } else if (record[0].InGame != (event.in_game == 'true')) {
              lib.runStatement(transaction, updateEventStatement(parseInt(event.id)));
            }
          })
          .catch(function (err) { console.log(err); });
      });
    });
  });
};
