soundCloudApp.loadMain = function() {
  var that = this;

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
      getNewFollowing     = this.controllers.getNewFollowing,
      getMyFollowings     = this.controllers.getMyFollowings;


  // if (!window.SC) {
  //   that.errorLog.unloadedFiles.push("vendors/sdk");
  // }

  // if (this.errorLog.unloadedFiles.length) {
  //   console.log(that.errorLog.unloadedFiles);
  //   that.errorLog.unloadedFiles.reduce(function (prev, curr, i, arr) {
  //     if (prev.indexOf(curr) === -1)
  //       that.loadFile("javascripts/" + curr + ".js");

  //     return prev + curr;
  //   }, "");
  //   that.errorLog.unloadedFiles = [];

  //   window.onload = function() { 
  //     that.loadMain.apply(that);
  //   };
  //   return;
  // }

  this.main = {
    runApp: function () {
      var maxPlays = 3, maxPlaysElem = getById('maxPlays'), playAll = false,
          playAllElem = getById('playAll'), tracksLeft = maxPlays,
          player = getById('player'), trackText = getById("trackText");

      // UI settings
      maxPlaysElem.onchange = function (evt) {
        var val = this.value;
        if (typeof val === 'number' && !isNaN(val))
          maxPlays = Math.floor(val);
        else
          dispatchEvent('control', 'error', { error: "Please enter a number" });
      };
      playAllElem.onchange = function (evt) { playAll = this.checked; };

      // UI callback functions, playCount, maxPlays, etc.
      player.onloadstart = function () { tracksLeft--; };
      player.addEventListener("error", function (error) {
        console.log(error);
        dispatchEvent('control', 'error', { error: "A problem occurred please try again" });
      }, false);

      document.addEventListener("nofollowing",
                                function () { tracksLeft = maxPlays; },
                                false);

      function updateView (data) {
        
        function getPC (maxPlays, list, playAll, oldPC) {
          var listLen = list.length;

          newPC = playAll || listLen <= maxPlays ? listLen :
                  oldPC >= 0 ? oldPC : false;
          return newPC;
        }

        var track = data['track'],
            list = data['list'],
            artist = data['artistObj'],
            newPC = getPC(maxPlays, list, playAll, tracksLeft);

        if (newPC !== false) {
          tracksLeft = newPC;
          updatePlayerandPlay(data);
          updateTrackInfo(data, data.track);
        } else {
          tracksLeft = maxPlays;
          dispatchEvent('control', 'nofollowing', data);
        }
      }

      initializeEvents({ 'yestrack': updateView }, "control");
    }

    ,initialize: function () {
      var playData = { SCInfo: {
        oauth_token: "1-134128-151865822-72dca35449925",
        client_id: '3cfc276356e86e5aa30290c4362ed56d',
        redirect_uri: 'http://localhost:8000/callback.html'
      } };

      var eventCallbacks = {
        'yesfollowing': getNewList,
        'nofollowing': getNewArtist,
        'notrack': getNewTrack,
        'yeslist': getNewTrack,
        'nolist': getNewFollowing,
        'error': flashWarningMessage
      };

      initializeEvents(eventCallbacks, "control");
      getMyFollowings(playData);
      runApp();
    }
  };
  (function() {
    console.log("HELLO");
    window.onload = function () {
      var main = soundCloudApp.main;
      main.initialize.apply(main);
    };
  })();
};

soundCloudApp.loadMain.apply(soundCloudApp);
