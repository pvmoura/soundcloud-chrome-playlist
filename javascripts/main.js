soundCloudApp.loadMain = function() {
  var that = this;
  console.log('in main', this);

  if (!window.SC) {
    that.errorLog.unloadedFiles.push("vendors/sdk");
  }

  if (this.errorLog.unloadedFiles.length) {
    console.log(that.errorLog.unloadedFiles);
    that.errorLog.unloadedFiles.reduce(function (prev, curr, i, arr) {
      if (prev.indexOf(curr) === -1)
        that.loadFile("javascripts/" + curr + ".js");

      return prev + curr;
    }, "");
    that.errorLog.unloadedFiles = [];

    window.onload = function() { 
      that.loadMain.apply(that);
    };
    return;
  }
  var SC                  = window.SC,
      makeSCFunc          = this.utils.makeSCFunc,
      dispatchEvent       = this.utils.dispatchEvent,
      flashWarningMessage = this.utils.flashWarningMessage,
      makeHTMLTag         = this.utils.makeHTMLTag,
      getById             = this.utils.getById,
      initializeEvents    = this.viewLogic.initializeEvents,
      updateTracksLeft    = this.viewLogic.updateTracksLeft,
      updatePlayerandPlay = this.viewLogic.updatePlayerandPlay,
      updateTrackInfo     = this.viewLogic.updateTrackInfo,
      updateNowPlaying    = this.viewLogic.updateNowPlaying,
      getNewPlayCount     = this.viewLogic.getNewPlayCount,
      getNewList          = this.controllers.getNewList,
      getNewArtist        = this.controllers.getNewArtist,
      getNewTrack         = this.controllers.getNewTrack,
      getNewFollowing     = this.controllers.getNewFollowing;


  this.main = {
    initialize: function () {
      console.log("ran initialize");
      console.log(this);
      var that = this;
      var playData = { SCInfo: {
        oauth_token: "1-134128-151865822-72dca35449925",
        client_id: '3cfc276356e86e5aa30290c4362ed56d',
        redirect_uri: 'http://localhost:8000/callback.html'
      } };
      var eventCallbacks = {
        'yesfollowing': getNewList,
        'nofollowing': getNewArtist,
        'yestrack': this.updateView,
        'notrack': getNewTrack,
        'yeslist': getNewTrack,
        'nolist': getNewFollowing,
        'error': flashWarningMessage
      };
      SC.initialize(playData.SCInfo);
      initializeEvents(eventCallbacks, "control");

      makeSCFunc('get', '/me', playData.SCInfo, function(me) {
        var ul = makeHTMLTag('ul'), li, container = getById('container');

        SC.get('/users/' + me.id + '/followings.json', playData.SCInfo, function (followings) {
          if (followings && followings.length > 0) {

            followings.reduce(function (prev, curr, i, arr) {

              li = makeHTMLTag('li', {
                'innerHTML': curr.username,
                'className': 'artistName',
              });

              li.onclick = function () {
                var artistData = {
                  artistObj: curr,
                  unplayedFollowings: followings,
                  SCInfo: playData.SCInfo,
                };
                var poppingIndex = followings.indexOfByKeyVal('id', curr.id);
                artistData.unplayedFollowings.popByIndex(poppingIndex);
                dispatchEvent('control', 'yesfollowing', artistData);
              };

              ul.appendChild(li);
            });

            container.appendChild(ul);
          } else {
            container.innerHTML = "No Followings";
          }
        });
      })();
    }
    ,updateView: function (data) {
      console.log(that);
        var track = data['track'],
            list = data['list'],
            artist = data['artistObj'],
            playCount = getNewPlayCount(data), maxPlays = parseInt(getById("maxPlays").value, 10),
            resetValue = maxPlays && maxPlays > 0 ? maxPlays : 3;

        console.log('play count is: ' + playCount);

        if (playCount !== false) {
          updateTracksLeft(playCount);
          updateTrackInfo(data, data.track);
          updatePlayerandPlay(data);
          updateNowPlaying(data);
        } else if (isNaN(playCount)) {
          dispatchEvent('control', 'error', { message: 'playCount is NaN' });
        } else {
          updateTracksLeft(resetValue);
          dispatchEvent('control', 'nofollowing', data);
        }
    }
  };
  (function() {
    console.log("HELLO");
    var main = soundCloudApp.main;
    main.initialize.apply(main);
  })();
  // window.dispatchEvent(new Event("onload"));
};

soundCloudApp.loadMain.apply(soundCloudApp);
