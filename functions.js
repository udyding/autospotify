const axios = require('axios');
const { access } = require('fs');
const moment = require('moment');
const schedule = require('node-schedule');
const { get } = require('request');

let dateFormat = "YYYY-M-D"

function main(playlist, limit) { // have to connect this with all playlists all at midnight
    checkSongs(playlist, limit); // init check
    let dailyCheck = schedule.scheduleJob({hour: 00, minute: 00}, function() {
        checkSongs(playlist, limit);
    });
}

/* $('a').click(function() { REPLACE THIS WITH THE INPUT FROM FRONT END TO STOP TRACKING
    clearInterval(i);
    turnOff(playlist, userRequest); INPUT FROM FRONT END SHOULD COME WITH USER REQUEST
}) */

// creates the initial playlist with all the song info
async function addSongsFirst(playlist_id, access_token) {
    try {
        const response = await axios({
            method: "get",
            url: `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?market=CA&fields=items(added_at%2Ctrack(name%2Cid%2Cartists(id)))`,
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
        let allInfo = response.data;
        let items = allInfo.items;
        let songs = [];
        let numberOfSongs = items.length;
        for (let i = 0; i < numberOfSongs; i++) {
            item = items[i];
            let artistsItems = item.track.artists; 
            let artistsId = [];
            for (let j = 0; j < artistsItems.length; j++) {
                artistsId.push(artistsItems[j].id);
            }
            let seedGenres = await getGenres(artistsId, access_token);
            let firstGenresString = '';
            if (seedGenres.length == 0) {
                firstGenresString = 'none';
            } else {
                firstGenresString = seedGenres[0].toString();
            }

            let seedTrack = items[i].track.id;
            let seedArtists = artistsId;
            let firstArtistString = artistsId[0].toString();
            let topFive = await nextFive(seedTrack, firstGenresString, firstArtistString, access_token);

            let song = {
                date_added: (items[i].added_at.split("T"))[0],
                song_id: seedTrack, // this is also the seed_tracks
                seed_artists: seedArtists, // all seeds are in string form
                seed_genres: seedGenres, // this causes the program to run slower
                is_original: true,
                is_archived: false,
                top_five: topFive
            };
            songs.push(song);
        }
        console.log(songs);
    } catch(err) {
        console.log(err.response);
    }
}


// checks songs routinely for dates since added
async function checkSongs(playlist_id, limit, access_token) {
    let songsAndInfo = addSongsFirst(playlist_id);
    for (i = 0; i < songsAndInfo.length; i++) {
        let dateAdded = songsAndInfo[i].date_added;
        let diffInDays = moment().diff(moment(dateAdded, dateFormat), 'days');
        if (diffInDays > limit) {
            songsAndInfo[i].is_archived = true;
            let top_five = songsAndInfo[i].top_five;
            //for (j = 0; j < 5; j++) {
                // IF THIS TRACK IS ALREADY IN THE DATABASE, GO ON TO NEXT ONE
                // UNTIL IT IS NOT IN THE PLAYLIST
                // IF TOP FIVE ARE ALL ALREADY IN PLAYLIST, JUST KEEP THE SONG
                // IF NOT IN PLAYLIST, ADD TO DATABASE WITH SAME FORMAT OF SONG AS ABOVE
                // BUT IS_ORIGINAL IS FALSE
            //}
        }
    console.log(songsAndInfo);
    }
}


// get the genres of an array of artists for seed_artists
async function getGenres(seed_artists, access_token) {
    let numArtists = seed_artists.length;
    let allGenres = [];
    for (i = 0; i < numArtists; i++) {
        try {
            const response = await axios({
                method: "get", 
                url: `https://api.spotify.com/v1/artists/${seed_artists[i]}`,
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });
            let artistResponse = response.data;
            let artistGenres = artistResponse.genres;
            for (j = 0; j < artistGenres.length; j++) {
                allGenres.push(artistGenres[j]);
            }
        } catch (err) {
            console.log(err.response);
        }
    }

    let uniqueGenres = allGenres.reduce(function(a,b) {
        if (a.indexOf(b) < 0) a.push(b);
        return a;
    }, []);
    let topGenres = uniqueGenres.slice(0,5);
    return topGenres;
}


// get the first 5 recommended songs based on seeds
async function nextFive(seedTracks, seedGenres, seedArtists, access_token) {
    if (seedGenres != 'none') {
        try {
            const response = await axios({
                method: "get",
                url: `https://api.spotify.com/v1/recommendations?limit=5&market=CA&seed_artists=${seedArtists}&seed_genres=${seedGenres}&seed_tracks=${seedTracks}`,
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            })
            let allInfo = response.data;
            let tracksOnly = allInfo.tracks;
            let numTracks = tracksOnly.length;
            let song_ids = [];
            for (let i = 0; i < numTracks; i++) {
                song_ids.push(tracksOnly[i].id);
            };
            return song_ids; // returns an array of all 5 song ids
        } catch (err) {
        console.log(err.response)
    }
    } else {
        try {
            const response = await axios({
                method: "get",
                url: `https://api.spotify.com/v1/recommendations?limit=5&market=CA&seed_artists=${seedArtists}&seed_tracks=${seedTracks}`,
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            })
            let allInfo = response.data;
            let tracksOnly = allInfo.tracks;
            let numTracks = tracksOnly.length;
            let song_ids = [];
            for (let i = 0; i < numTracks; i++) {
                song_ids.push(tracksOnly[i].id);
            };
            return song_ids; // returns an array of all 5 song ids
        } catch (err) {
        console.log(err.response)
    }   
};
}


// when playlist is no longer tracked MODIFY THIS WITH DATABASE CONNECTION
function turnOff(playlist, userRequest) {
    let songs = playlist.songs;
    let numberOfSongs = songs.length;
    let turnOffSongs = [];

    if (userRequest == 'allSongs') {
        console.log(songs)
    }
    else if (userRequest == 'originalSongs') {
        for (let i = 0; i < numberOfSongs; i++) {
            if (songs[i].isOriginal == true) {
                turnOffSongs.push(songs[i]);
            }
        }
    }
    console.log(turnOffSongs)
}

module.exports = {
    addSongsFirst,
    getGenres,
    nextFive,
}
