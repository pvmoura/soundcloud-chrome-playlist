(function () {
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
      getMyFollowings     = this.controllers.getMyFollowings,
      saveSettings        = this.persistence.saveSettings,
      loadSettings        = this.persistence.loadSettings;

  this.main = {
    runApp: function () {
      var maxPlays = 3, maxPlaysElem = getById('maxPlays'), playAll = false,
          playAllElem = getById('playAll'), tracksLeft = maxPlays,
          player = getById('player'), trackText = getById("trackText");

      // UI settings
      maxPlaysElem.onchange = function (evt) {
        var val = parseInt(this.value, 10);
        if (typeof val === 'number' && !isNaN(val)) {
          maxPlays = val;
          saveSetting(this.id, this.value);
        } else
          dispatchEvent('control', 'error', { error: "Please enter a number" });
      };
      playAllElem.onchange = function (evt) {
        playAll = this.checked;
        saveSetting(this.id, this.checked);
      };

      // UI callback functions, playCount, maxPlays, etc.
      player.onloadstart = function () { tracksLeft--; };
      player.addEventListener("error", function (error) {
        dispatchEvent('control', 'error', { error: "A problem occurred please try again" });
      }, false);

      document.addEventListener("nofollowing",
                                function () { tracksLeft = maxPlays; },
                                true);

      function updateView (data) {
        
        function getPC (maxPlays, list, playAll, oldPC) {
          var listLen = list.length;

          newPC = playAll || listLen <= maxPlays ? listLen :
                  oldPC >= 0 && oldPC <= maxPlays ? oldPC : false;
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
      this.main.runApp();
      this.viewLogic.initializeUIElementEvents();
      this.persistence.loadAllSettings();
    }
  };
  (function() {
    console.log("HELLO");
    window.onload = function () {
      soundCloudApp.main.initialize.apply(soundCloudApp);
    };
  })();
}).apply(soundCloudApp);