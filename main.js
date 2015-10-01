 
(function () {
  window.app = {};
  app.api_callers = {};
  app.events = {};
  app.data = {};
  app.views = {};
  app.main = {};
})();
// global variables
app.data['SCInfo'] = {
  oauth_token: "1-134128-151865822-72dca35449925",
  client_id: '3cfc276356e86e5aa30290c4362ed56d',
  redirect_uri: 'http://localhost:8000/callback.html'
};

app.data['playBack'] = {
  continuousPlay: false,
  maxPlays: 3,
  playCount: 0,
  followings: []
};

var continuousPlay = false, maxPlays = 3, playCount, followings;

function playATrack(data) {
  var tracksLeft = viewElements['tracksLeft'];
  if (parseInt(viewElements['tracksLeft'].innerHTML, 10) > 0) {
    updateTrackInfo(track, current_track_list.length);
    updateNowPlaying(currently_playing_artist);
    updatePlayerandPlay(track);
  }
}

function getNewTrack(data) {
  var artist = data['artistObj'];
      list = data['list'];
  // var artist = currently_playing_artist ? currently_playing_artist : pickRandomArtist(),
  //     track;
  console.log(data);
  if (list && list.length === 0) {
    dispatchEvent('control', 'noArtist', getNewArtist, data);
    return false;
  }

  do {
    track = list.popRandomIndex();
  } while (track && typeof(track.stream_url) === 'undefined');


  if (track) {
    data['track'] = track;
    console.log("made it to dispatching track");
    dispatchEvent('control', 'yesTrack', updateView, data);
  } else {
    dispatchEvent('control', 'noTrack', decideNextArtist, data); //FIX THIS
  }
}

function getNewList(data) {
  makeSCFunc('get',
              '/users/' + data['artistObj'].id + '/tracks/',
              function (trackList) {
                if (typeof(trackList) === 'undefined' || trackList.length === 0) {
                  flashWarningMessage("This artist has no tracks!");
                  dispatchEvent('control', 'noList', getNewArtist, data);
                } else {
                  data['list'] = trackList;
                  console.log('made it to newList');
                  playCount = 0;
                  dispatchEvent('control', 'yesList', getNewTrack, data);
                  return true;
                }
                return false;
              })();
}

function getNewArtist(data) {
  makeSCFunc('get', '/users/' + data['artistObj'].id + '/followings.json',
            function (followings) {
              artist = followings.popRandomIndex();
              if (artist !== false) {
                data['artistObj'] = artist;
                dispatchEvent('control', 'yesArtist', getNewList, data);
              } else 
                dispatchEvent('control', 'noArtist', decideNextArtist, data); // FIX THIS!
            })();
}

function decideNextArtist(data) {
  // if (continuousPlay) {
  data['artistObj'] = followings.popRandomIndex();
  getNewArtist(data);
  // } else {
    // dispatchEvent;
  // }
}

function pickRandomFollowing() {
  var followings = getById("container").firstElementChild.childNodes;
  return followings.getRandomMember();
}

// initialize client with app credentials
SC.initialize(SCInfo);
function onloadFollowers() {
  makeSCFunc('get', '/me', function(me) {
    var ul = makeHTMLTag('ul'), li, container = getById('container');
    SC.get('/users/' + me.id + '/followings.json', function (data) {
      if (data.length > 0) {
        data.reduce(function (prev, curr, i, arr) {
          li = makeHTMLTag('li');
          li.appendChild(makeHTMLTag('span', {
            'innerHTML': curr.username,
            'className': 'artistName',
            'event': { 'name': 'click', 
                       'func': function () {
                          dispatchEvent('control', 'noList', getNewList, {'artistObj': curr}); 
                        }
                     }
          }));
          ul.appendChild(li);
        });
        followings = data;
        container.appendChild(ul);
        initialize();
      } else {
        container.innerHTML = "No Followings";
      }
    });
  })();
}

window.onload = onloadFollowers;
// viewElements['player'].addEventListener('newArtistFound', function () {
//   playATrack();
// }, false);

// getById('player').addEventListener("ended", function () {
//   playExistingTrackList({id: currently_playing_id});
// }, false);

// getById("nextArtist").addEventListener("click", function () {
//   getAndPlayNewArtist();
// }, false);

// getById("numberofPlays").addEventListener("change", function () {
//   max_plays = getById("numberofPlays").value;
// }, false);

// getById("playAll").addEventListener("click", function () {
//   playAllTracks = !playAlltracks;
//   getById("playAll").innerHTML = playAllTracks;
// })