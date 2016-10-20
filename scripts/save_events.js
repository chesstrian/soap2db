var async = require('async');
var config = require('config');
var moment = require('moment-timezone');
var sql = require('mssql');

var lib = require("../lib/index");

module.exports = function () {
  var insertEventStatement = "INSERT INTO Event " +
    "(Description, IsProp, InGame, LeagueId, ScheduledTime, StartTime, ReferenceId) VALUES " +
    "(@description, @is_prop, @in_game, @league_id, @scheduled_time, @start_time, @reference_id)";

  var insertParticipantStatement = "INSERT INTO Participant " +
    "(EventId, Name, Pitcher, RotationNumber, IsScheduled, Shortname) VALUES " +
    "(@event_id, @name, @pitcher, @rotation_number, @is_scheduled, @shortname)";

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
                  console.log(err);
                  return;
                }

                async.mapSeries(missing_events, function (event, next) {
                  psEvent.execute({
                    description: event.description,
                    is_prop: event.is_prop == 'true' ? 1 : 0,
                    in_game: event.in_game == 'true' ? 1 : 0,
                    league_id: parseInt(event.league_id),
                    scheduled_time: new Date(moment.tz(event.scheduled_time, "America/Los_Angeles").tz("America/New_York").format()),
                    start_time: new Date(moment.tz(event.start_time, "America/Los_Angeles").tz("America/New_York").format()),
                    reference_id: parseInt(event.id)
                  }, next);
                }, function (err) {
                  if (err) { console.log(err); }

                  psEvent.unprepare(function (err) {
                    if (err) { console.log(err); }

                    psParticipants.prepare(insertParticipantStatement, function (err) {
                      if (err) {
                        console.log(err);
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
                      if (err) { console.log(err); }

                      psParticipants.unprepare(function (err) {
                        if (err) { console.log(err); }

                        sql.close();
                      });
                    });
                  });
                });
              });
            })
            .catch(function (err) {
              console.log(err);
              sql.close();
            });
        })
        .catch(function (err) { console.log(err); });
    });
  });
};
