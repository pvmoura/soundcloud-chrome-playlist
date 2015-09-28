// HTML elements in the view
var viewElements = {
  'nowPlaying': getById('nowPlaying'),
  'nowPlayingName': getById('nowPlayingName'),
  'trackElem': getById("track"),
  'tracksLeft': getById("tracksLeft"),
  'player': getById("player")
};

function updateTrackInfo(track, tracksLeftNum) {
  
  var trackElem  = viewElements["trackElem"],
      tracksLeft = viewElements["tracksLeft"];
  trackElem.innerHTML = track.title;
  trackElem.appendChild(makeHTMLTag('span', {
    'innerHTML': "Like Song",
    'event': {'name': 'click', 'func': makeSCFunc('get', '/me/favorites/' + track.id) }
  }));
  tracksLeft.innerHTML = tracksLeftNum;
}

function updatePlayerandPlay(track, oauth_token) {
  if (typeof(oauth_token) === 'undefined')
    oauth_token = global_options['oauth_token'];
  
  viewElements['player'].src = track.stream_url + "?oauth_token=" + oauth_token;
  player.play();
}

function updateNowPlaying(artistObject) {
  var nowPlaying = viewElements['nowPlaying'],
      nowPlayingName = viewElements['nowPlayingName'];
  nowPlayingName.innerHTML = artistObject.username;
  
  nowPlaying.appendChild(makeHTMLTag('span', {
    'event': {
      'name': 'click',
      'func': genericCallback(artistObject, playExistingTrackList)
    },
    'className': 'nextButton',
    'innnerHTML': 'Next'
  }));

  nowPlaying.appendChild(makeHTMLTag('span', {
    'innerHTML': 'Follow',
    'event': {
      'name': 'click',
      'func': makeSCFunc('put', '/me/followings/' + currently_playing_id)
    }
  }));
}