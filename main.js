 

// global variables
var global_options = {
  "oauth_token": "1-134128-151865822-72dca35449925",
};

var SCInfo = {
  client_id: '3cfc276356e86e5aa30290c4362ed56d',
  redirect_uri: 'http://localhost:8000/callback.html'
};


var currently_playing_id,
    currently_playing_artist,
    current_track_list,
    current_plays = 0,
    playAllTracks = false,
    localPlayedArtists = [],
    localUnplayedArtists = [],
    max_plays = 3;

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
                  // current_track_list = trackList;
                  // currently_playing_artist = artistObj;
                  console.log('made it to newList');
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
  if (continuousPlay) {
    dispatchEvent('control', 'noArtist', getNewArtist, data);
  } else {
    flashWarningMessage(data);
  }
}

// function playTrack(list, artistObj) {
//   console.log('inside play track');
//   if (list.length === 0) {
//     getAndPlayNewArtist();
//     return false;
//   }

//   current_track_list = list;
//   currently_playing_id = list[0].id;
//   console.log(current_track_list);
//   if (current_plays < max_plays ||
//       playAllTracks && current_track_list.length > 0) {
//     track = current_track_list.popRandomIndex();

//     if (typeof(track.stream_url) !== 'undefined') {
//       current_plays++;
//       updateTrackInfo(track, current_track_list.length);
//       updateNowPlaying(artistObj);
//       updatePlayerandPlay(track);
//     }
//   } else {
//     getAndPlayNewArtist();
//   }
// }

// function playExistingTrackList() {
//   console.log('inside play existing track');
//   console.log(artistObj);
//   console.log(currently_playing_id);
//   console.log(current_track_list);
//   if (typeof(current_track_list) !== 'undefined' && current_track_list.length > 0) {
//     playTrack(current_track_list, artistObj);
//   } else {
//     flashWarningMessage('Please press the play button to hear this artist');
//   }
//   return true;
// }

// function playNewTrackList(artistObj) {
//   console.log("This is art");
//   console.log(artistObj);
//   makeSCFunc('get',
//               '/users/' + artistObj.id + '/tracks/',
//               function (trackList) {
//                 if (typeof(trackList) === 'undefined' || trackList.length === 0) {
//                   flashWarningMessage("This artist has no tracks!");
//                   getAndPlayNewArtist();
//                 } else {
//                   localPlayedArtists.push(artistObj);
//                   popFrom = localUnplayedArtists.indexOfByKeyVal("id", artistObj.id);
//                   console.log(popFrom);
//                   localUnplayedArtists.popByIndex(popFrom);
//                   current_plays = 0;
//                   playTrack(trackList, artistObj);
//                 }
//               })();
// }

// function getAndPlayNewArtist (forceId) {
//   var artist;
//   if (forceId) currently_playing_id = forceId;
//   if (!currently_playing_id) {
//     artist = localUnplayedArtists.popRandomIndex();
//     playNewTrackList(artist);
//   } else {
//     makeSCFunc('get', '/users/' + currently_playing_id + '/followings.json',
//                 function (followings) {
//                   artist = followings && followings.length > 0 ?
//                            followings.popRandomIndex()      :
//                            localUnplayedArtists.popRandomIndex();
//                   console.log(artist);
//                   playNewTrackList(artist);
//                 })();
//   }

// }

// function onloadFollowers() {
//   makeSCFunc('get', '/me', function(me) {
//     var ul = makeHTMLTag('ul'), partial, container = getById('container');
//     SC.get('/users/' + me.id + '/followings.json', function (data) {
//       if (data.length > 0) {
//         localUnplayedArtists = data;
//         console.log(localUnplayedArtists);
//         data.reduce(function (prev, curr, i, arr) {
//           partial = makeHTMLTag('li');
//           partial.appendChild(makeHTMLTag('span', {
//             'innerHTML': curr.username,
//             'className': 'artistName',
//             'event': { 'name': 'click', 'func': genericCallback(curr, playNewTrackList) }
//           }));
//           ul.appendChild(partial);
//         });
//         container.appendChild(ul);
//       } else {
//         container.innerHTML = "No Followings";
//       }
//     });
//   })();
// }

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