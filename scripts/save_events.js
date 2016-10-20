var async = require('async');
var config = require('config');
var sql = require('mssql');

var lib = require("../lib/index");

module.exports = function (socket) {
  var logger = lib.logger(socket);

  return function () {
    var insertEventStatement = "INSERT INTO Event " +
      "(Description, IsProp, InGame, LeagueId, ScheduledTime, StartTime, ReferenceId) VALUES " +
      "(@description, @is_prop, @in_game, @league_id, @scheduled_time, @start_time, @reference_id)";

    var insertParticipantStatement = "INSERT INTO Participant " +
      "(EventId, Name, Pitcher, RotationNumber, IsScheduled, Shortname) VALUES " +
      "(@event_id, @name, @pitcher, @rotation_number, @is_scheduled, @shortname)";

    lib.getToken(function (err, token) {
      if (err) {
        logger(err);
        return;
      }

      logger('Getting events and participants with token: ' + token);

      lib.getEvents(token, function (err, events) {
        if (err) {
          logger(err);
          return;
        }

        logger('Processing ' + events.length + ' Events');

        var event_ids = events.map(function (e) {return parseInt(e.id);});

        sql.connect(config.get("mssql_uri"))
          .then(function () {
            new sql.Request().query("SELECT ReferenceId FROM Event")
              .then(function (recordSet) {
                var events_db = recordSet.map(function (e) {return e.ReferenceId;});
                var missing_event_ids = event_ids.filter(function (e) {return !~events_db.indexOf(e);});
                var missing_events = events.filter(function (e) {return ~missing_event_ids.indexOf(parseInt(e.id));});
                var participants = [];

                missing_events.forEach(function (event) {
                  if (event.participants != null) {
                    event.participants.SMTOParticipant.forEach(function (participant) {
                      participant.event_id = parseInt(event.id);
                      participants.push(participant);
                    });
                  }
                });

                var psEvent = new sql.PreparedStatement();
                psEvent.input('description', sql.VarChar);
                psEvent.input('is_prop', sql.Bit);
                psEvent.input('in_game', sql.Bit);
                psEvent.input('league_id', sql.Int);
                psEvent.input('scheduled_time', sql.DateTime);
                psEvent.input('start_time', sql.DateTime);
                psEvent.input('reference_id', sql.Int);

                var psParticipants = new sql.PreparedStatement();
                psParticipants.input('event_id', sql.Int);
                psParticipants.input('name', sql.VarChar);
                psParticipants.input('pitcher', sql.VarChar);
                psParticipants.input('rotation_number', sql.Int);
                psParticipants.input('is_scheduled', sql.Bit);
                psParticipants.input('shortname', sql.VarChar);

                psEvent.prepare(insertEventStatement, function (err) {
                  if (err) {
                    logger(err);
                    return;
                  }

                  async.mapSeries(missing_events, function (event, next) {
                    psEvent.execute({
                      description: event.description,
                      is_prop: event.is_prop == 'true' ? 1 : 0,
                      in_game: event.in_game == 'true' ? 1 : 0,
                      league_id: parseInt(event.league_id),
                      scheduled_time: lib.pst2est(event.scheduled_time),
                      start_time: lib.pst2est(event.start_time),
                      reference_id: parseInt(event.id)
                    }, next);
                  }, function (err) {
                    if (err) { logger(err); }

                    psEvent.unprepare(function (err) {
                      if (err) { logger(err); }

                      logger(missing_events.length + ' Events added');
                      socket.emit('server:added', {events: missing_events.length});
                      psParticipants.prepare(insertParticipantStatement, function (err) {
                        if (err) {
                          logger(err);
                          return;
                        }

                        async.mapSeries(participants, function (participant, next) {
                          psParticipants.execute({
                            event_id: participant.event_id,
                            name: participant.long_name || '',
                            pitcher: participant.pitcher || '',
                            rotation_number: parseInt(participant.rotation),
                            is_scheduled: participant.scheduled == 'true' ? 1 : 0,
                            shortname: participant.short_name || ''
                          }, next);
                        });
                      }, function (err) {
                        if (err) { logger(err); }

                        psParticipants.unprepare(function (err) {
                          if (err) { logger(err); }

                          logger(participants.length + ' Participants added');
                          socket.emit('server:added', {participants: participants.length});
                          sql.close();
                        });
                      });
                    });
                  });
                });
              })
              .catch(function (err) {
                logger(err);
                sql.close();
              });
          })
          .catch(function (err) { logger(err); });
      });
    });
  };
};
