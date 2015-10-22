(function() {
  // dependency functions
  if (!this.utils) {
    this.errorLog.unloadedFiles.push("utilities");
    this.errorLog.unloadedFiles.push("controllers");
    return;
  }

  var dispatchEvent = this.utils.dispatchEvent,
      makeSCFunc    = this.utils.makeSCFunc;

  this.controllers = {
    getNewTrack: function(data) {
      var list = data['list'], event = 'nolist';

      if (!list || !list.length) {
        dispatchEvent('control', event, data);
        return;
      }

      do {
        data['track'] = list.popRandomIndex();
      } while (data['track'] && typeof data['track'].stream_url === 'undefined');

      event = data['track'] ? 'yestrack' : 'nolist';
      dispatchEvent('control', event, data);
    }

    ,getNewList: function(data, callback) {
      var url = '/users/' + data['artistObj'].id + '/tracks/';
      callback = callback || function (trackList) {
                  var event = trackList && trackList.length > 0 ? 'yeslist' : 'nolist';
                  data['list'] = trackList;
                  dispatchEvent('control', event, data);
               };
      return makeSCFunc('get', url, data.SCInfo, callback)();
    }

    ,getNewFollowing: function(data, callback) {
      var url ='/users/' + data['artistObj'].id + '/followings.json';
      callback = callback || function (followings) {
                  var artist = followings.popRandomIndex(), event;
                  data['artistObj'] = artist || data['artistObj'];
                  event = artist === false ? 'nofollowing' : 'yesfollowing';
                  dispatchEvent('control', event, data);
                };
      return makeSCFunc('get', url, data.SCInfo, callback)();
    }

    ,getNewArtist: function(data) {
      var artist = data.unplayedFollowings.popRandomIndex(), event = 'error';
      if (artist) {
        event = 'yesfollowing';
        data['artistObj'] = artist;
      }

      dispatchEvent('control', event, data);
    }
  }
}).apply(soundCloudApp);