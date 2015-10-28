(function() {
  if (!this.utils) {
    this.errorLog.unloadedFiles.push("utilities");
    this.errorLog.unloadedFiles.push("viewLogic");
    return;
  }

  var getById         = this.utils.getById,
      makeSCFunc      = this.utils.makeSCFunc,
      dispatchEvent   = this.utils.dispatchEvent,
      makeHTMLTag     = this.utils.makeHTMLTag;
  
  

  this.viewLogic = {
    initializeEvents: function(eventCallbacks, elemName) {
      var controlElem, eventName;
      
      elemName = elemName || 'control';
      controlElem = getById(elemName);

      for (eventName in eventCallbacks) {

        if (eventCallbacks.hasOwnProperty(eventName)) {

          controlElem.addEventListener(eventName, function (evt) {
            var detail = evt.detail;
            if (detail && detail.data) {
              if (detail.callback)
                eventCallbacks[evt.type](detail.data, detail.callback);
              else
                eventCallbacks[evt.type](detail.data);
            }
          }, false);

        }
      }
    }

    ,updateTrackInfo: function(data, track, eventFunc) {
      
      var trackElem  = getById("trackElem"),
          trackInfo = getById("trackInfo"),
          trackText = getById("trackText"),
          next = getById("nextButton"),
          follow = getById("followButton");

      trackText.textContent = data['artistObj'].username + " - " + track.title;
      trackInfo.onclick = eventFunc ||
              makeSCFunc('put', '/me/favorites/' + track.id, data.SCInfo);
      next.onclick = function () { dispatchEvent('control', 'notrack', data); };
      follow.onclick = makeSCFunc('put', '/me/followings/' + data.track.user.id, data.SCInfo);
    }

    ,updatePlayerandPlay: function(data, oauth_token) {
      if (typeof(oauth_token) === 'undefined')
        oauth_token = data.SCInfo.oauth_token;
      
      var player = getById('player');
      player.onended = function () { dispatchEvent('control', 'notrack', data); }
      player.src = data.track.stream_url + "?oauth_token=" + oauth_token;

      player.play();
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

    ,updateAllFollowings: function(data) {
      var ul = makeHTMLTag('ul'), li, container = getById('followingsContainer'),
      followings = data.list;

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
              SCInfo: data.SCInfo
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
    }

    ,initializeUIElementEvents: function () {
      var trackText = getById("trackText");
      
      trackText.onmouseover = function (evt) { 
        var that = this, interval = window.setInterval(function () {
          var timeout;
          if (that.scrollHeight - that.scrollTop > 20)
            that.scrollBy(0, 5);
          else {
            timeout = window.setTimeout(function() {
              that.scrollTo(0, 0);
              window.clearTimeout(timeout);
            }, 750);
            window.clearInterval(interval);
          }
        }, 200); 
      };

    }
  }
}).apply(soundCloudApp);