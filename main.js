 

// global variables
var global_options = {
  "oauth_token": "1-134128-151865822-72dca35449925",
};
var SCInfo = {
  client_id: '3cfc276356e86e5aa30290c4362ed56d',
  redirect_uri: 'http://localhost:8000/callback.html'
};
var currently_playing_id,
    current_track_list,
    current_plays = 0,
    playAllTracks = false,
    localPlayedArtists = [],
    localUnplayedArtists = [],
    max_plays = 3;

function playTrack(list, artistObject) {
  if (list.length === 0) {
    getAndPlayNewArtist();
    return false;
  }

  current_track_list = list;
  currently_playing_id = artistObject.id;

  if (current_plays < max_plays ||
      playAllTracks && current_track_list.length > 0) {
    track = current_track_list.popRandomIndex();

    if (typeof(track.stream_url) !== 'undefined') {
      current_plays++;
      updateTrackInfo(track, current_track_list.length);
      updateNowPlaying(artistObject);
      updatePlayerandPlay(track);
    }
  } else {
    getAndPlayNewArtist();
  }
}

function playExistingTrackList(artistObject) {
  var artistId = artistObject.id;
  if (typeof(current_track_list) !== 'undefined' && currently_playing_id === artistId) {
    playTrack(current_track_list, artistObject);
  } else {
    flashWarningMessage('Please press the play button to hear this artist');
  }
  return true;
}

function playNewTrackList(artistObject) {
  console.log("This is art");
  console.log(artistObject);
  makeSCFunc('get',
              '/users/' + artistObject.id + '/tracks/',
              function (trackList) {
                if (typeof(trackList) === 'undefined' || trackList.length === 0) {
                  flashWarningMessage("This artist has no tracks!");
                  getAndPlayNewArtist();
                } else {
                  localPlayedArtists.push(artistObject);
                  popFrom = localUnplayedArtists.indexOfByKeyVal("id", artistObject.id);
                  localUnplayedArtists.popByIndex(popFrom);
                  current_plays = 0;
                  playTrack(trackList, artistObject);
                }
              })();
}

function getAndPlayNewArtist (forceId) {
  var artist;
  if (forceId) currently_playing_id = forceId;
  if (!currently_playing_id) {
    artist = localUnplayedArtists.popRandomIndex();
    playNewTrackList(artist);
  } else {
    makeSCFunc('get', '/users/' + currently_playing_id + '/followings.json',
                function (followings) {
                  artist = followings ? followings.popRandomIndex() : localUnplayedArtists.popRandomIndex();
                  playNewTrackList(artist);
                })();
  }

}

function onloadFollowers() {
  makeSCFunc('get', '/me', function(me) {
    var ul = makeHTMLTag('ul'), partial, container = getById('container');
    SC.get('/users/' + me.id + '/followings.json', function (data) {
      if (data.length > 0) {
        localUnplayedArtists = data;
        data.reduce(function (prev, curr, i, arr) {
          partial = makeHTMLTag('li');
          partial.appendChild(makeHTMLTag('span', {
            'innerHTML': curr.username,
            'className': 'artistName',
            'event': { 'name': 'click', 'func': genericCallback(curr, playNewTrackList) }
          }));
          ul.appendChild(partial);
        });
        container.appendChild(ul);
      } else {
        container.innerHTML = "No Followings";
      }
    });
  })();
}

// initialize client with app credentials
SC.initialize(SCInfo);

window.onload = onloadFollowers;
getById('player').addEventListener("ended", function () {
  playExistingTrackList({id: currently_playing_id});
}, false);

getById("nextArtist").addEventListener("click", function () {
  getAndPlayNewArtist();
}, false);

getById("numberofPlays").addEventListener("change", function () {
  max_plays = getById("numberofPlays").value;
}, false);

getById("playAll").addEventListener("click", function () {
  playAllTracks = !playAlltracks;
  getById("playAll").innerHTML = playAllTracks;
})