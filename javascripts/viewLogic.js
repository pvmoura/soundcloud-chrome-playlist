(function() {
  if (!this.utils) {
    this.errorLog.unloadedFiles.push("utilities");
    this.errorLog.unloadedFiles.push("viewLogic");
    return;
  }

  var getById = this.utils.getById,
      makeSCFunc = this.utils.makeSCFunc,
      dispatchEvent = this.utils.dispatchEvent;
  
  

  this.viewLogic = {
    initializeEvents: function(eventCallbacks, elemName) {
      var controlElem, eventName;
      
      elemName = elemName || 'control';
      controlElem = getById(elemName);

      for (eventName in eventCallbacks) {

        if (eventCallbacks.hasOwnProperty(eventName)) {

          controlElem.addEventListener(eventName, function (evt) {
            if (evt.detail && evt.detail.data) {
              eventCallbacks[evt.type](evt.detail.data);
            }
          }, false);

        }
      }
    }

    ,updateTracksLeft: function(playCount) {
        var tracksLeft = getById("tracksLeft");
        tracksLeft.innerHTML = playCount;
        return true;
      }

    ,updateTrackInfo: function(data, track, eventFunc) {
      
      var trackElem  = getById("trackElem");
          trackInfo = getById("trackInfo");
          trackTextNodes = trackElem.childNodes.filterToArray(
              function (node) { return node.nodeType === 3; }
          );
      if (trackTextNodes.length)
        trackTextNodes[0].textContent = track.title;
      trackInfo.onclick = eventFunc || makeSCFunc('put', '/me/favorites/' + track.id, data.SCInfo);

    }

    ,updatePlayerandPlay: function(data, oauth_token) {
      if (typeof(oauth_token) === 'undefined')
        oauth_token = data.SCInfo.oauth_token;
      
      var player = getById('player');
      player.onended = function () { dispatchEvent('control', 'notrack', data); }
      player.src = data.track.stream_url + "?oauth_token=" + oauth_token;

      player.play();
    }

    ,updateNowPlaying: function(data) {
      var nowPlaying = getById('nowPlaying'),
          nowPlayingName = getById("nowPlayingName"),
          next = getById('nextButton'),
          follow = getById('followButton');

      
      nowPlayingName.innerHTML = data['artistObj'].username || "";
      next.onclick = function () { dispatchEvent('control', 'notrack', data); };
      follow.onclick = makeSCFunc('put', '/me/followings/' + data.track.user.id, data.SCInfo);
      nowPlaying.style.display = "block";
    }
    ,getNewPlayCount: function(data) {
      // console.log(data.list);
      var listLen = data.list.length, playAll = getById("playAll").checked,
          pcElem = getById("tracksLeft"), oldPC = parseInt(pcElem.innerHTML, 10),
          maxPlays = parseInt(getById("maxPlays").value, 10),
          newPC = playAll || listLen <= maxPlays ? listLen :
                  oldPC && oldPC >= 0 ?
                    oldPC <= maxPlays || maxPlays < 0 ? oldPC - 1 : maxPlays
                  : false;
      return newPC;
    }
  }
}).apply(soundCloudApp);