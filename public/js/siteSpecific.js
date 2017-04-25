//bug when staring 'contine workshop' it selects all continue workshops

$(document).ready(function(){


    // Define your database
          //
          var db = new Dexie("talkSave_database");
          db.version(1).stores({
              talks: 'name,speaker,room,track,isSaved,day,startTime,endTime'
          });
          db.version(2).stores({
              talks: 'name,speaker,room,track,[isSaved+day],startTime,endTime'
          });
          loadSavedTalks();
    $('.rc-schedule-talk').click(function() {
        var path = $(this).find('path');

        if (path.hasClass('saved')) {
            var talkName = stripWhiteSpace($(this).find('.rc-schedule-talk__title'));
            unsaveTalk(talkName);
            path.removeClass('saved');
            $(this).find('polygon').removeClass('saved');
        } else {
            saveTalk(this);
            path.addClass('saved');
            $(this).find('polygon').addClass('saved');
        }
    });

    function stripWhiteSpace(string) {
        return $.trim($(string).html());
    }


    function stripInnerWhiteSpace(string) {
        return $.trim($(string).html()).replace(/ /g,'');
    }


    function saveTalk(selected) {
        // get day
        var day = $(selected).parent().parent().parent().attr('id');
        console.log(day);

        //get time slot
        var time = $(selected).parent().find('.rc-schedule-list-item__time');
        var timeParsed = stripInnerWhiteSpace(time).split('-');
        var start = timeParsed[0];
        var end = timeParsed[1];
        console.log($.trim(time.html()));
        console.log('start=' + start + " end=" + end);

        //get talk name
        var talk = stripWhiteSpace($(selected).find('.rc-schedule-talk__title'));
        console.log("talk=" + talk);

        //get speaker name
        var speaker = stripWhiteSpace($(selected).find('.rc-schedule-talk__speaker'));
        //test if speaker isn't ""
        console.log("speaker=" + speaker);

        //get room
        var room = stripWhiteSpace($(selected).find('.rc-schedule-talk__room'));
        console.log("room=" + room);

        //get track
        var track = stripWhiteSpace($(selected).find('.rc-schedule-talk__track'));
        console.log("track=" + track);

        //save it
        db.talks.put({name: talk , speaker: speaker, room: room, track: track, isSaved: true, day: day, startTime: start, endTime:end})
        .catch(function(error) {
             //
             // Finally don't forget to catch any error
             // that could have happened anywhere in the
             // code blocks above.
             //
             //alert ("Ooops: " + error);
        });
    }

    function unsaveTalk(talkName) {
        db.talks.get(talkName).then(function(talk) {
            console.log('got talk=' + talk);
            db.talks.put({name: talk.name , speaker: talk.speaker, room: talk.room, track: talk.track, isSaved: false, day: talk.day, startTime: talk.start, endTime: talk.end})
            .catch(function(error) {
             //
             // Finally don't forget to catch any error
             // that could have happened anywhere in the
             // code blocks above.
             //
             //alert ("Ooops: " + error);
          });
        }).catch(function(error) {
             //
             // Finally don't forget to catch any error
             // that could have happened anywhere in the
             // code blocks above.
             //
             //alert ("Ooops: " + error);
          });
    }

    function loadSavedTalks() {
        //color stars in for saved talks
        db.talks
            .filter(talk => (talk.isSaved == true))
            .toArray()
            .then(function (savedTalks) {
                $.each(savedTalks, function(index, value) {
                    var name = value.name;
                    console.log("found saved talk name=" + name);
                    $.each($('.rc-schedule-talk__title'), function(index, talk){
                        if (stripWhiteSpace($(talk)) === name) {
                            console.log("talk === name");
                            var path = $(talk).parent().find('path');
                            path.addClass('saved');
                            $(talk).parent().find('polygon').addClass('saved');
                        }
                    });
                });
            }).catch(function(error) {
                console.log(error);
          });

          //populate mySchedule
          loadMySchedule('tuesday');
          loadMySchedule('wednesday');
          loadMySchedule('thursday');
        }

    function loadMySchedule(dayString) {
        //tuesday
        db.talks
            .filter(talk => (talk.isSaved == true && talk.day == dayString))
            .toArray()
            .then(function (savedTalks) {
                var sortedSavedTalks = savedTalks.sort(function(a, b){
                    var aStartTimeSplit = [a.startTime.substr(0,a.startTime.length-2),a.startTime.substr(-2)];
                    var aStartTimeMilitary;
                    if (aStartTimeSplit[1] === 'AM') {
                        aStartTimeMilitary = aStartTimeSplit[0];
                    } else {
                        var splitColon = aStartTimeSplit[0].split(':');
                        aStartTimeMilitary = (parseInt(splitColon[0]) + 12) + ":" + splitColon[1] ;
                    }

                    var bStartTimeSplit = [b.startTime.substr(0,b.startTime.length-2),b.startTime.substr(-2)];
                    var bStartTimeMilitary;
                    if (bStartTimeSplit[1] === 'AM') {
                        bStartTimeMilitary = bStartTimeSplit[0];
                    } else {
                        var splitColon = bStartTimeSplit[0].split(':');
                        bStartTimeMilitary = (parseInt(splitColon[0]) + 12) + ":" + splitColon[1] ;
                    }

                    return aStartTimeMilitary.localeCompare(bStartTimeMilitary);
                });
                $('.myScheduleList').append('<li class="rc-schedule-list-item listItem' + dayString + '"><h3 class="dayListItem">' 
                        + dayString + '</h3></li>');
                $.each(savedTalks, function(index, value) {
                    //list saved items
                    var listItemDayClass = '.listItem' + dayString;
                    $(listItemDayClass).append(
                        '<div class="rc-schedule-talk"><h4 class="rc-schedule-list-item__time">'
                        + value.startTime + ' - ' + value.endTime + '</h4><div class="rc-schedule-talk__track session__type session__type--security">'
                        + value.track + '</div><h3 class="rc-schedule-talk__title">'
                        + value.name  + '</h3><h5 class="rc-schedule-talk__speaker">'
                        + value.speaker + '</h5><p class="rc-schedule-talk__room">'
                        + value.room + '</p></div></li>'
                    );
                });

            }).catch(function(error) {
                    console.log(error);
            });
        
                    //     '<li>day: ' + value.day 
                    // + ' time: ' + value.startTime + ' - ' + value.endTime
                    // + ' talk name: ' + value.name + '</li>');
    }

    function reloadPageWithHash(hash) {
       
        location.assign(location.origin + hash);
        location.reload();
    }

    function refresh() {
        reloadPageWithHash('#mySchedule');
    }
          
    function deleteAll() {
        db.talks
        .clear()
        .then(function (deleteCount) {
            console.log( "Deleted " + deleteCount + " objects");
            location.reload();
        });
        
    }

    $('#clearItems').click(deleteAll);
    $('#refresh').click(refresh);
    $('#label_mySchedule').click(refresh);

    

    
});
