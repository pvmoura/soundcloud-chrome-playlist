// creates an image tag for the play button image 
function imageTag () {
  var elem = document.createElement('img');
  elem.src = "PlayButton.png";
  elem.className = "playButtonImg";
  return elem;
}

// creates span element to control radio
function makeRadioToggle (visibleText, id, className, func) {
  var clickCallback = callback({id: id}, func);
  var elem = document.createElement('span');
  elem.innerHTML = visibleText;
  elem.className = className;
  elem.addEventListener("click", clickCallback, false);
  return elem;
}

function followArtist () {
  SC.put('/me/followings/' + currently_playing_id,
    global_options, 
    function (data) {
      console.log (data);
  });
}

function makeFollowButton () {
  var elem = document.createElement('span');
  elem.innerHTML = "Follow";
  elem.addEventListener("click", followArtist, false);
  return elem;
}

function likeSong (songId) {
  return function () {
    SC.put('/me/favorites/' + songId,
      global_options,
      function (data) {
        console.log (data);
    });
  }
}

function makeLikeButton (songId) {
  var elem = document.createElement('span');
  elem.innerHTML = "Like Song";
  elem.addEventListener("click", likeSong(songId), false);
  return elem;
}

function updateNowPlayingBox(artistObject) {
  var nowPlayingBox = document.getElementById("nowPlaying");
  nowPlayingBox.innerHTML = '<span id="nowPlayingName"></span>';
  var nowPlayingName = document.getElementById("nowPlayingName");
  var nextButton = makeRadioToggle('Next', artistObject.id, 'nextButton', playExistingTrackList);
  nowPlayingName.innerHTML = artistObject.username;
  nowPlayingBox.appendChild(nextButton);
  nowPlayingBox.appendChild(makeFollowButton());
}

// Play a track after querying the SoundCloud API for a track list.
function playNewTrackList (options, artistObject) {
  var artistId = options.id, poppingIndex;
  SC.get('/users/' + artistId + '/tracks', function (trackList) {
    if (typeof(trackList) === 'undefined' || trackList.length === 0) {
      flashWarningMessage('This artist has no tracks!');
      getAndPlayNewArtist(artistId);
    } else {
      
      if (typeof(artistObject) === 'undefined')
        artistObject = trackList[0].user;
      

      
      localPlayedArtists.push(artistObject);
      poppingIndex = localUnplayedArtists.indexOfByKeyVal("id", artistObject.id);
      localUnplayedArtists.popByIndex(poppingIndex);
      current_plays = 0;
      playTrack(trackList, artistId);
      updateNowPlayingBox(artistObject);
    }
  });
  return true;
}

function playExistingTrackList (options) {
  var artistId = options.id;
  if (typeof(current_track_list) !== 'undefined' && currently_playing_id == artistId) {
    playTrack(current_track_list, artistId);
  } else {
    flashWarningMessage('Please press the play button to hear this artist');
  }
  return true;
}


function getLocalUnplayedArtist() {
  if (typeof(localUnplayedArtists) === 'undefined' || localUnplayedArtists.length === 0) {
    return false;
  }
  return localUnplayedArtists.popRandomIndex();
}

function getAndPlayNewArtist (forceId) {
  var artist;
  if (typeof(forceId) !== 'undefined') currently_playing_id = forceId;
  if (typeof(currently_playing_id) === 'undefined') {
    artist = getLocalUnplayedArtist();
    if (artist)
      playNewTrackList({id: artist.id}, artist);
    else
      flashWarningMessage('No artists to play');
  } else {
    SC.get('/users/' + currently_playing_id + '/followings.json', function (followings) {
      if (typeof(followings) === 'undefined' || followings.length == 0) {
        artist = getLocalUnplayedArtist();
      } else {
        artist = followings.popRandomIndex();
      }
      playNewTrackList({id: artist.id}, artist);
    });
  }

}

function playTrack(list, id, artistObject) {
  if (list.length == 0) {
    getAndPlayNewArtist();
    return false;
  }
  var trackNumber, track, player = document.getElementById("player");
  current_track_list = list;
  currently_playing_id = id;

  if (current_plays < max_plays || playAllTracks && current_track_list.length > 0) {
    track = current_track_list.popRandomIndex();

    if (typeof(track.stream_url) !== 'undefined') {
      player.src = track.stream_url + "?oauth_token=" + global_options['oauth_token'];
      document.getElementById("track").innerHTML = track.title;
      document.getElementById("track").appendChild(makeLikeButton(track.id));
      player.play();
      current_plays++;
      document.getElementById("tracksLeft").innerHTML = current_track_list.length;
    }
  } else {
    getAndPlayNewArtist();
  }
}

// runs on page load -- gets a users' followers (after oauthing) and creates
// a list of HTML elements that provide basic functionality 
function onloadFollowers() {
  SC.get('/me', global_options, function(me) {
    
    var id = me.id, ul = document.createElement('ul'), partial,
    container = document.getElementById("container");
    SC.get('/users/'+ id +'/followings.json', function (data) 
    {
      if (data.length > 0) {
        localUnplayedArtists = data;
        for (var i=0; i < data.length; i++) {
          partial = document.createElement('li');
          partial.appendChild(makeRadioToggle(data[i].username, data[i].id, 'artistName', playNewTrackList));
          ul.appendChild(partial);
        }
        container.appendChild(ul);
      } else {
        container.innerHTML = "No followings";
      }
    });
  });
}

// document.getElementById('show').addEventListener("click", loadFollowing);

window.onload = onloadFollowers;

// 
document.getElementById("player").addEventListener("ended", function () {
   playExistingTrackList({id: currently_playing_id}, false);
});

document.getElementById("nextArtist").addEventListener("click", function () {
  getAndPlayNewArtist();
}, false);

document.getElementById("numberofPlays").addEventListener("change", function () {
  max_plays = document.getElementById("numberofPlays").value;
}, false);

document.getElementById("playAll").addEventListener("click", function () {
  playAllTracks = !playAllTracks;
  document.getElementById("playAll").innerHTML = playAllTracks;
});