// HTML elements in the view
var viewElements = {
  'nowPlaying': getById('nowPlaying'),
  'nowPlayingName': getById('nowPlayingName'),
  'nextButton': getById('nextButton'),
  'followButton': getById('followButton'),
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
    'event': {'name': 'click', 'func': makeSCFunc('put', '/me/favorites/' + track.id) }
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
      nowPlayingName = viewElements['nowPlayingName'],
      nextButton = viewElements['nextButton'],
      followButton = viewElements['followButton'];

  nowPlaying.style.display = "block";
  nowPlayingName.innerHTML = artistObject.username;
  replaceClick(nextButton, genericCallback(artistObject, playExistingTrackList));
  replaceClick(followButton, makeSCFunc('put', '/me/followings/' + currently_playing_id));
}