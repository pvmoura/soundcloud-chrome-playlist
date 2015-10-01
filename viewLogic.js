// HTML elements in the view
var viewElements = {
  'nowPlaying': getById('nowPlaying'),
  'nowPlayingName': getById('nowPlayingName'),
  'nextButton': getById('nextButton'),
  'followButton': getById('followButton'),
  'trackElem': getById("track"),
  'tracksLeft': getById("tracksLeft"),
  'player': getById("player"),
  'control': getById("controlElement"),
  'playCount': getById("numberofPlays")
};

var events = {
  'yesArtist': new Event('yesArtist'),
  'noArtist': new Event('noArtist'),
  'yesTrack': new Event('yesTrack'),
  'noTrack': new Event('noTrack'),
  'yesList': new Event('yesList'),
  'noList': new Event('noList'),
  'playTrack': new Event('playTrack'),
  'updateView': new Event('updateView')
};

function dispatchEvent(elemName, eventName, callback, data) {
  var evt = new CustomEvent(
              eventName,
              { 'detail': function () {
                  console.log(eventName);
                  callback(data);
                }
              }
            );
  viewElements[elemName].dispatchEvent(evt);
}

function initialize() {
  for (var eventName in events) {
    if (events.hasOwnProperty(eventName)) {
      viewElements['control'].addEventListener(eventName, function (evt) {
        if (evt.detail) {
          evt.detail();
        }
      }, false);
    }
  }
}

function updateView(data) {
  var track = data['track'],
      list = data['list'],
      artist = data['artistObj'];
      // tracksLeft = parseInt(viewElements['tracksLeft'], 10),
      // playCount = tracksLeft ? tracksLeft : parseInt(viewElements['playCount'].value, 10);
  if (continuousPlay || list.length < maxPlays)
    maxPlays = list.length + 1;
  else
    maxPlays = parseInt(viewElements['playCount'].value, 10);

  if (maxPlays - playCount > 0) {
    updateTrackInfo(track);
    updatePlayerandPlay(track);
    updateNowPlaying(data);
    playCount++;
    viewElements['tracksLeft'].innerHTML = maxPlays - playCount;
  } else {
    decideNextArtist(data);
  }
}

function updateTrackInfo(track) {
  
  var trackElem  = viewElements["trackElem"];
  trackElem.innerHTML = track.title;
  trackElem.appendChild(makeHTMLTag('span', {
    'innerHTML': "Like Song",
    'event': {'name': 'click', 'func': makeSCFunc('put', '/me/favorites/' + track.id) }
  }));
}

function updatePlayerandPlay(track, oauth_token) {
  if (typeof(oauth_token) === 'undefined')
    oauth_token = global_options['oauth_token'];
  
  viewElements['player'].src = track.stream_url + "?oauth_token=" + oauth_token;
  player.play();
}

function updateNowPlaying(data) {
  var nowPlaying = viewElements['nowPlaying'],
      nowPlayingName = viewElements['nowPlayingName'],
      nextButton = viewElements['nextButton'],
      followButton = viewElements['followButton'];
      artistObj = data['artistObj'];
      children = nowPlaying.children;

  nowPlaying.style.display = "block";
  for (var i=0; i < children.length; i++) {
    children[i].remove();
  }
  // nowPlayingName.innerHTML = artistObj.username;
  nowPlaying.innerHTML = artistObj.username;
  
  nowPlaying.appendChild(makeHTMLTag('span', {
    'event': {
      'name': 'click',
      'func': function () { dispatchEvent('control', 'noTrack', getNewTrack, data); }
    },
    'className': 'nextButton',
    'innerHTML': 'Next'
  }));

  nowPlaying.appendChild(makeHTMLTag('span', {
    'innerHTML': 'Follow',
    'event': {
      'name': 'click',
      'func': makeSCFunc('put', '/me/followings/' + data['track'].id)
    }
  }));
  // replaceClick(nextButton, function () { dispatchEvent('control', 'noTrack', getNewTrack, data); });
  // replaceClick(followButton, makeSCFunc('put', '/me/followings/' + currently_playing_id));
}