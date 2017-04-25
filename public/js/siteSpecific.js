//bug when staring 'contine workshop' it selects all continue workshops

$(document).ready(function(){

    // Define your database
          //
          var db = new Dexie("talkSave_database");
          db.version(1).stores({
              talks: 'name,speaker,room,track,isSaved,day,startTime,endTime'
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
        db.talks
            .filter(talk => (talk.isSaved == true))
            .toArray()
            .then(function (savedTalks) {
                $.each(savedTalks, function(index, value) {
                    var name = value.name;
                    console.log("found saved talk name=" + name);

                    //list saved items
                    $('#savedItemList').append('<li>day: ' + value.day 
                    + ' time: ' + value.startTime + ' - ' + value.endTime
                    + ' talk name: ' + value.name + '</li>');

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
             //
             // Finally don't forget to catch any error
             // that could have happened anywhere in the
             // code blocks above.
             //
             //alert ("Ooops: " + error);
          });
        }
//
          

          //
          // Put some data into it
          //
          //db.friends.put({name: "Nicolas", shoeSize: 8}).then (function(){
              //
              // Then when data is stored, read from it
              //
              //return db.friends.get('Nicolas');
          //}).then(function (friend) {
              //
              // Display the result
              //
              //alert ("Nicolas has shoe size " + friend.shoeSize);
         /// }).catch(function(error) {
             //
             // Finally don't forget to catch any error
             // that could have happened anywhere in the
             // code blocks above.
             //
             //alert ("Ooops: " + error);
          //});
});
